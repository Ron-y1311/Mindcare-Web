import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MedicacionPaciente } from '../model/medicacion-paciente';

@Injectable({ providedIn: 'root' })
export class MedicacionPacienteService {
  private url = `${environment.apiURL}/medicacion-paciente`;
  private http: HttpClient = inject(HttpClient);
  constructor() {}
  listarPorPaciente(pacienteId: number): Observable<MedicacionPaciente[]> { return this.http.get<MedicacionPaciente[]>(`${this.url}/paciente/${pacienteId}`); }
  registrar(data: MedicacionPaciente): Observable<MedicacionPaciente> { return this.http.post<MedicacionPaciente>(this.url, data); }
  modificar(id: number, data: MedicacionPaciente): Observable<MedicacionPaciente> { return this.http.put<MedicacionPaciente>(`${this.url}/${id}`, data); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}