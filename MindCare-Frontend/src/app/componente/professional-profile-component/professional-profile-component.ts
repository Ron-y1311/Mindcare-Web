import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { ProfesionalService } from '../../services/profesional-service';
import { CatalogoItem, CatalogoService } from '../../services/catalogo-service';
import { Profesional } from '../../model/profesional';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { finalize, timeout } from 'rxjs';

import { SidebarComponent } from '../sidebar-component/sidebar-component';

@Component({
  selector: 'app-professional-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, SidebarComponent],
  templateUrl: './professional-profile-component.html',
  styleUrl: './professional-profile-component.css',
})
export class ProfessionalProfileComponent implements OnInit {
  profesional: Profesional = {};
  profesionalId?: number;
  loading = false;
  saving = false;
  message = '';
  errorMessage = '';
  dbEspecialidades: CatalogoItem[] = [];

  constructor(
    private auth: AuthService, 
    private profesionalService: ProfesionalService, 
    private catalogoService: CatalogoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.auth.requireUser();
    this.profesionalId = user.profesionalId;
    this.profesional = {
      idProfesional: user.profesionalId,
      nombre: user.nombre,
      correo: user.correo,
      username: user.correo?.split('@')[0],
      especialidadIds: []
    };

    if (!this.profesionalId) {
      this.errorMessage = 'Tu sesion no tiene un perfil profesional asociado.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.cargarEspecialidades();

    this.profesionalService.obtener(this.profesionalId)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: profesional => {
          this.profesional = { ...this.profesional, ...(profesional || {}) };
          if (!this.profesional.especialidadIds) {
            this.profesional.especialidadIds = [];
          }
        },
        error: err => {
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'La carga del perfil tardo demasiado. Verifica que el backend este activo.'
            : 'No se pudo cargar la informacion profesional.';
        },
      });
  }

  cargarEspecialidades(): void {
    this.catalogoService.listarEspecialidades().subscribe({
      next: list => {
        this.dbEspecialidades = list || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las especialidades del catálogo.';
      }
    });
  }

  get etiquetas(): string[] {
    const raw = this.profesional.etiquetas || '';
    return raw.split(',').map(item => item.trim()).filter(Boolean);
  }

  get estado(): string {
    return this.profesional.estadoValidacion || 'PENDIENTE';
  }

  get estadoTexto(): string {
    const estado = this.estado.toUpperCase();
    if (estado === 'APROBADO') return 'Verificado';
    if (estado === 'RECHAZADO') return 'Rechazado';
    return 'Pendiente de validacion';
  }

  get estadoIcono(): string {
    return this.estado.toUpperCase() === 'APROBADO' ? 'verified' : this.estado.toUpperCase() === 'RECHAZADO' ? 'error' : 'schedule';
  }

  get colegiatura(): string {
    return this.profesional.numeroColegiatura || this.profesional.cmp || 'Sin colegiatura registrada';
  }

  initials(): string {
    return (this.profesional.nombre || 'Profesional MindCare')
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  tagText(): string {
    return this.etiquetas.join(', ');
  }

  setTagText(value: string): void {
    this.profesional.etiquetas = value;
  }

  saveProfile(): void {
    this.message = '';
    this.errorMessage = '';

    if (!this.profesionalId) {
      this.errorMessage = 'No se pudo identificar el perfil profesional.';
      return;
    }

    if (!this.profesional.especialidadIds || this.profesional.especialidadIds.length === 0) {
      this.errorMessage = 'Debe seleccionar al menos una especialidad.';
      return;
    }

    // Map selected specialty names to flat text especialidad field
    const selectedNames = this.dbEspecialidades
      .filter(esp => this.profesional.especialidadIds?.includes(esp.idEspecialidad as number))
      .map(esp => esp.nombre);
    this.profesional.especialidad = selectedNames.join(', ');

    const payload: Profesional = {
      idProfesional: this.profesionalId,
      usuarioId: this.profesional.usuarioId,
      especialidad: this.profesional.especialidad,
      especialidadIds: this.profesional.especialidadIds,
      numeroColegiatura: this.profesional.numeroColegiatura || this.profesional.cmp,
      aniosExperiencia: this.profesional.aniosExperiencia,
      etiquetas: this.profesional.etiquetas,
      descripcionPerfil: this.profesional.descripcionPerfil,
      documentoValidacion: this.profesional.documentoValidacion,
    };

    this.saving = true;
    this.profesionalService.modificar(this.profesionalId, payload)
      .pipe(finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: updated => {
          this.profesional = { ...this.profesional, ...(updated || {}) };
          this.message = 'Perfil actualizado correctamente.';
        },
        error: () => this.errorMessage = 'No se pudo actualizar el perfil. Revisa los datos ingresados.',
      });
  }

  logout(): void {
    this.auth.logout();
  }
}
