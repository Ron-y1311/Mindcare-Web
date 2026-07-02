import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Profesional } from '../model/profesional';

@Injectable({ providedIn: 'root' })
export class ProfesionalService {
  private url = `${environment.apiURL}/profesionales`;
  private registroUrl = `${environment.apiURL}/usuarios/profesionales`;
  private http: HttpClient = inject(HttpClient);
  constructor() {}
  listar(): Observable<Profesional[]> { return this.http.get<Profesional[]>(this.url); }
  obtener(id: number): Observable<Profesional> { return this.http.get<Profesional>(`${this.url}/${id}`); }
  registrar(data: Profesional | any): Observable<Profesional> { return this.http.post<Profesional>(this.registroUrl, data); }
  completarPerfil(data: Profesional): Observable<Profesional> { return this.http.post<Profesional>(this.url, data); }
  modificar(id: number, data: Profesional): Observable<Profesional> { return this.http.put<Profesional>(`${this.url}/${id}`, data); }
  aprobar(id: number): Observable<Profesional> { return this.http.put<Profesional>(`${this.url}/${id}/aprobar`, {}); }
  rechazar(id: number, motivo: string): Observable<Profesional> { return this.http.put<Profesional>(`${this.url}/${id}/rechazar?motivo=${encodeURIComponent(motivo)}`, {}); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}