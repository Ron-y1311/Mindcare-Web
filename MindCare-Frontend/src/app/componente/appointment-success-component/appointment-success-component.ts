import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-appointment-success',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  templateUrl: './appointment-success-component.html',
  styleUrl: './appointment-success-component.css',
})
export class AppointmentSuccessComponent implements OnInit {
  successDateTime = 'Consulta agendada correctamente';
  successDoctor = 'Profesional MindCare';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.requireUser();
  }
}