import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize, timeout } from 'rxjs';
import { CitaService } from '../../services/cita-service';
import { AuthService } from '../../services/auth-service';
import { ProfesionalService } from '../../services/profesional-service';
import { Profesional } from '../../model/profesional';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface CalendarDay {
  day: number;
  date: string;
  muted: boolean;
  today: boolean;
}

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './book-appointment-component.html',
  styleUrl: './book-appointment-component.css',
})
export class BookAppointmentComponent implements OnInit {
  selectedProfessional: Profesional | null = null;
  selectedSlot = '';
  appointmentDate = '';
  motivoConsulta = '';
  notas = '';
  errorMessage = '';
  professionalMessage = '';
  successConfirmed = false;
  successDateTime = '';
  successProfessional = '';
  loading = false;
  loadingProfessionals = false;
  professionals: Profesional[] = [];
  slots = ['09:00', '10:30', '12:00', '15:00', '16:30', '18:00'];
  monthCursor = new Date();
  calendarDays: CalendarDay[] = [];

  constructor(
    private auth: AuthService,
    private profesionalService: ProfesionalService,
    private citaService: CitaService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.auth.requireUser();
    this.buildCalendar();
    this.loadProfessionals();
  }

  loadProfessionals(): void {
    this.loadingProfessionals = true;
    this.professionalMessage = '';
    this.errorMessage = '';
    this.selectedProfessional = null;
    this.selectedSlot = '';

    this.profesionalService.listar()
      .pipe(
        timeout(8000),
        finalize(() => {
          this.loadingProfessionals = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: profesionales => {
          this.professionals = (profesionales || []).filter((p: Profesional) => {
            const estado = (p.estadoValidacion || 'APROBADO').trim().toUpperCase();
            return estado === 'APROBADO';
          });

          this.selectedProfessional = this.professionals[0] || null;

          if (!this.selectedProfessional) {
            this.professionalMessage = 'No hay profesionales aprobados disponibles.';
          }
        },
        error: err => {
          this.professionals = [];
          this.selectedProfessional = null;
          this.professionalMessage = err?.status === 401
            ? 'Tu sesion expiro. Inicia sesion nuevamente para ver profesionales.'
            : err?.name === 'TimeoutError'
              ? 'La carga de profesionales tardo demasiado. Verifica que el backend este activo y vuelve a intentarlo.'
              : 'No se pudieron cargar los profesionales disponibles.';
        },
      });
  }

  selectProfessional(professional: Profesional): void {
    this.selectedProfessional = professional;
    this.successConfirmed = false;
    this.selectedSlot = '';
    this.errorMessage = '';
    this.professionalMessage = '';
  }

  selectSlot(slot: string): void {
    if (!this.selectedProfessional) {
      this.errorMessage = 'Selecciona un profesional antes de elegir horario.';
      return;
    }

    if (!this.appointmentDate) {
      this.errorMessage = 'Selecciona una fecha antes de elegir horario.';
      return;
    }

    this.selectedSlot = slot;
    this.successConfirmed = false;
    this.errorMessage = '';
  }

  selectDate(date: string, muted: boolean): void {
    if (muted) return;

    if (!this.selectedProfessional) {
      this.errorMessage = 'Selecciona un profesional antes de elegir fecha.';
      return;
    }

    this.appointmentDate = date;
    this.successConfirmed = false;
    this.selectedSlot = '';
    this.errorMessage = '';
  }

  previousMonth(): void {
    this.monthCursor = new Date(this.monthCursor.getFullYear(), this.monthCursor.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth(): void {
    this.monthCursor = new Date(this.monthCursor.getFullYear(), this.monthCursor.getMonth() + 1, 1);
    this.buildCalendar();
  }

  buildCalendar(): void {
    const year = this.monthCursor.getFullYear();
    const month = this.monthCursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const mondayIndex = (firstDay.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - mondayIndex);
    const today = new Date().toISOString().slice(0, 10);

    this.calendarDays = Array.from({ length: 35 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const iso = date.toISOString().slice(0, 10);
      return {
        day: date.getDate(),
        date: iso,
        muted: date.getMonth() !== month || iso < today,
        today: iso === today,
      };
    });
  }

  isSelectedProfessional(professional: Profesional): boolean {
    return this.selectedProfessional?.idProfesional === professional.idProfesional;
  }

  get monthLabel(): string {
    return this.monthCursor.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  }

  get professionalSummary(): string {
    return this.selectedProfessional?.nombre || this.selectedProfessional?.correo || 'Selecciona un profesional';
  }

  get dateSummary(): string {
    if (!this.appointmentDate) return 'Selecciona fecha';
    return new Date(`${this.appointmentDate}T00:00:00`).toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  get slotSummary(): string {
    return this.selectedSlot ? `${this.formatSlot(this.selectedSlot)} (1h sesion)` : 'Selecciona horario';
  }

  get selectedSpecialty(): string {
    return this.selectedProfessional?.especialidad || 'Especialista MindCare';
  }

  get canPickSchedule(): boolean {
    return !this.loadingProfessionals && !!this.selectedProfessional;
  }

  tags(professional: Profesional): string[] {
    return (professional.etiquetas || professional.especialidad || 'Bienestar emocional')
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  formatSlot(slot: string): string {
    return new Date(`2026-01-01T${slot}:00`).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  confirm(): void {
    this.errorMessage = '';
    this.successConfirmed = false;
    const user = this.auth.requireUser();
    const motivo = this.motivoConsulta.trim();

    if (!user.pacienteId) {
      this.errorMessage = 'Tu sesion no tiene un perfil de paciente asociado.';
      return;
    }

    if (this.loadingProfessionals) {
      this.errorMessage = 'Espera a que carguen los profesionales.';
      return;
    }

    if (!this.selectedProfessional?.idProfesional) {
      this.errorMessage = 'Selecciona un profesional disponible.';
      return;
    }

    if (!this.appointmentDate || !this.selectedSlot || !motivo) {
      this.errorMessage = 'Completa fecha, horario y motivo.';
      return;
    }

    const appointmentDateTime = new Date(`${this.appointmentDate}T${this.selectedSlot}:00`);
    if (Number.isNaN(appointmentDateTime.getTime()) || appointmentDateTime <= new Date()) {
      this.errorMessage = 'Selecciona una fecha y hora futura.';
      return;
    }

    this.loading = true;
    this.citaService.agendar({
      pacienteId: user.pacienteId,
      profesionalId: this.selectedProfessional.idProfesional,
      fecha: `${this.appointmentDate}T${this.selectedSlot}:00`,
      motivoConsulta: motivo,
      nota: this.notas.trim(),
    }).pipe(
      timeout(10000),
      finalize(() => this.cdr.detectChanges()),
    ).subscribe({
      next: () => {
        this.loading = false;
        this.successConfirmed = true;
        this.successDateTime = this.dateSummary + ' - ' + this.formatSlot(this.selectedSlot);
        this.successProfessional = this.professionalSummary;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.name === 'TimeoutError'
          ? 'El backend no respondio a tiempo. Intenta nuevamente.'
          : err?.error?.message || 'No se pudo agendar la cita.';
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/agendar-cita']);
  }

  logout(): void {
    this.auth.logout();
  }
}