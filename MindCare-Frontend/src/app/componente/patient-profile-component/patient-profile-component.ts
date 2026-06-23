//Implemenatacion de la pantalla de perfil del paciente en TypeScript
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { PacienteService } from '../../services/paciente-service';
import { Paciente } from '../../model/paciente';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { finalize, timeout } from 'rxjs';

import { SidebarComponent } from '../sidebar-component/sidebar-component';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatFormFieldModule, MatInputModule, SidebarComponent],
  templateUrl: './patient-profile-component.html',
  styleUrl: './patient-profile-component.css',
})
export class PatientProfileComponent implements OnInit {
  pacienteId?: number;
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  profile: Paciente = {
    nombre: '',
    username: '',
    correo: '',
    edad: 0,
    genero: 'otro',
    fechaNacimiento: '',
    telefono: '',
    contactoEmergencia: '',
  };

  constructor(
    private auth: AuthService,
    private pacienteService: PacienteService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.auth.requireUser();
    this.pacienteId = user.pacienteId;
    this.profile = {
      ...this.profile,
      usuarioId: user.usuarioId || user.idUsuario,
      nombre: user.nombre || 'Paciente MindCare',
      username: user.username || this.usernameFromEmail(user.correo),
      correo: user.correo,
    };

    if (!this.pacienteId) {
      this.errorMessage = 'Tu sesion no tiene un perfil de paciente asociado.';
      return;
    }

    this.loading = true;
    this.pacienteService.obtener(this.pacienteId)
      .pipe(
        timeout(10000),
        finalize(() => this.cdr.detectChanges()),
      )
      .subscribe({
        next: paciente => {
          this.loading = false;
          this.errorMessage = '';
          this.profile = {
            ...this.profile,
            ...paciente,
            genero: paciente.genero?.toLowerCase() || 'otro',
            fechaNacimiento: this.normalizeDate(paciente.fechaNacimiento),
          };
        },
        error: err => {
          this.loading = false;
          if (this.hasSessionProfile()) {
            this.errorMessage = '';
            return;
          }
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'La carga del perfil tardo demasiado. Verifica que el backend este activo.'
            : 'No se pudo cargar la informacion del perfil.';
        },
      });
  }

  guardar(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.pacienteId) {
      this.errorMessage = 'No se encontro el perfil de paciente.';
      return;
    }

    if (!this.profile.nombre?.trim() || !this.profile.correo?.trim()) {
      this.errorMessage = 'Nombre y correo son obligatorios.';
      return;
    }

    if (!this.profile.genero || !this.profile.fechaNacimiento) {
      this.errorMessage = 'Genero y fecha de nacimiento son obligatorios.';
      return;
    }

    if (!this.isPhone(this.profile.telefono) || !this.isPhone(this.profile.contactoEmergencia)) {
      this.errorMessage = 'Telefono y contacto de emergencia deben tener 9 digitos.';
      return;
    }

    this.saving = true;
    this.pacienteService.modificar(this.pacienteId, {
      ...this.profile,
      nombre: this.profile.nombre.trim(),
      username: this.profile.username?.trim(),
      correo: this.profile.correo.trim().toLowerCase(),
    })
      .pipe(
        timeout(10000),
        finalize(() => this.cdr.detectChanges()),
      )
      .subscribe({
        next: paciente => {
          this.saving = false;
          this.profile = {
            ...this.profile,
            ...paciente,
            genero: paciente.genero?.toLowerCase() || 'otro',
            fechaNacimiento: this.normalizeDate(paciente.fechaNacimiento)
          };
          this.refreshSession();
          this.successMessage = 'Perfil actualizado correctamente.';
        },
        error: err => {
          this.saving = false;
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'El backend no respondio a tiempo. Intenta nuevamente.'
            : err?.error?.message || 'No se pudo guardar el perfil.';
        },
      });
  }

  cancelar(): void {
    this.router.navigate(['/patient-dashboard']);
  }

  changePassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  logout(): void {
    this.auth.logout();
  }

  private hasSessionProfile(): boolean {
    return Boolean(this.profile.nombre?.trim() && this.profile.correo?.trim());
  }

  private refreshSession(): void {
    const current = this.auth.currentUser();
    if (!current) return;
    localStorage.setItem('currentUser', JSON.stringify({
      ...current,
      nombre: this.profile.nombre,
      username: this.profile.username,
      correo: this.profile.correo,
    }));
  }

  private usernameFromEmail(correo?: string): string {
    return correo ? correo.split('@')[0] : 'paciente';
  }

  private normalizeDate(value?: string): string {
    return value ? value.slice(0, 10) : '';
  }

  private isPhone(value?: string): boolean {
    return /^[0-9]{9}$/.test(value || '');
  }
}
