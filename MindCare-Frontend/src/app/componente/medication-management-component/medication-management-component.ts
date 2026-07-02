import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { MedicacionPacienteService } from '../../services/medicacion-paciente-service';
import { CitaService } from '../../services/cita-service';
import { MedicacionPaciente } from '../../model/medicacion-paciente';
import { Cita } from '../../model/cita';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { catchError, finalize, forkJoin, of, timeout } from 'rxjs';

@Component({
  selector: 'app-medication-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTableModule],
  templateUrl: './medication-management-component.html',
  styleUrl: './medication-management-component.css',
})
export class MedicationManagementComponent implements OnInit {
  pacienteId?: number;
  citaId?: number;
  patientName = 'Paciente MindCare';
  meds: MedicacionPaciente[] = [];
  citas: Cita[] = [];
  message = '';
  errorMessage = '';
  loading = false;
  saving = false;
  displayedColumns = ['medicamento', 'dosis', 'periodo', 'indicaciones', 'estado', 'acciones'];
  form: MedicacionPaciente = this.emptyForm();

  constructor(
    private medService: MedicacionPacienteService,
    private citaService: CitaService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.auth.requireUser();
    const queryPacienteId = Number(this.route.snapshot.queryParamMap.get('pacienteId'));
    const queryCitaId = Number(this.route.snapshot.queryParamMap.get('citaId'));
    const queryNombre = this.route.snapshot.queryParamMap.get('nombre');

    this.pacienteId = Number.isFinite(queryPacienteId) && queryPacienteId > 0 ? queryPacienteId : user.pacienteId;
    this.citaId = Number.isFinite(queryCitaId) && queryCitaId > 0 ? queryCitaId : undefined;
    this.patientName = queryNombre || (this.pacienteId ? user.nombre : '') || 'Paciente MindCare';

    if (!this.pacienteId) {
      this.errorMessage = 'No se pudo identificar al paciente para cargar medicacion.';
      return;
    }

    this.loading = true;
    forkJoin({
      meds: this.medService.listarPorPaciente(this.pacienteId).pipe(catchError(() => of([] as MedicacionPaciente[]))),
      citas: this.citaService.listarPorPaciente(this.pacienteId).pipe(catchError(() => of([] as Cita[]))),
    })
      .pipe(
        timeout(10000),
        finalize(() => {
          this.loading = false;
          this.resolveCitaId();
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: data => {
          this.meds = Array.isArray(data.meds) ? data.meds : [];
          this.citas = Array.isArray(data.citas) ? data.citas : [];
          const citaConNombre = this.citas.find(c => !!c.nombrePaciente);
          if (!queryNombre && citaConNombre?.nombrePaciente) this.patientName = citaConNombre.nombrePaciente;
        },
        error: err => {
          this.meds = [];
          this.citas = [];
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'La carga de medicacion tardo demasiado. Verifica que el backend este activo.'
            : 'No se pudo cargar la medicacion del paciente.';
        },
      });
  }

  get activeMeds(): MedicacionPaciente[] {
    return this.meds.filter(med => this.medActive(med));
  }

  get latestCita(): Cita | undefined {
    return this.citas.slice().sort((a, b) => this.timeValue(b.fecha) - this.timeValue(a.fecha))[0];
  }

  get canSave(): boolean {
    return !!this.citaId && !!this.form.nombreMedicamento?.trim() && !!this.form.dosis?.trim() && !!this.form.frecuencia?.trim() && !!this.form.fechaInicio;
  }

  get pacienteCodigo(): string {
    return this.pacienteId ? `#${this.pacienteId}` : '--';
  }

  submit(): void {
    this.message = '';
    this.errorMessage = '';

    if (!this.citaId) {
      this.errorMessage = 'Para registrar medicacion se necesita una cita asociada al paciente.';
      return;
    }

    if (!this.canSave) {
      this.errorMessage = 'Completa medicamento, dosis, frecuencia y fecha de inicio.';
      return;
    }

    const payload: MedicacionPaciente = {
      ...this.form,
      citaId: this.citaId,
      tratamientoActivo: this.form.tratamientoActivo ?? true,
    };

    this.saving = true;
    const id = this.medId(this.form);
    const request = id ? this.medService.modificar(id, payload) : this.medService.registrar(payload);
    request.pipe(finalize(() => {
      this.saving = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: saved => {
        if (id) {
          this.meds = this.meds.map(med => this.medId(med) === id ? saved : med);
          this.message = 'Tratamiento actualizado correctamente.';
        } else {
          this.meds = [saved, ...this.meds];
          this.message = 'Tratamiento registrado correctamente.';
        }
        this.form = this.emptyForm();
      },
      error: () => this.errorMessage = 'No se pudo guardar el tratamiento. Revisa los datos enviados.',
    });
  }

  edit(med: MedicacionPaciente): void {
    this.form = {
      ...med,
      nombreMedicamento: this.medName(med),
      tratamientoActivo: this.medActive(med),
    };
    this.message = 'Editando tratamiento seleccionado.';
  }

  eliminar(med: MedicacionPaciente): void {
    const id = this.medId(med);
    if (!id) return;
    this.medService.eliminar(id).subscribe({
      next: () => {
        this.meds = this.meds.filter(item => this.medId(item) !== id);
        this.message = 'Tratamiento eliminado correctamente.';
      },
      error: () => this.errorMessage = 'No se pudo eliminar el tratamiento.',
    });
  }

  resetForm(): void {
    this.form = this.emptyForm();
    this.message = '';
    this.errorMessage = '';
  }

  medName(med: MedicacionPaciente): string {
    return med.nombreMedicamento || med.medicamento || '';
  }

  medActive(med: MedicacionPaciente): boolean {
    return med.tratamientoActivo ?? med.activo ?? true;
  }

  medId(med: MedicacionPaciente): number | undefined {
    return med.idMedicacion || med.idMedicacionPaciente;
  }

  formatDate(fecha?: string): string {
    if (!fecha) return '--';
    const date = new Date(fecha);
    return Number.isNaN(date.getTime()) ? fecha : date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  initials(): string {
    return this.patientName.split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
  }

  goBack(): void {
    this.router.navigate(['/patient-clinical-history'], { queryParams: { pacienteId: this.pacienteId, nombre: this.patientName } });
  }

  logout(): void {
    this.auth.logout();
  }

  private resolveCitaId(): void {
    if (!this.citaId && this.latestCita?.idCita) this.citaId = this.latestCita.idCita;
  }

  private emptyForm(): MedicacionPaciente {
    return {
      nombreMedicamento: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      indicaciones: '',
      fechaInicio: '',
      fechaFin: '',
      tratamientoActivo: true,
    };
  }

  private timeValue(value?: string): number {
    const date = value ? new Date(value) : undefined;
    return !date || Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }
}

