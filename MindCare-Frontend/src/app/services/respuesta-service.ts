import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Respuesta } from '../model/respuesta';

@Injectable({ providedIn: 'root' })
export class RespuestaService {
  private url = `${environment.apiURL}/respuestas`;
  private http: HttpClient = inject(HttpClient);
  constructor() {}

  registrar(data: Respuesta): Observable<Respuesta> { return this.http.post<Respuesta>(this.url, data); }
  listarPorEncuesta(encuestaId: number): Observable<Respuesta[]> { return this.http.get<Respuesta[]>(`${this.url}/encuesta/${encuestaId}`); }
}