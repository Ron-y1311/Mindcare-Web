import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { UsuarioService } from '../../services/usuario-service';
import { ProfesionalService } from '../../services/profesional-service';
import { CatalogoItem, CatalogoService } from '../../services/catalogo-service';
import { Usuario } from '../../model/usuario';
import { Profesional } from '../../model/profesional';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { catchError, finalize, forkJoin, of, timeout } from 'rxjs';
import { SidebarComponent } from '../sidebar-component/sidebar-component';

@Component({
  selector: 'app-admin-settings',
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
    MatSlideToggleModule,
    SidebarComponent,
  ],
  templateUrl: './admin-settings-component.html',
  styleUrl: './admin-settings-component.css',
})
export class AdminSettingsComponent implements OnInit {
  usuarios: Usuario[] = [];
  profesionales: Profesional[] = [];
  adminName = 'Admin MindCare';
  adminEmail = '';
  institutionName = 'MindCare';
  supportEmail = 'soporte@mindcare.com';
  sessionTimeout = '30';
  compactMode = false;
  emailAlerts = true;
  search = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  catalogTypes = [
    { tipo: 'roles', label: 'Roles', field: 'nombre' },
    { tipo: 'estados-de-animo', label: 'Estados de animo', field: 'nombre', description: true },
    { tipo: 'estados-de-cita', label: 'Estados de cita', field: 'nombre' },
    { tipo: 'preguntas', label: 'Preguntas', field: 'texto' },
    { tipo: 'especialidades', label: 'Especialidades', field: 'nombre', description: true },
  ];
  selectedCatalogType = 'preguntas';
  catalogItems: CatalogoItem[] = [];
  catalogLoading = false;
  catalogEditingId: number | null = null;
  catalogForm: CatalogoItem = { nombre: '', descripcion: '', texto: '' };

  constructor(
    private auth: AuthService,
    private usuarioService: UsuarioService,
    private profesionalService: ProfesionalService,
    private catalogoService: CatalogoService,
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

    this.adminName = user.nombre || 'Admin MindCare';
    this.adminEmail = user.correo || '';
    this.loadLocalSettings();
    this.cargar();
    this.cargarCatalogo();
  }

  cargar(): void {
    this.loading = true;
    this.errorMessage = '';
    forkJoin({
      usuarios: this.usuarioService.listar().pipe(catchError(() => of([] as Usuario[]))),
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
          this.usuarios = Array.isArray(data.usuarios) ? data.usuarios : [];
          this.profesionales = Array.isArray(data.profesionales) ? data.profesionales : [];
        },
        error: err => {
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'La carga de configuracion tardo demasiado. Verifica que el backend este activo.'
            : 'No se pudo cargar el estado administrativo.';
        },
      });
  }

  get selectedCatalogConfig(): { tipo: string; label: string; field: string; description?: boolean } {
    return this.catalogTypes.find(item => item.tipo === this.selectedCatalogType) || this.catalogTypes[0];
  }

  get catalogPrimaryValue(): string {
    const field = this.selectedCatalogConfig.field as keyof CatalogoItem;
    return String(this.catalogForm[field] || '');
  }

  set catalogPrimaryValue(value: string) {
    const field = this.selectedCatalogConfig.field as keyof CatalogoItem;
    this.catalogForm = { ...this.catalogForm, [field]: value };
  }

  cargarCatalogo(): void {
    this.catalogLoading = true;
    this.errorMessage = '';
    this.catalogoService.listar(this.selectedCatalogType)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.catalogLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: items => {
          this.catalogItems = Array.isArray(items) ? items : [];
          this.resetCatalogForm();
        },
        error: err => {
          this.catalogItems = [];
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'La carga del catalogo tardo demasiado.'
            : 'No se pudo cargar el catalogo seleccionado.';
        },
      });
  }

  guardarCatalogo(): void {
    const field = this.selectedCatalogConfig.field as keyof CatalogoItem;
    const value = String(this.catalogForm[field] || '').trim();
    if (!value) {
      this.errorMessage = 'Completa el valor principal del catalogo.';
      return;
    }

    const payload: CatalogoItem = { ...this.catalogForm, [field]: value };
    if (!this.selectedCatalogConfig.description) {
      delete payload.descripcion;
    }

    this.catalogLoading = true;
    const request = this.catalogEditingId
      ? this.catalogoService.actualizar(this.selectedCatalogType, this.catalogEditingId, payload)
      : this.catalogoService.crear(this.selectedCatalogType, payload);

    request.pipe(finalize(() => {
      this.catalogLoading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: () => {
        this.successMessage = this.catalogEditingId ? 'Catalogo actualizado correctamente.' : 'Catalogo registrado correctamente.';
        this.cargarCatalogo();
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'No se pudo guardar el catalogo.';
      },
    });
  }

  editarCatalogo(item: CatalogoItem): void {
    this.catalogEditingId = this.catalogId(item);
    this.catalogForm = {
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      texto: item.texto || '',
    };
  }

  eliminarCatalogo(item: CatalogoItem): void {
    const id = this.catalogId(item);
    if (!id) {
      this.errorMessage = 'No se pudo identificar el registro del catalogo.';
      return;
    }
    this.catalogLoading = true;
    this.catalogoService.eliminar(this.selectedCatalogType, id)
      .pipe(finalize(() => {
        this.catalogLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'Catalogo eliminado correctamente.';
          this.cargarCatalogo();
        },
        error: err => {
          this.errorMessage = err?.error?.message || 'No se pudo eliminar el catalogo. Verifica si esta en uso.';
        },
      });
  }

  resetCatalogForm(): void {
    this.catalogEditingId = null;
    this.catalogForm = { nombre: '', descripcion: '', texto: '' };
  }

  catalogLabel(item: CatalogoItem): string {
    return item.texto || item.nombre || 'Sin nombre';
  }

  catalogId(item: CatalogoItem): number {
    return item.idRol || item.idEstadoAnimo || item.idEstadoCita || item.idEspecialidad || item.idPregunta || 0;
  }
  guardarPreferencias(): void {
    localStorage.setItem('adminSettings', JSON.stringify({
      institutionName: this.institutionName,
      supportEmail: this.supportEmail,
      sessionTimeout: this.sessionTimeout,
      compactMode: this.compactMode,
      emailAlerts: this.emailAlerts,
    }));
    this.successMessage = 'Preferencias locales guardadas correctamente.';
  }

  restaurarPreferencias(): void {
    localStorage.removeItem('adminSettings');
    this.institutionName = 'MindCare';
    this.supportEmail = 'soporte@mindcare.com';
    this.sessionTimeout = '30';
    this.compactMode = false;
    this.emailAlerts = true;
    this.successMessage = 'Preferencias locales restauradas.';
  }

  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get totalActivos(): number {
    return this.usuarios.filter(usuario => usuario.activo !== false).length;
  }

  get administradores(): number {
    return this.usuarios.filter(usuario => this.rol(usuario) === 'ADMIN').length;
  }

  get pacientes(): number {
    return this.usuarios.filter(usuario => this.rol(usuario) === 'PACIENTE').length;
  }

  get profesionalesUsuarios(): number {
    return this.usuarios.filter(usuario => this.rol(usuario) === 'PROFESIONAL').length;
  }

  get profesionalesPendientes(): number {
    return this.profesionales.filter(profesional => this.estadoProfesional(profesional) === 'PENDIENTE').length;
  }

  get profesionalesAprobados(): number {
    return this.profesionales.filter(profesional => this.estadoProfesional(profesional) === 'APROBADO').length;
  }

  get filteredModules(): Array<{ title: string; text: string; icon: string; route: string; metric: string | number }> {
    const modules = [
      { title: 'Usuarios', text: 'Administrar cuentas y estados de acceso.', icon: 'group', route: '/admin-users', metric: this.totalUsuarios },
      { title: 'Validaciones', text: 'Revisar solicitudes profesionales pendientes.', icon: 'verified_user', route: '/admin-validate-professionals', metric: this.profesionalesPendientes },
      { title: 'Reportes', text: 'Consultar indicadores administrativos.', icon: 'analytics', route: '/admin-reports', metric: 'Ver' },
    ];
    const term = this.search.trim().toLowerCase();
    return modules.filter(module => !term || module.title.toLowerCase().includes(term) || module.text.toLowerCase().includes(term));
  }

  rol(usuario: Usuario): string {
    const rol = usuario.rol;
    if (typeof rol === 'string') return rol.replace('ROLE_', '').toUpperCase();
    if (rol?.nombre) return String(rol.nombre).replace('ROLE_', '').toUpperCase();
    if (usuario.roles?.length) return usuario.roles[0].replace('ROLE_', '').toUpperCase();
    if ((usuario as any).rolId === 1) return 'ADMIN';
    if ((usuario as any).rolId === 2) return 'PACIENTE';
    if ((usuario as any).rolId === 3) return 'PROFESIONAL';
    return 'SIN ROL';
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

  private loadLocalSettings(): void {
    try {
      const data = JSON.parse(localStorage.getItem('adminSettings') || 'null');
      if (!data) return;
      this.institutionName = data.institutionName || this.institutionName;
      this.supportEmail = data.supportEmail || this.supportEmail;
      this.sessionTimeout = data.sessionTimeout || this.sessionTimeout;
      this.compactMode = !!data.compactMode;
      this.emailAlerts = data.emailAlerts !== false;
    } catch {
      localStorage.removeItem('adminSettings');
    }
  }
}
