import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Encuesta } from '../model/encuesta';

@Injectable({ providedIn: 'root' })
export class EncuestaService {
  private url = `${environment.apiURL}/encuestas`;
  private http: HttpClient = inject(HttpClient);
  constructor() {}

  crearInicial(data: Encuesta): Observable<Encuesta> { return this.http.post<Encuesta>(`${this.url}/encuesta-inicial`, data); }
  crearDiaria(data: Encuesta): Observable<Encuesta> { return this.http.post<Encuesta>(`${this.url}/encuesta-diaria`, data); }
  crearDiariaPendiente(pacienteId: number): Observable<Encuesta> { return this.http.post<Encuesta>(`${this.url}/paciente/${pacienteId}/encuesta-diaria-pendiente`, {}); }
  finalizar(encuestaId: number, data: Encuesta): Observable<Encuesta> { return this.http.put<Encuesta>(`${this.url}/${encuestaId}/finalizar`, data); }
  listarPorPaciente(pacienteId: number): Observable<Encuesta[]> { return this.http.get<Encuesta[]>(`${this.url}/paciente/${pacienteId}`); }
  listarResultados(pacienteId: number): Observable<Encuesta[]> { return this.http.get<Encuesta[]>(`${this.url}/paciente/${pacienteId}/resultados`); }
}