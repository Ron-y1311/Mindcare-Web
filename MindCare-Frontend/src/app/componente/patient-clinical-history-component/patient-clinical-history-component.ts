// Consulta de historial clínico completo en TypeScript
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth-service';
import { TrackingService } from '../../services/tracking-service';
import { CitaService } from '../../services/cita-service';
import { Tracking } from '../../model/tracking';
import { Cita } from '../../model/cita';
import { catchError, finalize, forkJoin, of, timeout } from 'rxjs';

@Component({
  selector: 'app-patient-clinical-history',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule],
  templateUrl: './patient-clinical-history-component.html',
  styleUrl: './patient-clinical-history-component.css',
})
export class PatientClinicalHistoryComponent implements OnInit {
  pacienteId?: number;
  nombre = 'Paciente MindCare';
  registros: Tracking[] = [];
  citas: Cita[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private trackingService: TrackingService,
    private citaService: CitaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.auth.requireUser();
    const queryPacienteId = Number(this.route.snapshot.queryParamMap.get('pacienteId'));
    const queryNombre = this.route.snapshot.queryParamMap.get('nombre');

    this.pacienteId = Number.isFinite(queryPacienteId) && queryPacienteId > 0 ? queryPacienteId : user.pacienteId;
    this.nombre = queryNombre || user.nombre || (this.pacienteId ? `Paciente #${this.pacienteId}` : 'Paciente MindCare');

    if (!this.pacienteId) {
      this.errorMessage = 'No se pudo identificar al paciente para cargar el historial.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    forkJoin({
      registros: this.trackingService.historialPaciente(this.pacienteId).pipe(catchError(() => of([] as Tracking[]))),
      citas: this.citaService.listarPorPaciente(this.pacienteId).pipe(catchError(() => of([] as Cita[]))),
    })
      .pipe(
        timeout(10000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: data => {
          this.registros = Array.isArray(data.registros) ? data.registros : [];
          this.citas = Array.isArray(data.citas) ? data.citas : [];
          const citaConNombre = this.citas.find(c => !!c.nombrePaciente);
          if (!queryNombre && citaConNombre?.nombrePaciente) this.nombre = citaConNombre.nombrePaciente;
        },
        error: err => {
          this.registros = [];
          this.citas = [];
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'La carga del historial tardo demasiado. Verifica que el backend este activo.'
            : 'No se pudo cargar la informacion del historial clinico.';
        },
      });
  }

  get registrosOrdenados(): Tracking[] {
    return this.registros.slice().sort((a, b) => this.timeValue(b.fecha) - this.timeValue(a.fecha));
  }

  get citasOrdenadas(): Cita[] {
    return this.citas.slice().sort((a, b) => this.timeValue(b.fecha) - this.timeValue(a.fecha));
  }

  get ultimaCita(): Cita | undefined {
    return this.citasOrdenadas[0];
  }

  get ultimoRegistro(): Tracking | undefined {
    return this.registrosOrdenados[0];
  }

  get promedioIntensidad(): number {
    const values = this.registros.map(r => r.numeroIntensidad || 0).filter(value => value > 0);
    if (!values.length) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  }

  get bienestar(): number {
    if (!this.promedioIntensidad) return 0;
    return Math.max(0, Math.min(100, Math.round((this.promedioIntensidad / 10) * 100)));
  }

  get estadoActual(): string {
    return this.ultimoRegistro?.estadoAnimoNombre || 'Sin registro emocional';
  }

  initials(name = this.nombre): string {
    return name.split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
  }

  formatDate(fecha?: string): string {
    if (!fecha) return '--';
    const date = new Date(fecha);
    return Number.isNaN(date.getTime()) ? fecha : date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatDateTime(fecha?: string): string {
    if (!fecha) return '--';
    const date = new Date(fecha);
    return Number.isNaN(date.getTime()) ? fecha : `${date.toLocaleDateString('es-PE', { day: '2-digit', month: 'long' })} · ${date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
  }

  nota(registro: Tracking): string {
    return registro.nota || registro.reflexionDescripcion || 'Sin nota registrada para este seguimiento.';
  }

  estadoCita(id?: number): string {
    if (id === 2) return 'Confirmada';
    if (id === 3) return 'Reprogramada';
    if (id === 4) return 'Cancelada';
    if (id === 5) return 'Finalizada';
    return 'Pendiente';
  }

  volver(): void {
    this.router.navigate(['/professional-patients']);
  }

  irAgenda(): void {
    this.router.navigate(['/professional-agenda']);
  }

  irMedicacion(): void {
    this.router.navigate(['/medication-management'], { queryParams: { pacienteId: this.pacienteId, nombre: this.nombre, citaId: this.ultimaCita?.idCita } });
  }

  logout(): void {
    this.auth.logout();
  }

  private timeValue(value?: string): number {
    const date = value ? new Date(value) : undefined;
    return !date || Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }
}

