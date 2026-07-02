import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { timeout } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  correo = '';
  password = '';
  remember = false;
  showPassword = false;
  loading = false;
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  submit(): void {
    this.errorMessage = '';
    const correo = this.correo.trim();

    if (!correo || !this.password) {
      this.errorMessage = 'Ingresa correo y contrasena.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.auth.login(correo, this.password).pipe(timeout(10000)).subscribe({
      next: (res) => {
        this.loading = false;
        const rol = this.auth.primaryRole(res.roles);
        if (rol === 'ADMIN') {
          this.auth.clearSession();
          this.errorMessage = 'Este acceso es solo para pacientes y profesionales. Usa Acceso Admin.';
          this.cdr.detectChanges();
          return;
        }
        this.cdr.detectChanges();
        this.goByRole(rol);
      },
      error: (err: HttpErrorResponse | Error) => {
        this.loading = false;
        this.errorMessage = this.loginErrorMessage(err);
        this.cdr.detectChanges();
      },
    });
  }

  loginErrorMessage(err: HttpErrorResponse | Error): string {
    if (err.name === 'TimeoutError') {
      return 'El backend no respondio a tiempo. Intenta nuevamente.';
    }
    if (err instanceof HttpErrorResponse && err.status === 0) {
      return 'No se pudo conectar con el backend. Verifica que Spring Boot este iniciado en http://localhost:8080.';
    }
    if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
      return 'Correo o contrasena incorrectos.';
    }
    return err instanceof HttpErrorResponse && err.error?.message ? err.error.message : 'No se pudo iniciar sesion. Intenta nuevamente.';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goRegister(): void {
    this.router.navigate(['/register']);
  }

  goByRole(rol: string): void {
    if (rol.includes('PROF')) this.router.navigate(['/professional-dashboard']);
    else this.router.navigate(['/patient-dashboard']);
  }
}
