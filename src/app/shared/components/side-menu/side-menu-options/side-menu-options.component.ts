import { Component, EventEmitter, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { routes } from '../../../../app.routes';
import { AuthService } from '../../../../auth/services/auth.service';

interface MenuOption {
  icon: string;
  label: string;
  route: string;
  subLabel: string;
  roles?: string[];
}

interface MenuItem {
  title: string;
  route: string;
  roles?: string[];
}

const reactiveItems = routes[1].children ?? [];

@Component({
  selector: 'app-side-menu-options',
  templateUrl: './side-menu-options.component.html',
  imports: [RouterLink, RouterLinkActive],
})
export class SideMenuOptionsComponent {
  @Output() optionSelected = new EventEmitter<void>();

  private authService = inject(AuthService);

  reactiveMenu: MenuItem[] = reactiveItems
  .filter((item) => item.path && item.path !== '**' && !item.redirectTo)
  .filter((item) => item.path !== 'notificaciones')
  .map((item) => ({
    route: `statbet/${item.path}`,
    title: `${item.title}`,
    roles: item.data?.['roles'] as string[],
  }));

  menuOptions: MenuOption[] = this.reactiveMenu
    .filter((item) => {
      if (!item.roles) return true;
      return this.authService.hasRole(item.roles);
    })
    .map((item) => ({
      icon: this.getIconForRoute(item.title),
      label: item.title,
      subLabel: ``,
      route: `/${item.route}`,
      roles: item.roles,
    }));

  logout(): void {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }

  onSelect() {
    this.optionSelected.emit();
  }

  getIconForRoute(name: string): string {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('inicio')) return 'fa-solid fa-house';
    if (lowerName.includes('partido')) return 'fa-solid fa-futbol';
    if (lowerName.includes('análisis') || lowerName.includes('analisis')) return 'fa-solid fa-chart-line';
    if (lowerName.includes('personalizar')) return 'fa-solid fa-sliders';
    if (lowerName.includes('sugerencia')) return 'fa-solid fa-lightbulb';
    if (lowerName.includes('pick')) return 'fa-solid fa-bullseye';
    if (lowerName.includes('rendimiento')) return 'fa-solid fa-chart-bar';
    if (lowerName.includes('usuario')) return 'fa-solid fa-users';
    if (lowerName.includes('notificaciones')) return 'fa-solid fa-bell';

    return 'fa-solid fa-circle-dot'; // icono por defecto
  }
}
