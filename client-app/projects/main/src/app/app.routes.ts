import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { LoginFailedComponent } from './login-failed/login-failed.component';

export const routes: Routes = [
  { path: 'home', canActivate: [MsalGuard], loadChildren: () => import('./features/home/routes').then(mod => mod.HOME_ROUTES) },
  { path: 'products', canActivate: [MsalGuard], loadChildren: () => import('./features/products/routes').then(mod => mod.PRODUCTS_ROUTES) },
  { path: 'work', canActivate: [MsalGuard], loadChildren: () => import('./features/work/routes').then(mod => mod.WORK_ROUTES) },
  { path: 'documentation', canActivate: [MsalGuard], loadChildren: () => import('./features/documentation/routes').then(mod => mod.DOCUMENTATION_ROUTES) },
  { path: 'admin', canActivate: [MsalGuard], loadChildren: () => import('./features/admin/routes').then(mod => mod.ADMIN_ROUTES) },
  { path: 'login-failed', component: LoginFailedComponent }
 ];
