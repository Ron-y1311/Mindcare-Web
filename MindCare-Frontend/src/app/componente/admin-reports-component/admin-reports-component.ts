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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { catchError, finalize, forkJoin, of, timeout } from 'rxjs';
import { SidebarComponent } from '../sidebar-component/sidebar-component';

interface ReportRow {
  nombre: string;
  tipo: string;
  valor: string | number;
  estado: string;
  ruta?: string;
}

@Component({
  selector: 'app-admin-reports',
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
  templateUrl: './admin-reports-component.html',
  styleUrl: './admin-reports-component.css',
})
export class AdminReportsComponent implements OnInit {
  usuarios: Usuario[] = [];
  profesionales: Profesional[] = [];
  search = '';
  reportType = 'USUARIOS';
  loading = false;
  errorMessage = '';
  generatedMessage = '';
  displayedColumns = ['nombre', 'tipo', 'valor', 'estado', 'acciones'];

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
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.errorMessage = '';
    this.generatedMessage = '';
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
            ? 'La carga de reportes tardo demasiado. Verifica que el backend este activo.'
            : 'No se pudo cargar la informacion de reportes.';
        },
      });
  }

  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get pacientes(): number {
    return this.usuarios.filter(usuario => this.rol(usuario) === 'PACIENTE').length;
  }

  get usuariosProfesionales(): number {
    return this.usuarios.filter(usuario => this.rol(usuario) === 'PROFESIONAL').length;
  }

  get administradores(): number {
    return this.usuarios.filter(usuario => this.rol(usuario) === 'ADMIN').length;
  }

  get profesionalesAprobados(): number {
    return this.profesionales.filter(profesional => this.estadoProfesional(profesional) === 'APROBADO').length;
  }

  get profesionalesPendientes(): number {
    return this.profesionales.filter(profesional => this.estadoProfesional(profesional) === 'PENDIENTE').length;
  }

  get profesionalesRechazados(): number {
    return this.profesionales.filter(profesional => this.estadoProfesional(profesional) === 'RECHAZADO').length;
  }

  get cuentasActivas(): number {
    return this.usuarios.filter(usuario => usuario.activo !== false).length;
  }

  get cuentasInactivas(): number {
    return this.usuarios.filter(usuario => usuario.activo === false).length;
  }

  get porcentajePacientes(): number {
    return this.percent(this.pacientes, this.totalUsuarios);
  }

  get porcentajeProfesionales(): number {
    return this.percent(this.usuariosProfesionales, this.totalUsuarios);
  }

  get porcentajeAdmins(): number {
    return this.percent(this.administradores, this.totalUsuarios);
  }

  get porcentajeAprobados(): number {
    return this.percent(this.profesionalesAprobados, this.profesionales.length);
  }

  get porcentajePendientes(): number {
    return this.percent(this.profesionalesPendientes, this.profesionales.length);
  }

  get reportRows(): ReportRow[] {
    return [
      { nombre: 'Usuarios registrados', tipo: 'Usuarios', valor: this.totalUsuarios, estado: 'Actualizado', ruta: '/admin-users' },
      { nombre: 'Pacientes registrados', tipo: 'Usuarios', valor: this.pacientes, estado: 'Actualizado', ruta: '/admin-users' },
      { nombre: 'Profesionales aprobados', tipo: 'Validaciones', valor: this.profesionalesAprobados, estado: 'Actualizado', ruta: '/admin-validate-professionals' },
      { nombre: 'Profesionales pendientes', tipo: 'Validaciones', valor: this.profesionalesPendientes, estado: this.profesionalesPendientes > 0 ? 'Requiere revision' : 'Sin pendientes', ruta: '/admin-validate-professionals' },
      { nombre: 'Cuentas activas', tipo: 'Acceso', valor: this.cuentasActivas, estado: 'Actualizado', ruta: '/admin-users' },
    ].filter(row => {
      const term = this.search.trim().toLowerCase();
      return !term
        || row.nombre.toLowerCase().includes(term)
        || row.tipo.toLowerCase().includes(term)
        || row.estado.toLowerCase().includes(term);
    });
  }

  generarReporte(): void {
    const nombre = this.reportType === 'USUARIOS' ? 'usuarios' : this.reportType === 'VALIDACIONES' ? 'validaciones' : 'actividad';
    
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
    html += `<head><meta charset="utf-8">`;
    html += `<style>`;
    html += `  table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; }`;
    html += `  th, td { border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10pt; }`;
    html += `  .title { background-color: #1e3a8a; color: #ffffff; font-size: 12pt; font-weight: bold; text-align: center; }`;
    html += `  .header-cell { background-color: #2563eb; color: #ffffff; font-weight: bold; }`;
    html += `  .meta-label { font-weight: bold; background-color: #f8fafc; }`;
    html += `  .footer { background-color: #f1f5f9; text-align: center; font-size: 8pt; color: #64748b; }`;
    html += `</style>`;
    html += `</head>`;
    html += `<body>`;
    html += `<table>`;
    html += `  <colgroup>`;
    html += `    <col width="220">`;
    html += `    <col width="90">`;
    html += `  </colgroup>`;
    html += `  <tr><td colspan="2" class="title" style="padding: 10px;">REPORTE DE ${nombre.toUpperCase()} - MINDCARE</td></tr>`;
    html += `  <tr><td class="meta-label">Fecha de generación:</td><td>${new Date().toLocaleDateString()}</td></tr>`;
    html += `  <tr><td class="meta-label">Generado por:</td><td>Administrador del Sistema</td></tr>`;
    html += `  <tr><td colspan="2" style="border: none; height: 10px;"></td></tr>`;
    html += `  <tr><td class="header-cell">INDICADOR</td><td class="header-cell" style="text-align: right;">VALOR</td></tr>`;
    
    if (this.reportType === 'USUARIOS') {
      html += `  <tr><td>Total Usuarios Registrados</td><td style="text-align: right;">${this.totalUsuarios}</td></tr>`;
      html += `  <tr><td>Pacientes Registrados</td><td style="text-align: right;">${this.pacientes}</td></tr>`;
      html += `  <tr><td>Profesionales Registrados</td><td style="text-align: right;">${this.usuariosProfesionales}</td></tr>`;
      html += `  <tr><td>Administradores</td><td style="text-align: right;">${this.administradores}</td></tr>`;
    } else if (this.reportType === 'VALIDACIONES') {
      html += `  <tr><td>Profesionales Aprobados</td><td style="text-align: right;">${this.profesionalesAprobados}</td></tr>`;
      html += `  <tr><td>Profesionales Pendientes</td><td style="text-align: right;">${this.profesionalesPendientes}</td></tr>`;
      html += `  <tr><td>Profesionales Rechazados</td><td style="text-align: right;">${this.profesionalesRechazados}</td></tr>`;
    } else {
      html += `  <tr><td>Cuentas de Usuario Activas</td><td style="text-align: right;">${this.cuentasActivas}</td></tr>`;
      html += `  <tr><td>Cuentas de Usuario Inactivas</td><td style="text-align: right;">${this.cuentasInactivas}</td></tr>`;
    }
    
    html += `  <tr class="footer"><td colspan="2">MindCare © ${new Date().getFullYear()}</td></tr>`;
    html += `</table>`;
    html += `</body>`;
    html += `</html>`;
    
    try {
      const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `reporte_${nombre}_mindcare.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.generatedMessage = `El reporte de ${nombre} se descargó con formato de tabla Excel.`;
    } catch (e) {
      this.generatedMessage = `Resumen de ${nombre} generado en el sistema.`;
    }
    
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.generatedMessage = '';
      this.cdr.detectChanges();
    }, 6000);
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

  percent(value: number, total: number): number {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }

  barHeight(value: number, total: number): number {
    const pct = this.percent(value, total);
    return Math.max(12, pct);
  }

  statusClass(row: ReportRow): string {
    return row.estado === 'Requiere revision' ? 'status-chip warning' : 'status-chip ok';
  }

  go(path?: string): void {
    if (path) this.router.navigate([path]);
  }

  logout(): void {
    this.auth.logout();
  }
}
