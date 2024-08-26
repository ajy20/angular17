import { Route } from "@angular/router";
import { HomeComponent } from "./home/home.component";

export const WORK_ROUTES: Route[] = [
  { path: 'home', component: HomeComponent },
  
  { path: 'change', loadChildren: () => import('./change-management/routes').then(mod => mod.CHANGE_MANAGEMENT_ROUTES) },
  { path: 'planning', loadChildren: () => import('./planning/routes').then(mod => mod.PLANNING_ROUTES) },
  { path: 'projects', loadChildren: () => import('./projects/routes').then(mod => mod.PROJECTS_ROUTES) },

  { path: '', redirectTo: 'home', pathMatch: 'full' }
];
