import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { UsuarioService } from '../../services/usuario-service';
import { ProfesionalService } from '../../services/profesional-service';
import { Usuario } from '../../model/usuario';
import { Profesional } from '../../model/profesional';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { catchError, finalize, forkJoin, of, timeout } from 'rxjs';

import { SidebarComponent } from '../sidebar-component/sidebar-component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatCardModule, MatTableModule, SidebarComponent],
  templateUrl: './admin-dashboard-component.html',
  styleUrl: './admin-dashboard-component.css',
})
export class AdminDashboardComponent implements OnInit {
  totalUsuarios = 0;
  totalPacientes = 0;
  profesionalesAprobados = 0;
  profesionalesPendientes = 0;
  usuariosRecientes: Usuario[] = [];
  profesionalesPendientesLista: Profesional[] = [];
  loading = false;
  errorMessage = '';
  displayedColumns = ['usuario', 'rol', 'correo', 'estado'];

  constructor(
    private auth: AuthService,
    private usuarioService: UsuarioService,
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
    this.cargarIndicadores();
  }

  cargarIndicadores(): void {
    this.loading = true;
    this.errorMessage = '';
    forkJoin({
      usuarios: this.usuarioService.listar().pipe(catchError(() => of([] as Usuario[]))),
      pacientes: this.usuarioService.listarPacientes().pipe(catchError(() => of([] as Usuario[]))),
      profesionales: this.profesionalService.listar().pipe(catchError(() => of([] as Profesional[]))),
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
          const usuarios = Array.isArray(data.usuarios) ? data.usuarios : [];
          const profesionales = Array.isArray(data.profesionales) ? data.profesionales : [];
          this.totalUsuarios = usuarios.length;
          this.totalPacientes = Array.isArray(data.pacientes) ? data.pacientes.length : 0;
          this.profesionalesAprobados = profesionales.filter(p => this.estadoProfesional(p) === 'APROBADO').length;
          this.profesionalesPendientesLista = profesionales.filter(p => this.estadoProfesional(p) === 'PENDIENTE');
          this.profesionalesPendientes = this.profesionalesPendientesLista.length;
          this.usuariosRecientes = usuarios.slice().sort((a, b) => this.idUsuario(b) - this.idUsuario(a)).slice(0, 5);
        },
        error: err => {
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'La carga del panel tardo demasiado. Verifica que el backend este activo.'
            : 'No se pudo cargar el resumen administrativo.';
        },
      });
  }

  rol(usuario: Usuario): string {
    const rol = usuario.rol;
    if (typeof rol === 'string') return rol.replace('ROLE_', '');
    if (rol?.nombre) return String(rol.nombre).replace('ROLE_', '');
    if (usuario.roles?.length) return usuario.roles[0].replace('ROLE_', '');
    if ((usuario as any).rolId === 1) return 'ADMIN';
    if ((usuario as any).rolId === 2) return 'PACIENTE';
    if ((usuario as any).rolId === 3) return 'PROFESIONAL';
    return 'Sin rol';
  }

  initials(name?: string): string {
    return (name || 'Usuario').split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
  }

  estadoUsuario(usuario: Usuario): string {
    return usuario.activo === false ? 'Inactivo' : 'Activo';
  }

  estadoClass(usuario: Usuario): string {
    return usuario.activo === false ? 'inactive' : 'active';
  }

  estadoProfesional(profesional: Profesional): string {
    return (profesional.estadoValidacion || 'PENDIENTE').toUpperCase();
  }

  go(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.auth.logout();
  }

  private idUsuario(usuario: Usuario): number {
    return usuario.idUsuario || usuario.usuarioId || 0;
  }
}
