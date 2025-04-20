import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Transaction } from '../../core/models/statement.model';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-transaction-list',
  template: `
    <div class="transaction-list">
      <div class="filter-section">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search transactions..." 
            [(ngModel)]="searchTerm"
            (input)="filterTransactions()">
        </div>
        <div class="category-filter">
          <select [(ngModel)]="selectedCategory" (change)="filterTransactions()">
            <option value="">All Categories</option>
            <option *ngFor="let category of availableCategories" [value]="category">{{ category }}</option>
          </select>
        </div>
      </div>

      <div *ngIf="filteredTransactions.length === 0" class="no-transactions">
        <p>No transactions found.</p>
      </div>

      <table *ngIf="filteredTransactions.length > 0" class="transaction-table">
        <thead>
          <tr>
            <th (click)="sort('post_date')">
              Post Date
              <span *ngIf="sortColumn === 'post_date'" class="sort-icon">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th (click)="sort('inv_date')">
              Invoice Date
              <span *ngIf="sortColumn === 'inv_date'" class="sort-icon">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th (click)="sort('description')">
              Description
              <span *ngIf="sortColumn === 'description'" class="sort-icon">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th (click)="sort('amount')">
              Amount
              <span *ngIf="sortColumn === 'amount'" class="sort-icon">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let transaction of filteredTransactions">
            <td>{{ transaction.post_date | date:'shortDate' }}</td>
            <td>{{ transaction.inv_date | date:'shortDate' }}</td>
            <td>{{ transaction.description }}</td>
            <td>{{ transaction.amount | currency:'LKR ' }}</td>
            <td [ngClass]="'category-' + transaction.category.toLowerCase().replace('/', '-')">
              {{ transaction.category }}
            </td>
            <td>
              <div *ngIf="!isEditing(transaction.id)" class="actions">
                <button class="btn btn-sm" (click)="editCategory(transaction.id)">
                  <span class="material-icons">edit</span>
                </button>
              </div>
              <div *ngIf="isEditing(transaction.id)" class="edit-form">
                <select [(ngModel)]="editingCategory">
                  <option *ngFor="let category of availableCategories" [value]="category">{{ category }}</option>
                </select>
                <button class="btn btn-sm btn-primary" (click)="saveCategory(transaction.id)">
                  <span class="material-icons">check</span>
                </button>
                <button class="btn btn-sm btn-secondary" (click)="cancelEdit()">
                  <span class="material-icons">close</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .transaction-list {
      width: 100%;
    }
    
    .filter-section {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .search-box {
      flex: 3;
    }
    
    .category-filter {
      flex: 1;
    }
    
    .no-transactions {
      padding: 20px;
      text-align: center;
      color: #666;
    }
    
    .transaction-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .transaction-table th {
      cursor: pointer;
      user-select: none;
    }
    
    .transaction-table th:hover {
      background-color: #f0f0f0;
    }
    
    .sort-icon {
      margin-left: 5px;
    }
    
    .category-grocery {
      color: #FF6384;
    }
    
    .category-fuel {
      color: #36A2EB;
    }
    
    .category-textile {
      color: #FFCE56;
    }
    
    .category-dining-restaurants {
      color: #9966FF;
    }
    
    .category-utilities {
      color: #C9CBCF;
    }
    
    .category-housing {
      color: #FF9F40;
    }
    
    .category-healthcare {
      color: #7CFC00;
    }
    
    .category-entertainment {
      color: #8A2BE2;
    }
    
    .category-travel {
      color: #00FFFF;
    }
    
    .category-transportation {
      color: #FF7F50;
    }
    
    .category-shopping {
      color: #6495ED;
    }
    
    .category-education {
      color: #DC143C;
    }
    
    .category-personal-care {
      color: #00FF7F;
    }
    
    .category-subscriptions {
      color: #FF4500;
    }
    
    .category-insurance {
      color: #DA70D6;
    }
    
    .category-gifts-donations {
      color: #1E90FF;
    }
    
    .category-financial {
      color: #A0522D;
    }
    
    .category-payment {
      color: #808080;
    }
    
    .category-other {
      color: #A9A9A9;
    }
    
    .actions, .edit-form {
      display: flex;
      gap: 5px;
    }
    
    .edit-form select {
      width: 100px;
    }
    
    .btn-sm {
      padding: 2px 5px;
      font-size: 12px;
    }
    
    .btn-sm .material-icons {
      font-size: 14px;
    }
  `]
})
export class TransactionListComponent {
  @Input() transactions: Transaction[] = [];
  @Output() categoryUpdated = new EventEmitter<{ id: string, category: string }>();
  
  filteredTransactions: Transaction[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  sortColumn: string = 'post_date';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  editingTransactionId: string | null = null;
  editingCategory: string = '';
  
  // List of all available categories
  availableCategories: string[] = [
    "Grocery", "Fuel", "Textile", "Dining/Restaurants", "Utilities", "Housing", 
    "Healthcare", "Entertainment", "Travel", "Transportation", "Shopping", 
    "Education", "Personal Care", "Subscriptions", "Insurance", 
    "Gifts/Donations", "Financial", "Payment", "Other"
  ];
  
  constructor(private apiService: ApiService) {}
  
  ngOnChanges(): void {
    this.filterTransactions();
  }
  
  filterTransactions(): void {
    let filtered = [...this.transactions];
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(t => t.category === this.selectedCategory);
    }
    
    // Apply sorting
    filtered = this.sortTransactions(filtered);
    
    this.filteredTransactions = filtered;
  }
  
  sortTransactions(transactions: Transaction[]): Transaction[] {
    return transactions.sort((a, b) => {
      let valueA, valueB;
      
      // Handle date fields
      if (this.sortColumn === 'post_date' || this.sortColumn === 'inv_date') {
        valueA = new Date(a[this.sortColumn as keyof Transaction] as string).getTime();
        valueB = new Date(b[this.sortColumn as keyof Transaction] as string).getTime();
      } else {
        valueA = a[this.sortColumn as keyof Transaction];
        valueB = b[this.sortColumn as keyof Transaction];
      }
      
      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  
  sort(column: string): void {
    if (this.sortColumn === column) {
      // Toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to descending
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }
    
    this.filterTransactions();
  }
  
  isEditing(transactionId: string): boolean {
    return this.editingTransactionId === transactionId;
  }
  
  editCategory(transactionId: string): void {
    const transaction = this.transactions.find(t => t.id === transactionId);
    if (transaction) {
      this.editingTransactionId = transactionId;
      this.editingCategory = transaction.category;
    }
  }
  
  cancelEdit(): void {
    this.editingTransactionId = null;
    this.editingCategory = '';
  }
  
  saveCategory(transactionId: string): void {
    if (!this.editingCategory) {
      return;
    }
    
    this.apiService.updateTransactionCategory(
      transactionId, 
      this.editingCategory
    ).subscribe({
      next: () => {
        // Update local data
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (transaction) {
          transaction.category = this.editingCategory;
          
          // Emit event to parent component
          this.categoryUpdated.emit({
            id: transactionId,
            category: this.editingCategory
          });
          
          // Reset editing state
          this.cancelEdit();
          
          // Reapply filters and sorting
          this.filterTransactions();
        }
      },
      error: (err) => {
        console.error('Error updating category:', err);
        alert('Failed to update category. Please try again.');
      }
    });
  }
} 