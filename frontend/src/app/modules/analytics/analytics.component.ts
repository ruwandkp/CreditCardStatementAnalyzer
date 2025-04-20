import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { StatementSummary } from '../../core/models/statement.model';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-analytics',
  template: `
    <div class="analytics-container">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Spending Analytics</h2>
        </div>
        
        <div *ngIf="loading" class="loading">
          <p>Loading analytics data...</p>
        </div>
        
        <div *ngIf="!loading && error" class="alert alert-error">
          <p>{{ error }}</p>
        </div>
        
        <div *ngIf="!loading && !error">
          <div *ngIf="summaries.length === 0" class="no-data">
            <p>No statements found. Please upload a statement to view analytics.</p>
            <button class="btn btn-primary" routerLink="/upload">Upload Statement</button>
          </div>
          
          <div *ngIf="summaries.length > 0">
            <div class="filters">
              <div class="form-group">
                <label for="year-filter">Filter by Year:</label>
                <select id="year-filter" [(ngModel)]="selectedYear" (change)="applyFilters()">
                  <option value="all">All Years</option>
                  <option *ngFor="let year of availableYears" [value]="year">{{ year }}</option>
                </select>
              </div>
            </div>
            
            <div class="analytics-section trend-section">
              <h3>Monthly Spending Trends</h3>
              <div class="chart-container">
                <canvas
                  baseChart
                  [data]="getLineChartData()"
                  [type]="'line'"
                  [options]="lineChartOptions">
                </canvas>
              </div>
            </div>
            
            <div class="analytics-section category-section">
              <h3>Spending by Category</h3>
              <div class="chart-container">
                <canvas
                  baseChart
                  [data]="getBarChartData()"
                  [type]="'bar'"
                  [options]="barChartOptions">
                </canvas>
              </div>
            </div>
            
            <div class="analytics-section statement-comparison">
              <h3>Statement Comparison</h3>
              
              <div class="comparison-selectors">
                <div *ngFor="let i of [0, 1]" class="form-group">
                  <label>Statement {{ i + 1 }}:</label>
                  <select [(ngModel)]="comparisonStatements[i]" (change)="updateComparison()">
                    <option value="">Select Statement</option>
                    <option *ngFor="let summary of summaries" [value]="summary.id">
                      {{ getMonthName(summary.month) }} {{ summary.year }}
                    </option>
                  </select>
                </div>
              </div>
              
              <div *ngIf="comparisonData.length === 2" class="comparison-chart">
                <div class="chart-container">
                  <canvas
                    baseChart
                    [data]="getComparisonChartData()"
                    [type]="'bar'"
                    [options]="comparisonChartOptions">
                  </canvas>
                </div>
                
                <div class="comparison-details">
                  <div class="comparison-statement">
                    <h4>{{ getMonthName(comparisonData[0].month) }} {{ comparisonData[0].year }}</h4>
                    <div class="comparison-total">
                      <strong>Total:</strong> {{ comparisonData[0].total | currency:'LKR ' }}
                    </div>
                  </div>
                  
                  <div class="comparison-statement">
                    <h4>{{ getMonthName(comparisonData[1].month) }} {{ comparisonData[1].year }}</h4>
                    <div class="comparison-total">
                      <strong>Total:</strong> {{ comparisonData[1].total | currency:'LKR ' }}
                    </div>
                    
                    <div class="comparison-difference" [ngClass]="getDifferenceClass()">
                      <strong>Difference:</strong> 
                      {{ getDifference() | currency:'LKR ' }}
                      ({{ getDifferencePercentage() }}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 20px;
    }
    
    .loading, .no-data {
      padding: 30px;
      text-align: center;
    }
    
    .filters {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .analytics-section {
      margin-bottom: 30px;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 5px;
    }
    
    .chart-container {
      height: 300px;
      position: relative;
      margin: 20px 0;
    }
    
    .comparison-selectors {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .comparison-selectors .form-group {
      flex: 1;
    }
    
    .comparison-details {
      display: flex;
      gap: 30px;
      margin-top: 20px;
    }
    
    .comparison-statement {
      flex: 1;
      padding: 15px;
      background-color: white;
      border-radius: 5px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .comparison-total, .comparison-difference {
      margin-top: 10px;
      padding: 5px 0;
    }
    
    .comparison-difference.increase {
      color: #dc3545;
    }
    
    .comparison-difference.decrease {
      color: #28a745;
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  summaries: StatementSummary[] = [];
  filteredSummaries: StatementSummary[] = [];
  loading = true;
  error: string | null = null;
  
  selectedYear: string = 'all';
  availableYears: number[] = [];
  
  comparisonStatements: string[] = ['', ''];
  comparisonData: StatementSummary[] = [];
  
  // Chart options
  lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
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
  
  comparisonChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    indexAxis: 'y'
  };
  
  constructor(private apiService: ApiService) { }
  
  ngOnInit(): void {
    this.loadAnalyticsData();
  }
  
  loadAnalyticsData(): void {
    this.loading = true;
    this.apiService.getAllSummaries().subscribe({
      next: (response) => {
        this.summaries = response.summaries.sort((a, b) => {
          if (a.year !== b.year) {
            return a.year - b.year;
          }
          return a.month - b.month;
        });
        
        // Extract available years
        this.availableYears = [...new Set(this.summaries.map(s => s.year))].sort();
        
        // Apply initial filters
        this.applyFilters();
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading analytics data. Please try again later.';
        this.loading = false;
        console.error('Analytics loading error:', err);
      }
    });
  }
  
  applyFilters(): void {
    if (this.selectedYear === 'all') {
      this.filteredSummaries = [...this.summaries];
    } else {
      const year = parseInt(this.selectedYear);
      this.filteredSummaries = this.summaries.filter(s => s.year === year);
    }
    
    // Reset comparison when filters change
    this.comparisonStatements = ['', ''];
    this.comparisonData = [];
  }
  
  updateComparison(): void {
    this.comparisonData = [];
    
    // Get the selected statements
    for (const id of this.comparisonStatements) {
      if (id) {
        const statement = this.summaries.find(s => s.id === id);
        if (statement) {
          this.comparisonData.push(statement);
        }
      }
    }
  }
  
  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
  }
  
  getLineChartData() {
    // Get all months in sequence
    const sortedSummaries = [...this.filteredSummaries].sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return a.month - b.month;
    });
    
    const labels = sortedSummaries.map(s => `${this.getMonthName(s.month).substring(0, 3)} ${s.year}`);
    const totalData = sortedSummaries.map(s => s.total);
    
    return {
      labels,
      datasets: [
        {
          label: 'Total Expenses',
          data: totalData,
          borderColor: '#3f51b5',
          tension: 0.1
        }
      ]
    };
  }
  
  getBarChartData() {
    // Calculate totals by category
    const categorySums: {[key: string]: number} = {};
    
    // Get all unique categories from all filtered summaries (excluding Payment)
    this.filteredSummaries.forEach(summary => {
      Object.entries(summary.summary).forEach(([category, amount]) => {
        if (category !== 'Payment') {
          if (!categorySums[category]) {
            categorySums[category] = 0;
          }
          categorySums[category] += amount;
        }
      });
    });
    
    // Define category colors mapping
    const categoryColors: {[key: string]: string} = {
      'Grocery': '#FF6384',
      'Fuel': '#36A2EB',
      'Textile': '#FFCE56', 
      'Entertainment': '#4BC0C0',
      'Dining/Restaurants': '#9966FF',
      'Travel': '#FF9F40',
      'Utilities': '#C9CBCF',
      'Housing': '#7CFC00',
      'Healthcare': '#8A2BE2',
      'Transportation': '#00FFFF',
      'Shopping': '#FF7F50',
      'Education': '#6495ED',
      'Personal Care': '#DC143C',
      'Subscriptions': '#00FF7F',
      'Insurance': '#FF4500',
      'Gifts/Donations': '#DA70D6',
      'Financial': '#1E90FF',
      'Other': '#A9A9A9'
    };
    
    // Set default colors for any categories not in our mapping
    const categories = Object.keys(categorySums);
    const backgroundColors = categories.map(category => 
      categoryColors[category] || '#A9A9A9' // Default to gray if no color defined
    );
    
    return {
      labels: categories,
      datasets: [
        {
          label: 'Total Spending by Category',
          data: Object.values(categorySums),
          backgroundColor: backgroundColors
        }
      ]
    };
  }
  
  getComparisonChartData() {
    if (this.comparisonData.length !== 2) return { labels: [], datasets: [] };
    
    // Get all unique categories from both statements (excluding Payment)
    const categories = new Set<string>();
    this.comparisonData.forEach(statement => {
      Object.keys(statement.summary).forEach(category => {
        if (category !== 'Payment') {
          categories.add(category);
        }
      });
    });
    
    // Convert to array
    const categoryArray = Array.from(categories);
    
    return {
      labels: categoryArray,
      datasets: [
        {
          label: `${this.getMonthName(this.comparisonData[0].month)} ${this.comparisonData[0].year}`,
          data: categoryArray.map(cat => this.comparisonData[0].summary[cat] || 0),
          backgroundColor: '#36A2EB'
        },
        {
          label: `${this.getMonthName(this.comparisonData[1].month)} ${this.comparisonData[1].year}`,
          data: categoryArray.map(cat => this.comparisonData[1].summary[cat] || 0),
          backgroundColor: '#FF6384'
        }
      ]
    };
  }
  
  getDifference(): number {
    if (this.comparisonData.length !== 2) return 0;
    return this.comparisonData[1].total - this.comparisonData[0].total;
  }
  
  getDifferencePercentage(): string {
    if (this.comparisonData.length !== 2 || this.comparisonData[0].total === 0) return '0';
    
    const diff = this.getDifference();
    const percentage = (diff / this.comparisonData[0].total) * 100;
    return percentage.toFixed(2);
  }
  
  getDifferenceClass(): string {
    const diff = this.getDifference();
    return diff > 0 ? 'increase' : diff < 0 ? 'decrease' : '';
  }
} 