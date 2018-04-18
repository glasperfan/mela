import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './components';
export const routes: Routes = [
  {
    path: 'mela',
    component: MainComponent,
    pathMatch: 'full',
  }
];

export const MELA_ROUTES: ModuleWithProviders = RouterModule.forRoot(routes);
