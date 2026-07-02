import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { CitaService } from '../../services/cita-service';
import { Cita } from '../../model/cita';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { finalize, timeout } from 'rxjs';

interface CalendarDay {
  day: number;
  date: string;
  muted: boolean;
  today: boolean;
}

@Component({
  selector: 'app-reprogram-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './reprogram-appointment-component.html',
  styleUrl: './reprogram-appointment-component.css',
})
export class ReprogramAppointmentComponent implements OnInit {
  selectedSlot = '';
  newDate = '';
  reason = '';
  errorMessage = '';
  successDateText = '';
  successTimeText = '';
  successOldDateTime = '';
  successNewDateTime = '';
  successProfessional = '';
  loading = false;
  saving = false;
  cita?: Cita;

  slots = ['08:00', '09:00', '10:00', '11:30', '13:00', '15:00', '16:30', '17:30', '18:00'];
  monthCursor = new Date();
  calendarDays: CalendarDay[] = [];

  constructor(private auth: AuthService, private citaService: CitaService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.buildCalendar();
    const user = this.auth.requireUser();

    if (!user.pacienteId) {
      this.errorMessage = 'Tu sesion no tiene un perfil de paciente asociado.';
      return;
    }

    this.loading = true;
    this.citaService.listarPorPaciente(user.pacienteId)
      .pipe(
        timeout(10000),
        finalize(() => this.cdr.detectChanges()),
      )
      .subscribe({
        next: citas => {
          this.loading = false;
          const ordered = [...(citas || [])].sort((a, b) => new Date(a.fecha || '').getTime() - new Date(b.fecha || '').getTime());
          this.cita = ordered.find(c => c.estadoCitaId !== 4 && c.estadoCitaId !== 5) || ordered[0];
          if (!this.cita) {
            this.errorMessage = 'No tienes una cita disponible para reprogramar.';
          }
        },
        error: err => {
          this.loading = false;
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'La carga de la cita tardo demasiado. Verifica que el backend este activo.'
            : 'No se pudo cargar la cita.';
        },
      });
  }

  get currentDateText(): string {
    return this.parseDate(this.cita?.fecha).dateText;
  }

  get currentTimeText(): string {
    return this.parseDate(this.cita?.fecha).timeText;
  }

  get currentProfessional(): string {
    return this.cita?.nombreProfesional || 'Profesional asignado';
  }

  get monthLabel(): string {
    return this.monthCursor.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  }

  get selectedDateText(): string {
    if (!this.newDate) return 'Selecciona fecha';
    return this.parseDate(`${this.newDate}T00:00:00`).dateText;
  }

  get selectedTimeText(): string {
    return this.selectedSlot ? this.formatSlot(this.selectedSlot) : 'Selecciona horario';
  }

  confirm(): void {
    this.errorMessage = '';
    this.successDateText = '';
    this.successTimeText = '';
    this.successOldDateTime = '';
    this.successNewDateTime = '';
    this.successProfessional = '';

    if (!this.cita?.idCita) {
      this.errorMessage = 'No se encontro una cita para reprogramar.';
      return;
    }

    if (!this.newDate || !this.selectedSlot) {
      this.errorMessage = 'Selecciona nueva fecha y horario.';
      return;
    }

    const nextDate = new Date(`${this.newDate}T${this.selectedSlot}:00`);
    if (Number.isNaN(nextDate.getTime()) || nextDate <= new Date()) {
      this.errorMessage = 'Selecciona una fecha y hora futura.';
      return;
    }

    this.saving = true;
    this.citaService.reprogramar(this.cita.idCita, `${this.newDate}T${this.selectedSlot}:00`)
      .pipe(
        timeout(10000),
        finalize(() => this.cdr.detectChanges()),
      )
      .subscribe({
        next: () => {
          this.saving = false;
          this.successOldDateTime = this.currentDateText + ' - ' + this.currentTimeText;
          this.successProfessional = this.currentProfessional;
          this.successDateText = this.selectedDateText;
          this.successTimeText = this.selectedTimeText;
          this.successNewDateTime = this.successDateText + ' - ' + this.successTimeText;
          const nextValue = this.newDate + 'T' + this.selectedSlot + ':00';
          this.cita = { ...this.cita!, fecha: nextValue };
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'El backend no respondio a tiempo. Intenta nuevamente.'
            : err?.error?.message || 'No se pudo reprogramar la cita.';
        },
      });
  }

  selectDate(date: string, muted: boolean): void {
    if (muted) return;
    this.newDate = date;
    this.successDateText = '';
    this.successTimeText = '';
    this.successOldDateTime = '';
    this.successNewDateTime = '';
    this.successProfessional = '';
    this.errorMessage = '';
  }

  selectSlot(slot: string): void {
    this.selectedSlot = slot;
    this.successDateText = '';
    this.successTimeText = '';
    this.successOldDateTime = '';
    this.successNewDateTime = '';
    this.successProfessional = '';
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

  parseDate(value?: string): { dateText: string; timeText: string } {
    if (!value) return { dateText: '--', timeText: '--:--' };
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { dateText: value, timeText: '--:--' };
    return {
      dateText: date.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' }),
      timeText: date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  formatSlot(slot: string): string {
    return new Date(`2026-01-01T${slot}:00`).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  goBack(): void {
    this.router.navigate(['/agendar-cita']);
  }

  goAppointments(): void {
    this.router.navigate(['/agendar-cita']);
  }

  logout(): void {
    this.auth.logout();
  }
}