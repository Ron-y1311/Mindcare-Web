import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tracking } from '../model/tracking';

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private url = `${environment.apiURL}/tracking`;
  private http: HttpClient = inject(HttpClient);
  constructor() {}

  registrarEstadoEmocional(data: Tracking): Observable<Tracking> {
    return this.http.post<Tracking>(`${this.url}/estado-emocional`, data);
  }

  registrar(data: Tracking): Observable<Tracking> {
    return this.registrarEstadoEmocional(data);
  }

  historialPaciente(pacienteId: number): Observable<Tracking[]> {
    return this.http.get<Tracking[]>(`${this.url}/paciente/${pacienteId}/historial`);
  }

  ultimoPaciente(pacienteId: number): Observable<Tracking> {
    return this.http.get<Tracking>(`${this.url}/paciente/${pacienteId}/ultimo`);
  }

  registrarReflexionDiaria(id: number, data: Tracking): Observable<Tracking> {
    return this.http.put<Tracking>(`${this.url}/${id}/reflexion-diaria`, data);
  }
}