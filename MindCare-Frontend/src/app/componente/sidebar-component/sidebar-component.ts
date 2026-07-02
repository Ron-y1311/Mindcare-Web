import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-component.html'
})
export class SidebarComponent implements OnInit {
  userName = 'Usuario';
  userRole = ''; // 'PACIENTE', 'PROFESIONAL', 'ADMIN'

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.userName = user.nombre || 'Usuario';
      this.userRole = this.auth.primaryRole(user.roles);
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
