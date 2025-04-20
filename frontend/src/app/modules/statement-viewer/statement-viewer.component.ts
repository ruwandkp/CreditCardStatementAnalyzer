import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Statement, Transaction, StatementSummary } from '../../core/models/statement.model';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-statement-viewer',
  template: `
    <div class="statement-viewer-container">
      <div *ngIf="loading" class="loading">
        <p>Loading statement...</p>
      </div>

      <div *ngIf="!loading && error" class="alert alert-error">
        <p>{{ error }}</p>
      </div>

      <div *ngIf="!loading && !error" class="statement-content">
        <div class="card header-card">
          <div class="card-header">
            <h2 class="card-title">
              {{ getMonthName(statement?.month || 0) }} {{ statement?.year || '' }} Statement
            </h2>
            <button class="btn btn-secondary" routerLink="/statements">
              <span class="material-icons">arrow_back</span> Back to Statements
            </button>
          </div>
        </div>

        <div class="grid grid-2">
          <div class="card pdf-viewer-card">
            <div class="card-header">
              <h3>Original Statement</h3>
            </div>
            <div class="pdf-container">
              <pdf-viewer 
                [src]="pdfUrl" 
                [render-text]="true"
                [original-size]="false"
                [show-all]="true"
                [fit-to-page]="true"
                style="display: block;"
              ></pdf-viewer>
            </div>
          </div>

          <div class="card summary-card">
            <div class="card-header">
              <h3>Spending Summary</h3>
            </div>
            <div *ngIf="summary" class="summary-content">
              <div class="chart-container">
                <canvas
                  baseChart
                  [data]="getPieChartData()"
                  [type]="'pie'"
                  [options]="pieChartOptions">
                </canvas>
              </div>
              <div class="category-breakdown">
                <div *ngFor="let category of categories" class="category-item">
                  <div class="category-label">{{ category }}</div>
                  <div class="category-amount">{{ getCategoryAmount(category) | currency:'LKR ' }}</div>
                  <div class="category-percentage">
                    {{ calculatePercentage(getCategoryAmount(category)) }}%
                  </div>
                </div>
              </div>
              <div class="total-amount">
                <div>Total Spending</div>
                <div>{{ summary.total | currency:'LKR ' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card transactions-card">
          <div class="card-header">
            <h3>Transactions</h3>
          </div>
          <div class="transaction-list-container">
            <app-transaction-list 
              [transactions]="statement?.transactions || []"
              (categoryUpdated)="onCategoryUpdated($event)">
            </app-transaction-list>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .statement-viewer-container {
      padding: 20px;
    }
    
    .loading {
      padding: 30px;
      text-align: center;
    }
    
    .statement-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .header-card {
      margin-bottom: 0;
    }
    
    .pdf-container {
      height: 500px;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .chart-container {
      height: 250px;
      position: relative;
      margin-bottom: 20px;
    }
    
    .category-breakdown {
      margin-bottom: 20px;
    }
    
    .category-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    
    .total-amount {
      display: flex;
      justify-content: space-between;
      padding: 15px 0;
      font-weight: bold;
      font-size: 18px;
      border-top: 2px solid #ddd;
      margin-top: 10px;
    }
    
    .material-icons {
      font-size: 16px;
      vertical-align: middle;
      margin-right: 5px;
    }
    
    @media (max-width: 768px) {
      .grid-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StatementViewerComponent implements OnInit {
  statement: Statement | null = null;
  summary: StatementSummary | null = null;
  pdfUrl: string = '';
  loading = true;
  error: string | null = null;
  
  // All available categories
  categories: string[] = [
    "Grocery", "Fuel", "Textile", "Dining/Restaurants", "Utilities", "Housing", 
    "Healthcare", "Entertainment", "Travel", "Transportation", "Shopping", 
    "Education", "Personal Care", "Subscriptions", "Insurance", 
    "Gifts/Donations", "Financial", "Other"
  ];
  
  // Chart configurations
  pieChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12
          }
        }
      }
    }
  };
  
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) { }
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadStatement(id);
      } else {
        this.error = 'Statement ID not found';
        this.loading = false;
      }
    });
  }
  
  loadStatement(id: string): void {
    this.loading = true;
    this.error = null;
    
    // Load statement details
    this.apiService.getStatement(id).subscribe({
      next: (statement) => {
        this.statement = statement;
        this.pdfUrl = `http://localhost:8000/pdfs/${statement.filename}`;
        this.loadSummary(id);
      },
      error: (err) => {
        this.error = 'Error loading statement. Please try again later.';
        this.loading = false;
        console.error('Statement loading error:', err);
      }
    });
  }
  
  loadSummary(id: string): void {
    this.apiService.getStatementSummary(id).subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading statement summary. Please try again later.';
        this.loading = false;
        console.error('Summary loading error:', err);
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
  
  getPieChartData() {
    if (!this.summary) return { labels: [], datasets: [{ data: [] }] };
    
    // Define category colors
    const categoryColors: {[key: string]: string} = {
      'Grocery': '#FF6384',
      'Fuel': '#36A2EB',
      'Textile': '#FFCE56',
      'Dining/Restaurants': '#9966FF',
      'Utilities': '#C9CBCF',
      'Housing': '#FF9F40',
      'Healthcare': '#7CFC00',
      'Entertainment': '#8A2BE2',
      'Travel': '#00FFFF',
      'Transportation': '#FF7F50',
      'Shopping': '#6495ED',
      'Education': '#DC143C',
      'Personal Care': '#00FF7F',
      'Subscriptions': '#FF4500',
      'Insurance': '#DA70D6',
      'Gifts/Donations': '#1E90FF',
      'Financial': '#A0522D',
      'Other': '#A9A9A9'
    };
    
    // Filter out Payment category from summary
    const filteredSummary = { ...this.summary.summary };
    delete filteredSummary['Payment'];
    
    // Only include categories with amounts > 0
    const categories = Object.keys(filteredSummary).filter(cat => filteredSummary[cat] > 0);
    const values = categories.map(cat => filteredSummary[cat]);
    const colors = categories.map(cat => categoryColors[cat] || '#A9A9A9');
    
    return {
      labels: categories,
      datasets: [{
        data: values,
        backgroundColor: colors
      }]
    };
  }
  
  getCategoryAmount(category: string): number {
    if (!this.summary) return 0;
    return this.summary.summary[category] || 0;
  }
  
  calculatePercentage(amount: number): number {
    if (!this.summary || this.summary.total === 0) return 0;
    return Math.round((amount / this.summary.total) * 100);
  }
  
  onCategoryUpdated(transaction: { id: string, category: string }): void {
    // Reload summary after category update
    if (this.statement) {
      this.loadSummary(this.statement.id);
      
      // Update the local transaction data
      const index = this.statement.transactions.findIndex(t => t.id === transaction.id);
      if (index !== -1) {
        this.statement.transactions[index].category = transaction.category;
      }
    }
  }
} 