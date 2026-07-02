import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, RouterModule],
  templateUrl: './forgot-password-component.html',
  styleUrl: './forgot-password-component.css',
})
export class ForgotPasswordComponent {
  correo = '';
  message = '';
  errorMessage = '';
  loading = false;

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  submit(): void {
    this.message = '';
    this.errorMessage = '';
    this.loading = true;
    this.cdr.detectChanges();

    this.http.post(`${environment.apiURL}/usuarios/recuperar-password`, { correo: this.correo }, { responseType: 'text' })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.message = 'Se han enviado las instrucciones de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada.';
          this.cdr.detectChanges();
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
          this.errorMessage = detail || err?.error?.message || 'No se pudo procesar la solicitud de recuperación. Verifica el correo ingresado.';
          this.cdr.detectChanges();
        }
      });
  }
}