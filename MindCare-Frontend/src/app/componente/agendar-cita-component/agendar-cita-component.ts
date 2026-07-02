import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { CitaService } from '../../services/cita-service';
import { ValoracionService } from '../../services/valoracion-service';
import { Cita } from '../../model/cita';
import { Valoracion } from '../../model/valoracion';
import { MatButtonModule } from '@angular/material/button';
import { finalize, timeout } from 'rxjs';

import { SidebarComponent } from '../sidebar-component/sidebar-component';

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, SidebarComponent],
  templateUrl: './agendar-cita-component.html',
  styleUrl: './agendar-cita-component.css',
})
export class AgendarCitaComponent implements OnInit {
  appointments: Cita[] = [];
  loading = false;

  // Rating / Valoraciones State
  reviewsByCita: Record<number, any> = {};
  activeRatingFormId?: number;
  ratingScore = 0;
  ratingComment = '';
  submittingRating = false;

  constructor(
    private auth: AuthService,
    private citaService: CitaService,
    private valoracionService: ValoracionService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.auth.requireUser();
    if (!user.pacienteId) {
      this.appointments = [];
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
          this.appointments = citas || [];
          this.loadReviewsForHistory();
        },
        error: () => {
          this.loading = false;
          this.appointments = [];
        },
      });
  }

  get upcoming(): Cita[] {
    return this.appointments.filter(a => a.estadoCitaId !== 4 && a.estadoCitaId !== 5);
  }

  get nextAppointment(): Cita | undefined {
    return this.upcoming[0];
  }

  get history(): Cita[] {
    return [...this.appointments].slice(-4).reverse();
  }

  get confirmedCount(): number {
    return this.appointments.filter(a => a.estadoCitaId === 2).length;
  }

  get pendingCount(): number {
    return this.appointments.filter(a => !a.estadoCitaId || a.estadoCitaId === 1).length;
  }

  statusText(estadoId?: number): string {
    if (estadoId === 2) return 'CONFIRMADA';
    if (estadoId === 3) return 'REPROGRAMADA';
    if (estadoId === 4) return 'CANCELADA';
    if (estadoId === 5) return 'FINALIZADA';
    return 'PENDIENTE';
  }

  statusClass(estadoId?: number): string {
    const status = this.statusText(estadoId).toLowerCase();
    if (status.includes('cancel')) return 'cancelada';
    if (status.includes('pend')) return 'pendiente';
    return 'confirmada';
  }

  patientAppointmentStateText(cita?: Cita): string {
    const status = this.statusText(cita?.estadoCitaId);
    if (!cita) return 'Sin cita programada';
    if (status === 'PENDIENTE') return 'Esperando confirmacion del profesional';
    if (status === 'CONFIRMADA') return 'Cita confirmada por el profesional';
    if (status === 'REPROGRAMADA') return 'Nuevo horario pendiente de confirmacion profesional';
    if (status === 'FINALIZADA') return 'Cita finalizada';
    if (status === 'CANCELADA') return 'Cita cancelada';
    return status;
  }

  parseDateTime(value?: string): { month: string; day: string; dateText: string; timeText: string } {
    if (!value) return { month: '--', day: '--', dateText: '--', timeText: '--:--' };
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { month: '--', day: '--', dateText: value, timeText: '--:--' };
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return {
      month: months[date.getMonth()],
      day: String(date.getDate()).padStart(2, '0'),
      dateText: date.toLocaleDateString(),
      timeText: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  goBookAppointment(): void {
    this.router.navigate(['/book-appointment']);
  }

  logout(): void {
    this.auth.logout();
  }

  loadReviewsForHistory(): void {
    const historyAppointments = this.history;
    historyAppointments.forEach(appt => {
      if (appt.idCita && appt.profesionalId) {
        const citaId = appt.idCita;
        this.valoracionService.listarPorProfesional(appt.profesionalId).subscribe({
          next: list => {
            const review = (list || []).find(r => r.citaId === citaId);
            if (review) {
              this.reviewsByCita[citaId] = review;
            }
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  openRatingForm(citaId: number): void {
    this.activeRatingFormId = citaId;
    this.ratingScore = 0;
    this.ratingComment = '';
  }

  cancelRatingForm(): void {
    this.activeRatingFormId = undefined;
    this.ratingScore = 0;
    this.ratingComment = '';
  }

  setRatingScore(score: number): void {
    this.ratingScore = score;
  }

  getStars(score: number): string {
    return '★'.repeat(score) + '☆'.repeat(5 - score);
  }

  submitRating(cita: Cita): void {
    if (!cita.idCita || this.ratingScore === 0) return;

    const user = this.auth.requireUser();
    const payload: Valoracion = {
      citaId: cita.idCita,
      puntuacion: this.ratingScore,
      comentario: this.ratingComment,
      pacienteId: user.pacienteId,
      profesionalId: cita.profesionalId
    };

    this.submittingRating = true;
    this.valoracionService.registrar(payload).subscribe({
      next: saved => {
        this.reviewsByCita[cita.idCita as number] = saved;
        this.cancelRatingForm();
        this.submittingRating = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('No se pudo registrar la valoración para esta cita.');
        this.submittingRating = false;
        this.cdr.detectChanges();
      }
    });
  }
}