import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-reprogram-success',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  templateUrl: './reprogram-success-component.html',
  styleUrl: './reprogram-success-component.css',
})
export class ReprogramSuccessComponent implements OnInit {
  successMessage = 'Tu cita fue reprogramada correctamente.';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.requireUser();
  }
}