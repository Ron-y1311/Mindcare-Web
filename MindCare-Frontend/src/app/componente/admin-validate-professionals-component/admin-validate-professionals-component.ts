import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { ProfesionalService } from '../../services/profesional-service';
import { Profesional } from '../../model/profesional';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { finalize, timeout } from 'rxjs';
import { SidebarComponent } from '../sidebar-component/sidebar-component';

@Component({
  selector: 'app-admin-validate-professionals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    SidebarComponent,
  ],
  templateUrl: './admin-validate-professionals-component.html',
  styleUrl: './admin-validate-professionals-component.css',
})
export class AdminValidateProfessionalsComponent implements OnInit {
  profesionales: Profesional[] = [];
  selected: Profesional | null = null;
  search = '';
  statusFilter = 'PENDIENTE';
  rejectionReason = '';
  errorMessage = '';
  successMessage = '';
  loading = false;
  actionLoading = false;
  displayedColumns = ['profesional', 'especialidad', 'experiencia', 'estado', 'acciones'];

  constructor(
    private auth: AuthService,
    private profesionalService: ProfesionalService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.auth.requireUser();
    if (this.auth.primaryRole(user.roles) !== 'ADMIN') {
      this.auth.clearSession();
      this.router.navigate(['/admin-login']);
      return;
    }
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.profesionalService.listar()
      .pipe(
        timeout(10000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: profesionales => {
          this.profesionales = Array.isArray(profesionales) ? profesionales : [];
          this.selected = this.filteredProfessionals[0] || this.profesionales[0] || null;
          this.rejectionReason = '';
        },
        error: err => {
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'La carga de profesionales tardo demasiado. Verifica que el backend este activo.'
            : 'No se pudieron cargar los profesionales.';
        },
      });
  }

  get filteredProfessionals(): Profesional[] {
    const term = this.search.trim().toLowerCase();
    return this.profesionales
      .filter(profesional => this.statusFilter === 'TODOS' || this.estado(profesional) === this.statusFilter)
      .filter(profesional => !term
        || (profesional.nombre || '').toLowerCase().includes(term)
        || (profesional.correo || '').toLowerCase().includes(term)
        || (profesional.especialidad || '').toLowerCase().includes(term)
        || (profesional.numeroColegiatura || profesional.cmp || '').toLowerCase().includes(term));
  }

  get pendientes(): number {
    return this.profesionales.filter(profesional => this.estado(profesional) === 'PENDIENTE').length;
  }

  get aprobados(): number {
    return this.profesionales.filter(profesional => this.estado(profesional) === 'APROBADO').length;
  }

  get rechazados(): number {
    return this.profesionales.filter(profesional => this.estado(profesional) === 'RECHAZADO').length;
  }

  aprobar(profesional: Profesional): void {
    const id = profesional.idProfesional;
    if (!id) {
      this.errorMessage = 'No se pudo identificar al profesional seleccionado.';
      return;
    }

    this.actionLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.profesionalService.aprobar(id)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.actionLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Profesional aprobado correctamente.';
          this.cargar();
        },
        error: err => {
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'La aprobacion tardo demasiado. Intentalo nuevamente.'
            : 'No se pudo aprobar el profesional.';
        },
      });
  }

  rechazar(profesional: Profesional): void {
    const id = profesional.idProfesional;
    if (!id) {
      this.errorMessage = 'No se pudo identificar al profesional seleccionado.';
      return;
    }

    const motivo = this.rejectionReason.trim() || 'No cumple los criterios de validacion';
    this.actionLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.profesionalService.rechazar(id, motivo)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.actionLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Solicitud profesional rechazada correctamente.';
          this.rejectionReason = '';
          this.cargar();
        },
        error: err => {
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'El rechazo tardo demasiado. Intentalo nuevamente.'
            : 'No se pudo rechazar el profesional.';
        },
      });
  }

  seleccionar(profesional: Profesional): void {
    this.selected = profesional;
    this.rejectionReason = profesional.motivoRechazo || '';
  }

  estado(profesional: Profesional): string {
    return (profesional.estadoValidacion || 'PENDIENTE').toUpperCase();
  }

  estadoLabel(profesional: Profesional): string {
    const estado = this.estado(profesional);
    if (estado === 'APROBADO') return 'Aprobado';
    if (estado === 'RECHAZADO') return 'Rechazado';
    return 'Pendiente';
  }

  estadoClass(profesional: Profesional): string {
    const estado = this.estado(profesional);
    if (estado === 'APROBADO') return 'status-chip approved';
    if (estado === 'RECHAZADO') return 'status-chip rejected';
    return 'status-chip pending';
  }

  initials(profesional: Profesional | null): string {
    const value = profesional?.nombre || profesional?.correo || 'PM';
    return value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || 'PM';
  }

  colegiatura(profesional: Profesional): string {
    return profesional.numeroColegiatura || profesional.cmp || 'No registrada';
  }

  experiencia(profesional: Profesional): string {
    const years = profesional.aniosExperiencia || 0;
    return `${years} ${years === 1 ? 'anio' : 'anios'}`;
  }

  canValidate(profesional: Profesional | null): boolean {
    return !!profesional?.idProfesional && this.estado(profesional) === 'PENDIENTE' && !this.actionLoading;
  }

  go(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.auth.logout();
  }
}
