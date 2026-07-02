import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { CitaService } from '../../services/cita-service';
import { Cita } from '../../model/cita';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { finalize, timeout } from 'rxjs';

type AgendaRange = 'hoy' | 'semana' | 'mes';
type AgendaStatus = 'todos' | 'pendiente' | 'confirmada' | 'reprogramada' | 'cancelada' | 'finalizada';

import { SidebarComponent } from '../sidebar-component/sidebar-component';

@Component({
  selector: 'app-professional-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule, SidebarComponent],
  templateUrl: './professional-agenda-component.html',
  styleUrl: './professional-agenda-component.css',
})
export class ProfessionalAgendaComponent implements OnInit {
  citas: Cita[] = [];
  selectedCita?: Cita;
  requestedCitaId?: number;
  search = '';
  range: AgendaRange = 'hoy';
  status: AgendaStatus = 'todos';
  loading = false;
  errorMessage = '';
  noteSaving = false;
  noteMessage = '';
  noteError = '';
  completionSaving = false;
  completionMessage = '';
  completionError = '';
  confirmSaving = false;
  confirmMessage = '';
  confirmError = '';
  noteForm: Pick<Cita, 'nota' | 'observacionesClinicas' | 'planAccion'> = {
    nota: '',
    observacionesClinicas: '',
    planAccion: '',
  };
  displayedColumns = ['fecha', 'paciente', 'motivo', 'estado'];

  constructor(
    private auth: AuthService,
    private citaService: CitaService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.auth.requireUser();
    const citaIdParam = Number(this.route.snapshot.queryParamMap.get('citaId'));
    this.requestedCitaId = Number.isFinite(citaIdParam) && citaIdParam > 0 ? citaIdParam : undefined;

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
          this.ensureSelectedCita();
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: citas => {
          this.citas = Array.isArray(citas) ? citas : [];
          this.ensureSelectedCita();
          this.selectRequestedCita();
        },
        error: err => {
          this.citas = [];
          this.selectedCita = undefined;
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'La carga de agenda tardo demasiado. Verifica que el backend este activo.'
            : 'No se pudo cargar la agenda profesional.';
        },
      });
  }

  get filteredCitas(): Cita[] {
    const term = this.search.trim().toLowerCase();
    return this.citas
      .filter(c => this.matchesRange(c))
      .filter(c => this.matchesStatus(c))
      .filter(c => !term
        || (c.nombrePaciente || '').toLowerCase().includes(term)
        || (c.motivoConsulta || '').toLowerCase().includes(term)
        || this.estado(c.estadoCitaId).toLowerCase().includes(term))
      .sort((a, b) => this.timeValue(a.fecha) - this.timeValue(b.fecha));
  }

  get agendaDateLabel(): string {
    const base = this.selectedCita?.fecha ? new Date(this.selectedCita.fecha) : new Date();
    return Number.isNaN(base.getTime())
      ? 'Agenda actual'
      : base.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  setRange(range: AgendaRange): void {
    this.range = range;
    this.ensureSelectedCita(true);
  }

  setStatus(status: AgendaStatus): void {
    this.status = status;
    this.ensureSelectedCita(true);
  }

  selectCita(cita: Cita): void {
    this.selectedCita = cita;
    this.loadNoteForm();
    this.noteMessage = '';
    this.noteError = '';
    this.completionMessage = '';
    this.completionError = '';
    this.confirmMessage = '';
    this.confirmError = '';
  }

  isSelected(cita: Cita): boolean {
    return !!this.selectedCita && this.citaKey(this.selectedCita) === this.citaKey(cita);
  }

  initials(name?: string): string {
    const safeName = (name || 'Paciente MindCare').trim();
    return safeName.split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
  }

  timeHour(value?: string): string {
    const date = value ? new Date(value) : undefined;
    if (!date || Number.isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  timePeriod(value?: string): string {
    const date = value ? new Date(value) : undefined;
    if (!date || Number.isNaN(date.getTime())) return '';
    return date.getHours() >= 12 ? 'PM' : 'AM';
  }

  detailDate(value?: string): string {
    const date = value ? new Date(value) : undefined;
    if (!date || Number.isNaN(date.getTime())) return 'Fecha pendiente';
    return date.toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long' });
  }

  estado(id?: number): string {
    if (id === 2) return 'CONFIRMADA';
    if (id === 3) return 'REPROGRAMADA';
    if (id === 4) return 'CANCELADA';
    if (id === 5) return 'FINALIZADA';
    return 'PENDIENTE';
  }

  puedeConfirmar(cita?: Cita): boolean {
    const estado = this.estado(cita?.estadoCitaId);
    return estado === 'PENDIENTE' || estado === 'REPROGRAMADA';
  }

  permiteGestionClinica(cita?: Cita): boolean {
    const estado = this.estado(cita?.estadoCitaId);
    return estado === 'CONFIRMADA';
  }

  puedeFinalizar(cita?: Cita): boolean {
    return this.permiteGestionClinica(cita);
  }

  fecha(value?: string): string {
    if (!value) return '--';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : `${date.toLocaleDateString('es-PE')} ${date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
  }

  confirmarCita(): void {
    this.confirmMessage = '';
    this.confirmError = '';

    if (!this.selectedCita?.idCita) {
      this.confirmError = 'No se pudo identificar la cita seleccionada.';
      return;
    }

    if (!this.puedeConfirmar(this.selectedCita)) {
      this.confirmError = 'Esta cita no se puede confirmar desde su estado actual.';
      return;
    }

    this.confirmSaving = true;
    this.citaService.confirmar(this.selectedCita.idCita)
      .pipe(finalize(() => {
        this.confirmSaving = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          const updated: Cita = {
            ...this.selectedCita,
            estadoCitaId: 2,
          };
          this.selectedCita = updated;
          this.citas = this.citas.map(cita => cita.idCita === updated.idCita ? { ...cita, ...updated } : cita);
          this.confirmMessage = 'Cita confirmada correctamente.';
        },
        error: err => {
          this.confirmError = err?.error?.message || 'No se pudo confirmar la cita.';
        },
      });
  }

  guardarNotaClinica(): void {
    this.noteMessage = '';
    this.noteError = '';
    this.completionMessage = '';
    this.completionError = '';
    this.confirmMessage = '';
    this.confirmError = '';
    if (!this.selectedCita?.idCita) {
      this.noteError = 'No se pudo identificar la cita seleccionada.';
      return;
    }

    if (!this.permiteGestionClinica(this.selectedCita)) {
      this.noteError = 'Primero confirma la cita antes de registrar informacion clinica. Si fue reprogramada, debe confirmarse nuevamente.';
      return;
    }

    const payload: Cita = {
      nota: this.noteForm.nota?.trim(),
      observacionesClinicas: this.noteForm.observacionesClinicas?.trim(),
      planAccion: this.noteForm.planAccion?.trim(),
      estadoNota: 'REGISTRADA',
    };

    if (!payload.nota && !payload.observacionesClinicas && !payload.planAccion) {
      this.noteError = 'Registra al menos una nota, observacion o plan de accion.';
      return;
    }

    this.noteSaving = true;
    const request = this.hasClinicalNote(this.selectedCita)
      ? this.citaService.actualizarNotaClinica(this.selectedCita.idCita, payload)
      : this.citaService.registrarNotaClinica(this.selectedCita.idCita, payload);

    request.pipe(finalize(() => {
      this.noteSaving = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: () => {
        const updated: Cita = {
          ...this.selectedCita,
          ...payload,
          fechaNota: new Date().toISOString(),
        };
        this.selectedCita = updated;
        this.citas = this.citas.map(cita => cita.idCita === updated.idCita ? { ...cita, ...updated } : cita);
        this.noteMessage = 'Nota clinica registrada correctamente.';
      },
      error: err => {
        this.noteError = err?.error?.message || 'No se pudo guardar la nota clinica.';
      },
    });
  }

  marcarComoCompletada(): void {
    this.completionMessage = '';
    this.completionError = '';
    this.confirmMessage = '';
    this.confirmError = '';

    if (!this.selectedCita?.idCita) {
      this.completionError = 'No se pudo identificar la cita seleccionada.';
      return;
    }

    if (this.estado(this.selectedCita.estadoCitaId) === 'FINALIZADA') {
      this.completionMessage = 'La cita ya se encuentra completada.';
      return;
    }

    if (!this.puedeFinalizar(this.selectedCita)) {
      this.completionError = 'Primero confirma la cita antes de marcarla como completada. Si fue reprogramada, debe confirmarse nuevamente.';
      return;
    }

    this.completionSaving = true;
    this.citaService.finalizar(this.selectedCita.idCita)
      .pipe(finalize(() => {
        this.completionSaving = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          const updated: Cita = {
            ...this.selectedCita,
            estadoCitaId: 5,
          };
          this.selectedCita = updated;
          this.citas = this.citas.map(cita => cita.idCita === updated.idCita ? { ...cita, ...updated } : cita);
          this.completionMessage = 'Cita marcada como completada.';
        },
        error: err => {
          this.completionError = err?.error?.message || 'No se pudo completar la cita.';
        },
      });
  }

  hasClinicalNote(cita?: Cita): boolean {
    return !!(cita?.nota || cita?.observacionesClinicas || cita?.planAccion || cita?.estadoNota);
  }

  logout(): void {
    this.auth.logout();
  }

  ensureSelectedCita(force = false): void {
    const items = this.filteredCitas;
    const current = this.selectedCita;
    if (force || !current || !items.some(c => this.citaKey(c) === this.citaKey(current))) {
      this.selectedCita = items[0];
      this.loadNoteForm();
    }
  }

  private selectRequestedCita(): void {
    if (!this.requestedCitaId) return;
    const cita = this.citas.find(item => item.idCita === this.requestedCitaId);
    if (cita) {
      this.selectCita(cita);
    }
  }

  private loadNoteForm(): void {
    this.noteForm = {
      nota: this.selectedCita?.nota || '',
      observacionesClinicas: this.selectedCita?.observacionesClinicas || '',
      planAccion: this.selectedCita?.planAccion || '',
    };
  }

  private matchesStatus(cita: Cita): boolean {
    if (this.status === 'todos') return true;
    return this.estado(cita.estadoCitaId).toLowerCase() === this.status;
  }

  private matchesRange(cita: Cita): boolean {
    if (!cita.fecha) return true;
    const date = new Date(cita.fecha);
    if (Number.isNaN(date.getTime())) return true;
    const today = new Date();

    if (this.range === 'hoy') {
      return date.toDateString() === today.toDateString();
    }

    if (this.range === 'semana') {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return date >= start && date < end;
    }

    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
  }

  private timeValue(value?: string): number {
    const date = value ? new Date(value) : undefined;
    return !date || Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime();
  }

  private citaKey(cita: Cita): string {
    return `${cita.idCita || ''}-${cita.fecha || ''}-${cita.pacienteId || ''}`;
  }
}

