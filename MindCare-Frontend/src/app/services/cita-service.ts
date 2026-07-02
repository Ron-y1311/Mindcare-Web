import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cita } from '../model/cita';

@Injectable({ providedIn: 'root' })
export class CitaService {
  private url = `${environment.apiURL}/citas`;
  private http: HttpClient = inject(HttpClient);
  constructor() {}

  agendar(data: Cita): Observable<Cita> { return this.http.post<Cita>(this.url, data); }
  registrar(data: Cita): Observable<Cita> { return this.agendar(data); }
  listarPorPaciente(pacienteId: number): Observable<Cita[]> { return this.http.get<Cita[]>(`${this.url}/paciente/${pacienteId}`); }
  listarPorProfesional(profesionalId: number): Observable<Cita[]> { return this.http.get<Cita[]>(`${this.url}/profesional/${profesionalId}`); }
  confirmar(id: number): Observable<void> { return this.http.put<void>(`${this.url}/${id}/confirmar`, {}); }
  reprogramar(id: number, fecha: string): Observable<void> { return this.http.put<void>(`${this.url}/${id}/reprogramar`, { fecha }); }
  cancelar(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  eliminar(id: number): Observable<void> { return this.cancelar(id); }
  finalizar(id: number): Observable<void> { return this.http.put<void>(`${this.url}/${id}/finalizar`, {}); }
  obtenerNotaClinica(id: number): Observable<Cita> { return this.http.get<Cita>(`${this.url}/${id}/nota-clinica`); }
  registrarNotaClinica(id: number, data: Cita): Observable<void>
  { return this.http.post<void>(`${this.url}/${id}/nota-clinica`, data);
  }
  actualizarNotaClinica(id: number, data: Cita): Observable<void> { return this.http.put<void>(`${this.url}/${id}/nota-clinica`, data); }
}
