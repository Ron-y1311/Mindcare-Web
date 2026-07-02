import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Valoracion } from '../model/valoracion';

@Injectable({ providedIn: 'root' })
export class ValoracionService {
  private url = `${environment.apiURL}/valoraciones`;
  private http: HttpClient = inject(HttpClient);
  constructor() {}

  registrar(data: Valoracion): Observable<Valoracion> {
    return this.http.post<Valoracion>(this.url, data);
  }

  listarPorProfesional(profesionalId: number): Observable<Valoracion[]> {
    return this.http.get<Valoracion[]>(`${this.url}/profesional/${profesionalId}`);
  }

  promedio(profesionalId: number): Observable<number> {
    return this.http.get<number>(`${this.url}/profesional/${profesionalId}/promedio`);
  }
}
