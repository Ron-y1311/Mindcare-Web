import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Recomendacion } from '../model/recomendacion';

@Injectable({ providedIn: 'root' })
export class RecomendacionService {
  private url = `${environment.apiURL}/recomendaciones`;
  private http: HttpClient = inject(HttpClient);
  constructor() {}

  obtener(pacienteId: number): Observable<Recomendacion> {
    return this.http.get<Recomendacion>(`${this.url}/paciente/${pacienteId}`);
  }

  resumen(pacienteId: number): Observable<Recomendacion> {
    return this.http.get<Recomendacion>(`${this.url}/paciente/${pacienteId}/resumen`);
  }

  estado(pacienteId: number): Observable<string> {
    return this.http.get(`${this.url}/paciente/${pacienteId}/estado`, { responseType: 'text' });
  }

  alerta(pacienteId: number): Observable<string> {
    return this.http.get(`${this.url}/paciente/${pacienteId}/alerta`, { responseType: 'text' });
  }
}
