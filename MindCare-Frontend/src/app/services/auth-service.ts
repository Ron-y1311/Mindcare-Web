import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Usuario } from '../model/usuario';

export interface AuthResponse {
  jwt: string;
  usuarioId: number;
  nombre: string;
  correo: string;
  roles: string[];
  pacienteId?: number;
  profesionalId?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http: HttpClient = inject(HttpClient);
  constructor(private router: Router) {}

  login(correo: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiURL}/authenticate`, { correo, password }, { observe: 'response' }).pipe(
      map(response => {
        const body = response.body as AuthResponse;
        const bearerToken = response.headers.get('Authorization');
        if (bearerToken) {
          const token = bearerToken.replace('Bearer ', '');
          localStorage.setItem('token', token);
          if (body) {
            body.jwt = token;
          }
        }
        this.saveSession(body);
        return body;
      })
    );
  }

  saveSession(res: AuthResponse): void {
    if (!res?.jwt) return;
    localStorage.setItem('token', res.jwt);
    localStorage.setItem('currentUser', JSON.stringify({
      idUsuario: res.usuarioId,
      usuarioId: res.usuarioId,
      nombre: res.nombre,
      correo: res.correo,
      roles: res.roles,
      rol: this.primaryRole(res.roles),
      pacienteId: res.pacienteId,
      profesionalId: res.profesionalId,
    }));
  }

  currentUser(): Usuario | null {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || 'null') as Usuario | null;
    } catch {
      return null;
    }
  }

  requireUser(): Usuario {
    const user = this.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      throw new Error('Usuario no autenticado');
    }
    return user;
  }

  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  getToken(): string | null { return localStorage.getItem('token'); }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUser();
  }

  hasAnyRole(allowedRoles: string[] | undefined): boolean {
    if (!allowedRoles?.length) return this.isAuthenticated();
    const currentRole = this.primaryRole(this.currentUser()?.roles);
    return allowedRoles.map(role => role.replace('ROLE_', '').toUpperCase()).includes(currentRole);
  }

  homeByRole(role?: string): string {
    const normalized = (role || this.primaryRole(this.currentUser()?.roles)).replace('ROLE_', '').toUpperCase();
    if (normalized === 'ADMIN') return '/admin-dashboard';
    if (normalized.includes('PROF')) return '/professional-dashboard';
    return '/patient-dashboard';
  }

  primaryRole(roles: string[] | undefined): string {
    return (roles?.[0] || '').replace('ROLE_', '').toUpperCase();
  }
}
