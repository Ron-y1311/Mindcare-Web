import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { timeout } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  templateUrl: './admin-login-component.html',
  styleUrl: './admin-login-component.css',
})
export class AdminLoginComponent {
  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  login(): void {
    this.errorMessage = '';
    const email = this.email.trim().toLowerCase();

    if (!email || !this.password) {
      this.errorMessage = 'Ingresa correo y contrasena.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.auth.login(email, this.password).pipe(timeout(10000)).subscribe({
      next: (res) => {
        this.loading = false;
        const rol = this.auth.primaryRole(res.roles);
        if (rol === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
          return;
        }

        this.auth.clearSession();
        this.errorMessage = 'Este acceso es exclusivo para administradores.';
        this.cdr.detectChanges();
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
      return 'Credenciales administrativas incorrectas.';
    }
    return err instanceof HttpErrorResponse && err.error?.message ? err.error.message : 'No se pudo iniciar sesion.';
  }
}