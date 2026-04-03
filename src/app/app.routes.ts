import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'clients',
    loadComponent: () => import('./features/clients/clients.component').then(m => m.ClientsComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
