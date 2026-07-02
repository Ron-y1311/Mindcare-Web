import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { CitaService } from '../../services/cita-service';
import { Cita } from '../../model/cita';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { finalize, timeout } from 'rxjs';

type PatientStatusFilter = 'todos' | 'pendiente' | 'seguimiento' | 'reprogramada' | 'cancelada';
type AppointmentOrder = 'reciente' | 'antigua';

import { SidebarComponent } from '../sidebar-component/sidebar-component';

@Component({
  selector: 'app-professional-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTableModule, SidebarComponent],
  templateUrl: './professional-patients-component.html',
  styleUrl: './professional-patients-component.css',
})
export class ProfessionalPatientsComponent implements OnInit {
  citas: Cita[] = [];
  search = '';
  statusFilter: PatientStatusFilter = 'todos';
  order: AppointmentOrder = 'reciente';
  loading = false;
  errorMessage = '';
  displayedColumns = ['paciente', 'edadSexo', 'telefono', 'estado', 'ultimaCita', 'acciones'];

  constructor(private auth: AuthService, private citaService: CitaService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const user = this.auth.requireUser();
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
            ? 'La carga de pacientes tardo demasiado. Verifica que el backend este activo.'
            : 'No se pudieron cargar los pacientes asignados.';
        },
      });
  }

  get pacientes(): Cita[] {
    const byPatient = new Map<number, Cita>();
    this.citas
      .slice()
      .sort((a, b) => this.timeValue(b.fecha) - this.timeValue(a.fecha))
      .forEach(c => {
        if (c.pacienteId && !byPatient.has(c.pacienteId)) byPatient.set(c.pacienteId, c);
      });

    const term = this.search.trim().toLowerCase();
    const filtered = Array.from(byPatient.values())
      .filter(c => !term || (c.nombrePaciente || '').toLowerCase().includes(term) || String(c.pacienteId || '').includes(term))
      .filter(c => this.matchesStatus(c));

    return filtered.sort((a, b) => this.order === 'reciente'
      ? this.timeValue(b.fecha) - this.timeValue(a.fecha)
      : this.timeValue(a.fecha) - this.timeValue(b.fecha));
  }

  get totalPacientes(): number {
    return this.pacientes.length;
  }

  get citasPendientes(): number {
    return this.citas.filter(c => c.estadoCitaId === 1 || c.estadoCitaId === 3).length;
  }

  get indiceSeguimiento(): number {
    if (!this.citas.length) return 0;
    const activas = this.citas.filter(c => c.estadoCitaId !== 4 && c.estadoCitaId !== 5).length;
    return Math.round((activas / this.citas.length) * 100);
  }

  patientStatus(cita: Cita): string {
    if (cita.estadoCitaId === 3) return 'Pendiente de cita';
    if (cita.estadoCitaId === 4) return 'Cancelada';
    if (cita.estadoCitaId === 5) return 'Tratamiento finalizado';
    return 'Seguimiento activo';
  }

  statusClass(cita: Cita): string {
    if (cita.estadoCitaId === 3) return 'pending';
    if (cita.estadoCitaId === 4) return 'cancelled';
    if (cita.estadoCitaId === 5) return 'finished';
    return 'active';
  }

  initials(name?: string): string {
    return (name || 'Paciente MindCare').split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
  }

  lastAppointment(value?: string): string {
    if (!value) return 'Sin cita';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  verHistorial(pacienteId?: number): void {
    if (pacienteId) {
      const paciente = this.pacientes.find(item => item.pacienteId === pacienteId);
      this.router.navigate(['/patient-clinical-history'], { queryParams: { pacienteId, nombre: paciente?.nombrePaciente || 'Paciente MindCare' } });
    }
  }

  irRegistrarNota(cita: Cita): void {
    this.router.navigate(['/professional-agenda'], {
      queryParams: {
        citaId: cita.idCita,
        pacienteId: cita.pacienteId,
      },
    });
  }

  irMedicacion(pacienteId?: number): void {
    if (!pacienteId) return;
    const paciente = this.pacientes.find(item => item.pacienteId === pacienteId);
    this.router.navigate(['/medication-management'], {
      queryParams: {
        pacienteId,
        nombre: paciente?.nombrePaciente || 'Paciente MindCare',
        citaId: paciente?.idCita,
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }

  private matchesStatus(cita: Cita): boolean {
    if (this.statusFilter === 'todos') return true;
    if (this.statusFilter === 'seguimiento') return cita.estadoCitaId !== 3 && cita.estadoCitaId !== 4 && cita.estadoCitaId !== 5;
    if (this.statusFilter === 'pendiente') return cita.estadoCitaId === 3 || cita.estadoCitaId === 1;
    if (this.statusFilter === 'reprogramada') return cita.estadoCitaId === 3;
    if (this.statusFilter === 'cancelada') return cita.estadoCitaId === 4;
    return true;
  }

  private timeValue(value?: string): number {
    const date = value ? new Date(value) : undefined;
    return !date || Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }
}



