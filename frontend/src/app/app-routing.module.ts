import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import components
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { StatementListComponent } from './modules/statement-list/statement-list.component';
import { StatementViewerComponent } from './modules/statement-viewer/statement-viewer.component';
import { AnalyticsComponent } from './modules/analytics/analytics.component';
import { UploadComponent } from './modules/upload/upload.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'statements', component: StatementListComponent },
  { path: 'statements/:id', component: StatementViewerComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'upload', component: UploadComponent },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 