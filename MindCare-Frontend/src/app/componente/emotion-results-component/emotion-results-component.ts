import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { timeout } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../services/auth-service';
import { EncuestaService } from '../../services/encuesta-service';
import { Encuesta } from '../../model/encuesta';
import { RecomendacionService } from '../../services/recomendacion-service';
import { Recomendacion } from '../../model/recomendacion';
import { SidebarComponent } from '../sidebar-component/sidebar-component';

interface ChartPoint {
  x: number;
  y: number;
  value: number;
  label: string;
}

@Component({
  selector: 'app-emotion-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatTableModule, SidebarComponent],
  templateUrl: './emotion-results-component.html',
  styleUrl: './emotion-results-component.css',
})
export class EmotionResultsComponent implements OnInit {
  encuestas: Encuesta[] = [];
  chartPoints: ChartPoint[] = [];
  chartLine = '';
  chartArea = '';
  analysisText = 'Aun no hay encuesta registrada.';
  recomendacion?: Recomendacion;
  userInitial = 'P';
  loading = false;
  errorMessage = '';
  displayedColumns = ['fecha', 'tipo', 'bienestar', 'interpretacion'];

  constructor(
    private auth: AuthService,
    private encuestaService: EncuestaService,
    private recomendacionService: RecomendacionService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.auth.requireUser();
    this.userInitial = (user.nombre || user.correo || 'P').charAt(0).toUpperCase();

    if (!user.pacienteId) {
      this.prepareEmpty();
      return;
    }

    this.loading = true;
    this.loadRecommendation(user.pacienteId);
    this.encuestaService.listarResultados(user.pacienteId)
      .pipe(timeout(8000))
      .subscribe({
        next: arr => {
          this.loading = false;
          this.errorMessage = '';
          this.encuestas = arr || [];
          this.updateAnalysis();
          this.prepareChart();
          this.cdr.detectChanges();
        },
        error: err => {
          this.loading = false;
          this.encuestas = [];
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'La carga de resultados tardo demasiado. Verifica que el backend este activo.'
            : 'No se pudieron cargar los resultados de encuestas.';
          this.updateAnalysis();
          this.prepareChart();
          this.cdr.detectChanges();
        },
      });
  }

  loadRecommendation(pacienteId: number): void {
    this.recomendacionService.resumen(pacienteId)
      .pipe(timeout(8000))
      .subscribe({
        next: recomendacion => {
          this.recomendacion = recomendacion;
          this.analysisText = recomendacion?.mensajePrincipal || this.analysisText;
          this.cdr.detectChanges();
        },
        error: () => {
          this.recomendacion = undefined;
          this.cdr.detectChanges();
        },
      });
  }

  prepareEmpty(): void {
    this.encuestas = [];
    this.updateAnalysis();
    this.prepareChart();
    this.cdr.detectChanges();
  }

  get last(): Encuesta | undefined {
    return this.encuestas[this.encuestas.length - 1];
  }

  get lastScore(): string {
    return this.last ? String(Number(this.last.resultadoTotal || 0)) : '--';
  }

  get level(): string {
    const value = Number(this.last?.resultadoTotal || 0);
    if (!this.last) return 'Sin datos';
    return value >= 75 ? 'Alto' : value >= 50 ? 'Medio' : 'Bajo';
  }

  get trend(): string {
    if (this.recomendacion?.tendencia) return this.recomendacion.tendencia;
    if (this.encuestas.length < 2) return 'Seguimiento activo';
    const current = Number(this.encuestas[this.encuestas.length - 1].resultadoTotal || 0);
    const previous = Number(this.encuestas[this.encuestas.length - 2].resultadoTotal || 0);
    if (current > previous) return 'Mejorando';
    if (current < previous) return 'En observacion';
    return 'Estable';
  }

  get recentEncuestas(): Encuesta[] {
    return [...this.encuestas].slice(-8).reverse();
  }

  updateAnalysis(): void {
    if (this.recomendacion?.mensajePrincipal) {
      this.analysisText = this.recomendacion.mensajePrincipal;
      return;
    }

    const bienestar = Number(this.last?.resultadoTotal || 0);
    this.analysisText = this.last
      ? `${this.last.interpretacionResultado || this.interpretation(bienestar)} Recomendacion: manten habitos de respiracion y descanso.`
      : 'Aun no hay encuesta registrada.';
  }

  prepareChart(): void {
    if (this.encuestas.length === 0) {
      this.chartPoints = [];
      this.chartLine = '';
      this.chartArea = '';
      return;
    }

    const data = this.encuestas.slice(-8).map(e => ({
      bienestar: Number(e.resultadoTotal || 0),
      fecha: this.formatDateShort(e.fechaRegistro),
    }));
    const width = 500;
    const height = 240;
    const left = 70;
    const right = 45;
    const top = 30;
    const bottom = 65;
    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;
    const x = (i: number) => left + (i * chartWidth) / Math.max(data.length - 1, 1);
    const y = (value: number) => top + chartHeight - (value / 100) * chartHeight;

    this.chartPoints = data.map((d, i) => ({
      x: x(i),
      y: y(d.bienestar),
      value: d.bienestar,
      label: d.fecha,
    }));
    this.chartLine = this.chartPoints.map(point => `${point.x},${point.y}`).join(' ');
    this.chartArea = `${left},${height - bottom} ${this.chartLine} ${width - right},${height - bottom}`;
  }

  interpretation(value: number): string {
    if (value >= 75) return 'Bienestar alto';
    if (value >= 50) return 'Bienestar medio';
    return 'Requiere atencion';
  }

  formatDate(fecha?: string): string {
    if (!fecha) return '--';
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

