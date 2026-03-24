import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../auth/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-menu-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './side-menu-header.component.html',
  styleUrls: ['./side-menu-header.component.css']
})
export class SideMenuHeaderComponent implements OnInit {

  envs = environment;
  private authService = inject(AuthService);
  private router = inject(Router);
  
  currentUser: any = null;
  homeRoute: string = '/statbet';

  notificationCount = 0;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.homeRoute = this.authService.getDefaultRouteByRole();
  }

  get fullName(): string {
    if (!this.currentUser) return 'Usuario';
    return `${this.currentUser.nombre}`;
  }

  get userRole(): string {
    return this.currentUser?.rol || '';
  }

  irANotificaciones(): void {
    this.router.navigate(['/statbet/notificaciones']);
  }
}