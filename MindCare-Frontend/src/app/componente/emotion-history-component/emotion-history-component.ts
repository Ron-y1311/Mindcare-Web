import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { TrackingService } from '../../services/tracking-service';
import { Tracking } from '../../model/tracking';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { finalize, timeout } from 'rxjs';

interface ChartPoint {
  x: number;
  y: number;
  value: number;
  label: string;
}

import { SidebarComponent } from '../sidebar-component/sidebar-component';

@Component({
  selector: 'app-emotion-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatFormFieldModule, MatInputModule, SidebarComponent],
  templateUrl: './emotion-history-component.html',
  styleUrl: './emotion-history-component.css',
})
export class EmotionHistoryComponent implements OnInit {
  allRecords: Tracking[] = [];
  filteredRecords: Tracking[] = [];
  filterFrom = '';
  filterTo = '';
  filterMood = 'Todos';
  chartAvg = '--';
  avgIntensity = '-- / 10';
  lastLogTime = 'Sin registros';
  commonMood = 'Sin datos';
  chartPoints: ChartPoint[] = [];
  chartLine = '';
  chartArea = '';

  constructor(
    private auth: AuthService,
    private trackingService: TrackingService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.auth.requireUser();

    if (!user.pacienteId) {
      this.applyFilters();
      return;
    }

    this.trackingService.historialPaciente(user.pacienteId).subscribe({
      next: records => {
        this.allRecords = records || [];
        this.applyFilters();
      },
      error: () => {
        this.allRecords = [];
        this.applyFilters();
      },
    });
  }

  applyFilters(): void {
    let records = [...this.allRecords];

    if (this.filterFrom) records = records.filter(e => (e.fecha || '') >= this.filterFrom);
    if (this.filterTo) records = records.filter(e => (e.fecha || '') <= `${this.filterTo}T23:59:59`);
    if (this.filterMood !== 'Todos') {
      records = records.filter(e => this.moodName(e).toLowerCase() === this.filterMood.toLowerCase());
    }

    this.filteredRecords = records.sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
    this.updateSummary();
    this.prepareIntensityChart();
  }

  get recentRecords(): Tracking[] {
    return [...this.filteredRecords].reverse();
  }

  updateSummary(): void {
    const records = this.filteredRecords;
    if (records.length === 0) {
      this.chartAvg = '--';
      this.avgIntensity = '-- / 10';
      this.lastLogTime = 'Sin registros';
      this.commonMood = 'Sin datos';
      return;
    }

    const avgIntensity = Math.round(records.reduce((sum, e) => sum + this.intensity(e), 0) / records.length);
    this.chartAvg = `${avgIntensity} / 10`;
    this.avgIntensity = `${avgIntensity} / 10`;
    this.lastLogTime = this.formatDate(records[records.length - 1]?.fecha);
    this.commonMood = this.getMostCommonMood(records);
  }

  prepareIntensityChart(): void {
    const records = this.filteredRecords;
    if (records.length === 0) {
      this.chartPoints = [];
      this.chartLine = '';
      this.chartArea = '';
      return;
    }

    const width = 500;
    const height = 200;
    const left = 45;
    const right = 25;
    const top = 28;
    const bottom = 38;
    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;
    const data = records.slice(-10).map((e, index) => ({
      index: index + 1,
      intensidad: this.intensity(e),
      fecha: this.formatDateShort(e.fecha),
    }));
    const x = (i: number) => left + (i * chartWidth) / Math.max(data.length - 1, 1);
    const y = (value: number) => top + chartHeight - ((value - 1) / 9) * chartHeight;

    this.chartPoints = data.map((d, i) => ({
      x: x(i),
      y: y(d.intensidad),
      value: d.intensidad,
      label: d.fecha,
    }));
    this.chartLine = this.chartPoints.map(point => `${point.x},${point.y}`).join(' ');
    this.chartArea = `${left},${height - bottom} ${this.chartLine} ${width - right},${height - bottom}`;
  }

  moodName(record: Tracking): string {
    const map: Record<number, string> = { 1: 'Tranquilo', 2: 'Ansioso', 3: 'Triste', 4: 'Motivado', 5: 'Feliz', 6: 'Estresado' };
    return record.estadoAnimoNombre || map[record.estadoAnimoId || 0] || 'Sin estado';
  }

  getMostCommonMood(records: Tracking[]): string {
    const counter: Record<string, number> = {};
    records.forEach(e => {
      const mood = this.moodName(e);
      counter[mood] = (counter[mood] || 0) + 1;
    });
    return Object.entries(counter).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin datos';
  }

  intensity(record: Tracking): number {
    const value = Number(record.numeroIntensidad || 0);
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(1, Math.min(10, Math.round(value)));
  }

  wellbeing(record: Tracking): number {
    const intensity = Number(record.numeroIntensidad || 0);
    if (!Number.isFinite(intensity) || intensity <= 0) {
      return 0;
    }

    const mood = this.moodName(record).toLowerCase();
    if (this.isNegativeMood(mood)) {
      return this.clampScore((11 - intensity) * 10);
    }

    return this.clampScore(intensity * 10);
  }

  isNegativeMood(mood: string): boolean {
    return mood.includes('ansioso')
      || mood.includes('triste')
      || mood.includes('estresado')
      || mood.includes('estres')
      || mood.includes('miedo')
      || mood.includes('ira');
  }

  clampScore(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  formatDate(fecha?: string): string {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    return Number.isNaN(date.getTime()) ? fecha : date.toLocaleDateString();
  }

  formatDateShort(fecha?: string): string {
    if (!fecha) return '--';
    const date = new Date(fecha);
    return Number.isNaN(date.getTime()) ? fecha : `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  go(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.auth.logout();
  }
}
