import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { StatementSummary } from '../../core/models/statement.model';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Dashboard</h2>
        </div>
        <div *ngIf="loading" class="loading">
          <p>Loading dashboard data...</p>
        </div>
        <div *ngIf="!loading && error" class="alert alert-error">
          <p>{{ error }}</p>
        </div>
        <div *ngIf="!loading && !error">
          <div *ngIf="summaries.length === 0" class="no-data">
            <p>No statements found. Please upload a statement to get started.</p>
            <button class="btn btn-primary" routerLink="/upload">Upload Statement</button>
          </div>
          <div *ngIf="summaries.length > 0">
            <div class="summary-section">
              <h3>Recent Statements</h3>
              <div class="statement-grid grid grid-2">
                <div *ngFor="let summary of recentSummaries" class="statement-card">
                  <h4>{{ getMonthName(summary.month) }} {{ summary.year }}</h4>
                  <div class="chart-container">
                    <canvas
                      baseChart
                      [data]="getPieChartData(summary)"
                      [type]="'pie'"
                      [options]="pieChartOptions">
                    </canvas>
                  </div>
                  <div class="statement-total">
                    <p><strong>Total:</strong> {{ summary.total | currency:'LKR ' }}</p>
                  </div>
                  <div class="statement-actions">
                    <button class="btn btn-primary" [routerLink]="['/statements', summary.id]">View Details</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="spending-trends">
              <h3>Monthly Spending</h3>
              <div class="chart-container">
                <canvas
                  baseChart
                  [data]="getBarChartData()"
                  [type]="'bar'"
                  [options]="barChartOptions">
                </canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
    
    .loading, .no-data {
      padding: 30px;
      text-align: center;
    }
    
    .summary-section, .spending-trends {
      margin-bottom: 30px;
    }
    
    .statement-card {
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 5px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .statement-card h4 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
    }
    
    .chart-container {
      position: relative;
      height: 200px;
      margin: 15px 0;
    }
    
    .statement-total {
      margin: 15px 0;
      font-size: 16px;
    }
    
    .statement-actions {
      margin-top: 15px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  summaries: StatementSummary[] = [];
  loading = true;
  error: string | null = null;
  
  // Define category colors - moved to class level for access by all methods
  categoryColors: {[key: string]: string} = {
    'Grocery': '#FF6384',
    'Fuel': '#36A2EB',
    'Textile': '#FFCE56',
    'Dining/Restaurants': '#4BC0C0',
    'Utilities': '#9966FF',
    'Housing': '#FF9F40',
    'Healthcare': '#C9CBCF',
    'Entertainment': '#7CFC00',
    'Travel': '#8A2BE2',
    'Transportation': '#00FFFF',
    'Shopping': '#FF7F50',
    'Education': '#6495ED',
    'Personal Care': '#DC143C',
    'Subscriptions': '#00FF7F',
    'Insurance': '#FF4500',
    'Gifts/Donations': '#DA70D6',
    'Financial': '#1E90FF',
    'Payment': '#808080', // Grey color for Payment category
    'Other': '#A9A9A9'
  };
  
  // Chart configurations with proper typing
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
  
  barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  constructor(private apiService: ApiService) { }
  
  ngOnInit(): void {
    this.loadDashboardData();
  }
  
  loadDashboardData(): void {
    this.loading = true;
    this.apiService.getAllSummaries().subscribe({
      next: (response) => {
        this.summaries = response.summaries;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading dashboard data. Please try again later.';
        this.loading = false;
        console.error('Dashboard data error:', err);
      }
    });
  }
  
  get recentSummaries(): StatementSummary[] {
    return this.summaries
      .sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year;
        }
        return b.month - a.month;
      })
      .slice(0, 2);
  }
  
  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
  }
  
  getPieChartData(summary: StatementSummary) {
    // Filter out Payment category
    const filteredSummary = { ...summary.summary };
    delete filteredSummary['Payment'];
    
    return {
      labels: Object.keys(filteredSummary),
      datasets: [{
        data: Object.values(filteredSummary),
        backgroundColor: Object.keys(filteredSummary).map(category => 
          this.categoryColors[category] || '#A9A9A9' // Default to gray if color not found
        )
      }]
    };
  }
  
  getBarChartData() {
    // Get last 6 months or fewer if not available
    const displayedSummaries = this.summaries
      .sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }
        return a.month - b.month;
      })
      .slice(-6);
    
    // Prepare labels and data for each category
    const labels = displayedSummaries.map(s => `${this.getMonthName(s.month).substring(0, 3)} ${s.year}`);
    
    // Create datasets for the top 6 categories with highest spending
    // This prevents the chart from becoming too crowded
    const topCategories = this.getTopCategories(displayedSummaries, 6);
    
    // Fix typing of the datasets array
    const datasets: Array<{label: string, data: number[], backgroundColor: string}> = [];
    
    // Add datasets for top categories
    topCategories.forEach(category => {
      datasets.push({
        label: category,
        data: displayedSummaries.map(summary => summary.summary[category] || 0),
        backgroundColor: this.categoryColors[category] || '#A9A9A9' // Default to gray if color not found
      });
    });
    
    return {
      labels,
      datasets
    };
  }

  // Helper function to get top categories by spending
  getTopCategories(summaries: StatementSummary[], count: number): string[] {
    // Create a map to track total spending per category
    const categoryTotals: {[key: string]: number} = {};
    
    // Sum up all spending by category (excluding Payments)
    summaries.forEach(summary => {
      Object.entries(summary.summary).forEach(([category, amount]) => {
        if (category !== 'Payment') {
          if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
          }
          categoryTotals[category] += amount;
        }
      });
    });
    
    // Sort categories by total spending
    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1]) // Sort descending
      .slice(0, count) // Take top N categories
      .map(entry => entry[0]); // Return category names only
  }
} 