import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CatalogoItem {
  idRol?: number;
  idEstadoAnimo?: number;
  idEstadoCita?: number;
  idEspecialidad?: number;
  idPregunta?: number;
  nombre?: string;
  descripcion?: string;
  texto?: string;
}
//Servicio Angular para proveer y administrar los catálogos generales en el frontend
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private url = `${environment.apiURL}/catalogos`;
  private http: HttpClient = inject(HttpClient);
  constructor() {}

  listar(tipo: string): Observable<CatalogoItem[]> { return this.http.get<CatalogoItem[]>(`${this.url}/${tipo}`); }
  crear(tipo: string, data: CatalogoItem): Observable<CatalogoItem> { return this.http.post<CatalogoItem>(`${this.url}/${tipo}`, data); }
  actualizar(tipo: string, id: number, data: CatalogoItem): Observable<CatalogoItem> { return this.http.put<CatalogoItem>(`${this.url}/${tipo}/${id}`, data); }
  eliminar(tipo: string, id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${tipo}/${id}`); }

  listarRoles(): Observable<CatalogoItem[]> { return this.http.get<CatalogoItem[]>(`${this.url}/roles`); }
  listarEstadosAnimo(): Observable<CatalogoItem[]> { return this.http.get<CatalogoItem[]>(`${this.url}/estados-de-animo`); }
  listarEstadosCita(): Observable<CatalogoItem[]> { return this.http.get<CatalogoItem[]>(`${this.url}/estados-de-cita`); }
  listarEspecialidades(): Observable<CatalogoItem[]> { return this.http.get<CatalogoItem[]>(`${this.url}/especialidades`); }
  listarPreguntas(): Observable<CatalogoItem[]> { return this.http.get<CatalogoItem[]>(`${this.url}/preguntas`); }
}
