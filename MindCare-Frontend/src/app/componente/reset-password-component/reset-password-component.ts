import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, RouterModule],
  templateUrl: './reset-password-component.html',
  styleUrl: './reset-password-component.css',
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  password = '';
  confirmPassword = '';
  message = '';
  errorMessage = '';
  loading = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.cdr.detectChanges();
    });
  }

  submit(): void {
    this.message = '';
    this.errorMessage = '';

    if (!this.token.trim()) {
      this.errorMessage = 'Código de recuperación o token ausente. Revisa el enlace enviado a tu correo.';
      return;
    }

    if (!this.password || !this.confirmPassword) {
      this.errorMessage = 'Ingresa y confirma tu nueva contraseña.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.http.put(`${environment.apiURL}/usuarios/restablecer-password`, {
      token: this.token.trim(),
      nuevaPassword: this.password
    }, { responseType: 'text' })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.message = 'Contraseña restablecida correctamente. Redirigiendo al inicio de sesión...';
          this.cdr.detectChanges();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.loading = false;
          let detail = '';
          if (err?.error && typeof err.error === 'string') {
            try {
              const parsed = JSON.parse(err.error);
              detail = parsed.message;
            } catch {}
          }
          this.errorMessage = detail || err?.error?.message || 'No se pudo restablecer la contraseña. Revisa si el token ha expirado o es inválido.';
          this.cdr.detectChanges();
        }
      });
  }
}
