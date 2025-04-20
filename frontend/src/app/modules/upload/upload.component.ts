import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-upload',
  template: `
    <div class="upload-container">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Upload Statement</h2>
        </div>
        <div class="card-content">
          <p class="upload-instructions">
            Upload your credit card statement PDF file. The system will extract transaction details
            and categorize your expenses automatically.
          </p>
          
          <div *ngIf="error" class="alert alert-error">
            {{ error }}
          </div>
          
          <div *ngIf="success" class="alert alert-success">
            {{ success }}
          </div>
          
          <ngx-dropzone 
            [multiple]="false" 
            [accept]="'.pdf'"
            (change)="onFileSelected($event)"
            [class.disabled]="loading">
            <ngx-dropzone-label>
              <div class="dropzone-content">
                <span class="material-icons">cloud_upload</span>
                <p>Drag and drop a PDF statement or click to browse</p>
                <p class="small">Only PDF files are accepted</p>
              </div>
            </ngx-dropzone-label>
          </ngx-dropzone>
          
          <div *ngIf="selectedFile" class="selected-file">
            <p>
              <strong>Selected file:</strong> {{ selectedFile.name }} 
              ({{ (selectedFile.size / 1024).toFixed(2) }} KB)
            </p>
          </div>
          
          <div class="password-form" *ngIf="selectedFile">
            <div class="form-group">
              <label for="password">PDF Password (if needed):</label>
              <input 
                type="password" 
                id="password" 
                [(ngModel)]="password"
                placeholder="Leave empty if not password protected">
            </div>
            
            <div class="form-actions">
              <button 
                class="btn btn-primary" 
                [disabled]="loading || !selectedFile" 
                (click)="uploadFile()">
                <span *ngIf="loading">Uploading...</span>
                <span *ngIf="!loading">Upload Statement</span>
              </button>
              <button 
                class="btn btn-secondary" 
                [disabled]="loading"
                (click)="resetForm()">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      padding: 20px;
    }
    
    .card-content {
      padding: 20px 0;
    }
    
    .upload-instructions {
      margin-bottom: 20px;
    }
    
    ngx-dropzone {
      height: 200px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f9f9f9;
      border: 2px dashed #ddd;
    }
    
    ngx-dropzone.disabled {
      pointer-events: none;
      opacity: 0.7;
    }
    
    .dropzone-content {
      text-align: center;
    }
    
    .dropzone-content .material-icons {
      font-size: 48px;
      color: #aaa;
      margin-bottom: 10px;
    }
    
    .small {
      font-size: 14px;
      color: #777;
      margin-top: 5px;
    }
    
    .selected-file {
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
  `]
})
export class UploadComponent {
  selectedFile: File | null = null;
  password: string = '';
  loading = false;
  error: string | null = null;
  success: string | null = null;
  
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}
  
  onFileSelected(event: any): void {
    const files = event.addedFiles;
    if (files.length > 0) {
      this.selectedFile = files[0];
      this.error = null;
    }
  }
  
  uploadFile(): void {
    if (!this.selectedFile) {
      this.error = 'Please select a file first';
      return;
    }
    
    this.loading = true;
    this.error = null;
    this.success = null;
    
    this.apiService.uploadStatement(this.selectedFile, this.password).subscribe({
      next: (response) => {
        this.success = 'Statement uploaded successfully!';
        this.loading = false;
        
        // Navigate to the statement view after a short delay
        setTimeout(() => {
          this.router.navigate(['/statements', response.id]);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 400) {
          this.error = err.error.detail || 'Invalid file format. Please upload a PDF file.';
        } else if (err.status === 401) {
          this.error = 'Incorrect password for encrypted PDF.';
        } else {
          this.error = 'An error occurred while uploading the statement. Please try again.';
        }
        console.error('Upload error:', err);
      }
    });
  }
  
  resetForm(): void {
    this.selectedFile = null;
    this.password = '';
    this.error = null;
    this.success = null;
  }
} 