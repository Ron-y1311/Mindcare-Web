import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { UsuarioService } from '../../services/usuario-service';
import { Usuario } from '../../model/usuario';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { finalize, timeout } from 'rxjs';
import { SidebarComponent } from '../sidebar-component/sidebar-component';

@Component({
  selector: 'app-admin-users',
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
  templateUrl: './admin-users-component.html',
  styleUrl: './admin-users-component.css',
})
export class AdminUsersComponent implements OnInit {
  usuarios: Usuario[] = [];
  search = '';
  roleFilter = 'TODOS';
  statusFilter = 'TODOS';
  errorMessage = '';
  successMessage = '';
  loading = false;
  displayedColumns = ['usuario', 'correo', 'rol', 'estado', 'acciones'];

  constructor(
    private auth: AuthService,
    private usuarioService: UsuarioService,
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
    this.usuarioService.listar()
      .pipe(
        timeout(10000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: usuarios => {
          this.usuarios = Array.isArray(usuarios) ? usuarios : [];
        },
        error: err => {
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'La carga de usuarios tardo demasiado. Verifica que el backend este activo.'
            : 'No se pudieron cargar los usuarios.';
        },
      });
  }

  get filteredUsuarios(): Usuario[] {
    const term = this.search.trim().toLowerCase();
    return this.usuarios.filter(usuario => {
      const rol = this.rol(usuario).toUpperCase();
      const activo = this.isActive(usuario);
      const matchesSearch = !term
        || (usuario.nombre || '').toLowerCase().includes(term)
        || (usuario.username || '').toLowerCase().includes(term)
        || (usuario.correo || '').toLowerCase().includes(term);
      const matchesRole = this.roleFilter === 'TODOS' || rol === this.roleFilter;
      const matchesStatus = this.statusFilter === 'TODOS'
        || (this.statusFilter === 'ACTIVO' && activo)
        || (this.statusFilter === 'INACTIVO' && !activo);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get totalPacientes(): number {
    return this.usuarios.filter(usuario => this.rol(usuario).toUpperCase() === 'PACIENTE').length;
  }

  get totalProfesionales(): number {
    return this.usuarios.filter(usuario => this.rol(usuario).toUpperCase() === 'PROFESIONAL').length;
  }

  get totalActivos(): number {
    return this.usuarios.filter(usuario => this.isActive(usuario)).length;
  }
  toggleUser(usuario: Usuario): void {
    const id = this.idUsuario(usuario);
    if (!id) {
      this.errorMessage = 'No se pudo identificar el usuario seleccionado.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    const request = this.isActive(usuario) ? this.usuarioService.desactivar(id) : this.usuarioService.activar(id);
    request
      .pipe(
        timeout(10000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = this.isActive(usuario) ? 'Usuario desactivado correctamente.' : 'Usuario activado correctamente.';
          this.cargar();
        },
        error: err => {
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'La actualizacion tardo demasiado. Intentalo nuevamente.'
            : 'No se pudo actualizar el usuario.';
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
    return (name || 'Usuario')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || 'U';
  }

  username(usuario: Usuario): string {
    return usuario.username || (usuario.correo ? usuario.correo.split('@')[0] : 'usuario');
  }

  isActive(usuario: Usuario): boolean {
    return usuario.activo !== false;
  }

  estadoUsuario(usuario: Usuario): string {
    return this.isActive(usuario) ? 'Activo' : 'Inactivo';
  }

  estadoClass(usuario: Usuario): string {
    return this.isActive(usuario) ? 'active' : 'inactive';
  }

  roleClass(usuario: Usuario): string {
    const rol = this.rol(usuario).toUpperCase();
    if (rol === 'ADMIN') return 'role-chip admin';
    if (rol === 'PROFESIONAL') return 'role-chip professional';
    if (rol === 'PACIENTE') return 'role-chip patient';
    return 'role-chip neutral';
  }

  idUsuario(usuario: Usuario): number {
    return usuario.idUsuario || usuario.usuarioId || 0;
  }

  go(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.auth.logout();
  }
}
