import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PacienteService } from '../../services/paciente-service';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-register',
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
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
})
export class RegisterComponent {
  form = {
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: undefined as number | undefined,
    gender: '',
    dob: '',
    phone: '',
    emergency: '',
  };

  showPassword = false;
  showConfirmPassword = false;
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(private pacienteService: PacienteService, private router: Router, private cdr: ChangeDetectorRef) {}

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const fullName = this.form.fullName.trim();
    const email = this.form.email.trim().toLowerCase();
    const phone = this.onlyDigits(this.form.phone);
    const emergency = this.onlyDigits(this.form.emergency);
    const edad = Number(this.form.age);

    if (!fullName || !email.includes('@') || this.form.password.length < 4) {
      this.errorMessage = 'Completa nombre, correo valido y contrasena.';
      return;
    }
    if (this.form.password !== this.form.confirmPassword) {
      this.errorMessage = 'Las contrasenas no coinciden.';
      return;
    }
    if (!edad || !this.form.gender || !this.form.dob) {
      this.errorMessage = 'Completa edad, genero y fecha de nacimiento.';
      return;
    }
    if (phone.length !== 9 || emergency.length !== 9) {
      this.errorMessage = 'Telefono y contacto de emergencia deben tener 9 digitos.';
      return;
    }

    this.loading = true;
    this.pacienteService.registrar({
      nombre: fullName,
      username: this.form.username.trim() || email.split('@')[0],
      correo: email,
      password: this.form.password,
      edad,
      genero: this.form.gender,
      fechaNacimiento: this.form.dob,
      telefono: phone,
      contactoEmergencia: emergency,
    })
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: () => {
        this.successMessage = 'Registro exitoso. Redireccionando a iniciar sesion...';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 900);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'No se pudo registrar el paciente.';
        this.cdr.detectChanges();
      },
    });
  }

  onlyDigits(value: string): string {
    return value.replace(/\D/g, '').slice(-9);
  }

  goProfessionalRegister(): void {
    this.router.navigate(['/professional-register']);
  }
}