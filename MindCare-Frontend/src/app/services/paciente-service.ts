import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Paciente } from '../model/paciente';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private url = `${environment.apiURL}/usuarios/pacientes`;
  private http: HttpClient = inject(HttpClient);
  constructor() {}
  listar(): Observable<Paciente[]> { return this.http.get<Paciente[]>(this.url); }
  obtener(id: number): Observable<Paciente> { return this.http.get<Paciente>(`${this.url}/${id}`); }
  registrar(data: Paciente | any): Observable<Paciente> { return this.http.post<Paciente>(this.url, data); }
  modificar(id: number, data: Paciente): Observable<Paciente> { return this.http.put<Paciente>(`${this.url}/${id}`, data); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}