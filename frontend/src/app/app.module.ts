import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NgChartsModule } from 'ng2-charts';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxDropzoneModule } from 'ngx-dropzone';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Import components
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { StatementListComponent } from './modules/statement-list/statement-list.component';
import { StatementViewerComponent } from './modules/statement-viewer/statement-viewer.component';
import { TransactionListComponent } from './modules/transaction-list/transaction-list.component';
import { AnalyticsComponent } from './modules/analytics/analytics.component';
import { UploadComponent } from './modules/upload/upload.component';
import { NavigationComponent } from './shared/navigation/navigation.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    StatementListComponent,
    StatementViewerComponent,
    TransactionListComponent,
    AnalyticsComponent,
    UploadComponent,
    NavigationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgChartsModule,
    PdfViewerModule,
    NgxDropzoneModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { } 