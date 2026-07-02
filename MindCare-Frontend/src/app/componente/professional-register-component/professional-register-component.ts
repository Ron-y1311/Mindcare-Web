import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ProfesionalService } from '../../services/profesional-service';
import { CatalogoItem, CatalogoService } from '../../services/catalogo-service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-professional-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './professional-register-component.html',
  styleUrl: './professional-register-component.css',
})
export class ProfessionalRegisterComponent implements OnInit {
  form = {
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialty: '',
    license: '',
    experience: undefined as number | undefined,
    focusAreas: '',
    description: '',
  };

  dbEspecialidades: CatalogoItem[] = [];
  documentName = '';
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private profesionalService: ProfesionalService,
    private catalogoService: CatalogoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.catalogoService.listarEspecialidades().subscribe({
      next: (list) => {
        this.dbEspecialidades = list || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las especialidades del catálogo.';
        this.cdr.detectChanges();
      },
    });
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const correo = this.form.email.trim().toLowerCase();
    const especialidad = this.normalizeSpecialty(this.form.specialty);

    if (!this.form.fullName.trim() || !this.form.username.trim()) {
      this.errorMessage = 'Completa nombre completo y nombre de usuario.';
      return;
    }
    if (!correo.includes('@') || !this.form.password) {
      this.errorMessage = 'Completa correo y contrasena.';
      return;
    }
    if (this.form.password !== this.form.confirmPassword) {
      this.errorMessage = 'Las contrasenas no coinciden.';
      return;
    }
    if (!especialidad || !this.form.license.trim()) {
      this.errorMessage = 'Completa especialidad y numero de colegiatura.';
      return;
    }
    if (!this.form.description.trim() || !this.documentName) {
      this.errorMessage = 'Completa descripcion profesional y adjunta documento de validacion.';
      return;
    }

    this.loading = true;
    this.profesionalService.registrar({
      nombre: this.form.fullName.trim(),
      username: this.form.username.trim(),
      correo,
      password: this.form.password,
      especialidad,
      numeroColegiatura: this.form.license.trim(),
      aniosExperiencia: Number(this.form.experience) || 0,
      etiquetas: this.form.focusAreas.trim(),
      descripcionPerfil: this.form.description.trim(),
      documentoValidacion: this.documentName,
    })
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: () => {
        this.successMessage = 'Solicitud enviada. El administrador debe aprobar al profesional.';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'No se pudo registrar el profesional.';
        this.cdr.detectChanges();
      },
    });
  }

  normalizeSpecialty(value: string): string {
    const map: Record<string, string> = {
      'psicologia-clinica': 'Psicologia clinica',
      'psiquiatria': 'Psiquiatria',
      'terapia-pareja': 'Terapia de Pareja',
    };
    return map[value] || value;
  }

  onDocumentChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.documentName = input.files?.[0]?.name || '';
  }

  goPatientRegister(): void {
    this.router.navigate(['/register']);
  }
}

