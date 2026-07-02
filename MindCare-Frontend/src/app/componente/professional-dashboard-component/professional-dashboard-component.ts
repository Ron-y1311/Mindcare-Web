import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { CitaService } from '../../services/cita-service';
import { Cita } from '../../model/cita';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { finalize, timeout } from 'rxjs';

import { SidebarComponent } from '../sidebar-component/sidebar-component';

@Component({
  selector: 'app-professional-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatTableModule, SidebarComponent],
  templateUrl: './professional-dashboard-component.html',
  styleUrl: './professional-dashboard-component.css',
})
export class ProfessionalDashboardComponent implements OnInit {
  nombre = 'Profesional';
  citas: Cita[] = [];
  loading = false;
  errorMessage = '';
  displayedColumns = ['paciente', 'fecha', 'motivo', 'estado'];

  constructor(private auth: AuthService, private citaService: CitaService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const user = this.auth.requireUser();
    this.nombre = user.nombre || 'Profesional';
    if (!user.profesionalId) {
      this.errorMessage = 'Tu sesion no tiene un perfil profesional asociado.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.citaService.listarPorProfesional(user.profesionalId)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: citas => this.citas = Array.isArray(citas) ? citas : [],
        error: err => {
          this.citas = [];
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'La carga de citas tardo demasiado. Verifica que el backend este activo.'
            : 'No se pudieron cargar las citas del profesional.';
        },
      });
  }

  get pacientesAsignados(): number {
    return new Set(this.citas.map(c => c.pacienteId).filter(Boolean)).size;
  }

  get citasHoy(): number {
    const today = new Date().toDateString();
    return this.citas.filter(c => c.fecha && new Date(c.fecha).toDateString() === today).length;
  }

  get proximasCitas(): Cita[] {
    return this.citas.filter(c => c.estadoCitaId !== 4 && c.estadoCitaId !== 5).slice(0, 5);
  }

  estado(id?: number): string {
    if (id === 2) return 'CONFIRMADA';
    if (id === 3) return 'REPROGRAMADA';
    if (id === 4) return 'CANCELADA';
    if (id === 5) return 'FINALIZADA';
    return 'PENDIENTE';
  }

  fecha(value?: string): string {
    if (!value) return '--';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  logout(): void {
    this.auth.logout();
  }
}