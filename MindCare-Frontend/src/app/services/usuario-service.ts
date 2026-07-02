import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../model/usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private url = `${environment.apiURL}/usuarios`;
  private http: HttpClient = inject(HttpClient);
  constructor() {}

  listar(): Observable<Usuario[]> { return this.http.get<Usuario[]>(this.url); }
  obtener(id: number): Observable<Usuario> { return this.http.get<Usuario>(`${this.url}/${id}`); }
  registrar(data: Usuario): Observable<Usuario> { return this.http.post<Usuario>(`${this.url}/registrar-usuario`, data); }
  actualizar(id: number, data: Usuario): Observable<Usuario> { return this.http.put<Usuario>(`${this.url}/${id}`, data); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  activar(id: number): Observable<void> { return this.http.put<void>(`${this.url}/${id}/activar`, {}); }
  desactivar(id: number): Observable<void> { return this.http.put<void>(`${this.url}/${id}/desactivar`, {}); }
  listarAdministradores(): Observable<Usuario[]> { return this.http.get<Usuario[]>(`${this.url}/administradores`); }
  listarPacientes(): Observable<Usuario[]> { return this.http.get<Usuario[]>(`${this.url}/pacientes`); }
  listarProfesionales(): Observable<Usuario[]> { return this.http.get<Usuario[]>(`${this.url}/profesionales`); }
}