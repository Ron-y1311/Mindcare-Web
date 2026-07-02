import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { TrackingService } from '../../services/tracking-service';
import { CatalogoItem, CatalogoService } from '../../services/catalogo-service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { finalize, timeout } from 'rxjs';

interface MoodOption {
  nombre: string;
  icon: string;
}

import { SidebarComponent } from '../sidebar-component/sidebar-component';

@Component({
  selector: 'app-emotion-log',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatFormFieldModule, MatInputModule, SidebarComponent],
  templateUrl: './emotion-log-component.html',
  styleUrl: './emotion-log-component.css',
})
export class EmotionLogComponent implements OnInit {
  selectedMood = 'Tranquilo';
  fecha = new Date().toISOString().slice(0, 10);
  intensidad = 7;
  nota = '';
  reflexionDescripcion = '';
  errorMessage = '';
  success = false;
  loading = false;
  estados: CatalogoItem[] = [];

  moods: MoodOption[] = [
    { nombre: 'Feliz', icon: 'sentiment_very_satisfied' },
    { nombre: 'Tranquilo', icon: 'sentiment_satisfied' },
    { nombre: 'Ansioso', icon: 'sentiment_neutral' },
    { nombre: 'Triste', icon: 'sentiment_dissatisfied' },
    { nombre: 'Estresado', icon: 'mood_bad' },
    { nombre: 'Motivado', icon: 'rocket_launch' },
  ];

  constructor(
    private auth: AuthService,
    private tracking: TrackingService,
    private catalogo: CatalogoService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    try {
      this.auth.requireUser();
    } catch {
      this.router.navigate(['/login']);
      return;
    }

    this.catalogo.listarEstadosAnimo()
      .pipe(timeout(10000), finalize(() => this.cdr.detectChanges()))
      .subscribe({
        next: estados => this.estados = Array.isArray(estados) ? estados : [],
        error: () => this.estados = [],
      });
  }

  selectMood(mood: string): void {
    this.selectedMood = mood;
    this.errorMessage = '';
  }

  submit(): void {
    this.success = false;
    this.errorMessage = '';
    const user = this.auth.requireUser();
    const estadoAnimoId = this.resolveEstadoAnimoId(this.selectedMood);
    const nota = this.nota.trim();
    const reflexionDescripcion = this.reflexionDescripcion.trim();

    if (!user.pacienteId) {
      this.errorMessage = 'Tu sesion no tiene un perfil de paciente asociado. Cierra sesion y vuelve a ingresar.';
      this.cdr.detectChanges();
      return;
    }

    if (!estadoAnimoId) {
      this.errorMessage = 'Selecciona un estado de animo valido.';
      this.cdr.detectChanges();
      return;
    }

    if (!nota) {
      this.errorMessage = 'Escribe una breve descripcion antes de guardar el registro.';
      this.cdr.detectChanges();
      return;
    }

    if (!reflexionDescripcion) {
      this.errorMessage = 'Escribe tu reflexion personal antes de guardar el registro.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.tracking.registrarEstadoEmocional({
      pacienteId: user.pacienteId,
      estadoAnimoId,
      fecha: `${this.fecha}T00:00:00`,
      numeroIntensidad: Number(this.intensidad),
      nota,
      reflexionDescripcion,
    })
      .pipe(timeout(10000), finalize(() => this.cdr.detectChanges()))
      .subscribe({
        next: () => this.done(),
        error: (err) => {
          this.loading = false;
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'El backend no respondio a tiempo. Intenta nuevamente.'
            : err?.error?.message || 'No se pudo registrar el estado emocional.';
        },
      });
  }

  resolveEstadoAnimoId(nombre: string): number | undefined {
    const normalized = nombre.toLowerCase();
    const found = this.estados.find(e => (e.nombre || '').toLowerCase() === normalized);
    if (found?.idEstadoAnimo) return found.idEstadoAnimo;

    const fallback: Record<string, number> = {
      tranquilo: 1,
      ansioso: 2,
      triste: 3,
      motivado: 4,
      feliz: 5,
      estresado: 6,
    };
    return fallback[normalized];
  }

  done(): void {
    this.loading = false;
    this.success = true;
    this.router.navigate(['/emotion-history']);
  }

  cancel(): void {
    this.router.navigate(['/patient-dashboard']);
  }

  logout(): void {
    this.auth.logout();
  }
}



