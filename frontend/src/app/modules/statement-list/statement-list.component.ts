import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Statement } from '../../core/models/statement.model';

@Component({
  selector: 'app-statement-list',
  template: `
    <div class="statement-list-container">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Credit Card Statements</h2>
          <button class="btn btn-primary" routerLink="/upload">
            <span class="material-icons">add</span> Upload New
          </button>
        </div>

        <div *ngIf="loading" class="loading">
          <p>Loading statements...</p>
        </div>

        <div *ngIf="!loading && error" class="alert alert-error">
          <p>{{ error }}</p>
        </div>

        <div *ngIf="!loading && !error">
          <div *ngIf="statements.length === 0" class="no-data">
            <p>No statements found. Please upload a statement to get started.</p>
            <button class="btn btn-primary" routerLink="/upload">Upload Statement</button>
          </div>

          <table *ngIf="statements.length > 0" class="statement-table">
            <thead>
              <tr>
                <th>Statement</th>
                <th>Date</th>
                <th>Transactions</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let statement of statements">
                <td>{{ getMonthName(statement.month) }} {{ statement.year }}</td>
                <td>{{ statement.upload_date | date:'medium' }}</td>
                <td>{{ statement.transactions.length }}</td>
                <td>{{ getTotalAmount(statement) | currency:'LKR ' }}</td>
                <td>
                  <button class="btn btn-primary btn-sm" [routerLink]="['/statements', statement.id]">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .statement-list-container {
      padding: 20px;
    }
    
    .loading, .no-data {
      padding: 30px;
      text-align: center;
    }
    
    .statement-table {
      width: 100%;
      margin-top: 20px;
    }
    
    .btn-sm {
      padding: 4px 8px;
      font-size: 14px;
    }
    
    .card-header .material-icons {
      font-size: 16px;
      vertical-align: middle;
      margin-right: 5px;
    }
  `]
})
export class StatementListComponent implements OnInit {
  statements: Statement[] = [];
  loading = true;
  error: string | null = null;
  
  constructor(private apiService: ApiService) { }
  
  ngOnInit(): void {
    this.loadStatements();
  }
  
  loadStatements(): void {
    this.loading = true;
    this.apiService.getStatements().subscribe({
      next: (response) => {
        this.statements = response.statements.sort((a, b) => {
          if (a.year !== b.year) {
            return b.year - a.year;
          }
          return b.month - a.month;
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading statements. Please try again later.';
        this.loading = false;
        console.error('Statement list error:', err);
      }
    });
  }
  
  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
  }
  
  getTotalAmount(statement: Statement): number {
    return statement.transactions.reduce((total, transaction) => total + transaction.amount, 0);
  }
} 