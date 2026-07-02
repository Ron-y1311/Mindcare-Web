import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tracking } from '../model/tracking';

export interface DashboardPaciente {
  pacienteId?: number;
  nombrePaciente?: string;
  ultimoEstadoAnimo?: string;
  ultimaIntensidad?: number;
  totalRegistrosEmocionales?: number;
  totalEncuestas?: number;
  citasPendientes?: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private url = `${environment.apiURL}/dashboard`;
  private http: HttpClient = inject(HttpClient);
  constructor() {}

  visualizarPaciente(pacienteId: number): Observable<DashboardPaciente> {
    return this.http.get<DashboardPaciente>(`${this.url}/paciente/${pacienteId}`);
  }

  evolucionEmocional(pacienteId: number): Observable<Tracking[]> {
    return this.http.get<Tracking[]>(`${this.url}/paciente/${pacienteId}/evolucion-emocional`);
  }

  resumenEmocional(pacienteId: number): Observable<any> {
    return this.http.get<any>(`${this.url}/paciente/${pacienteId}/resumen`);
  }
}