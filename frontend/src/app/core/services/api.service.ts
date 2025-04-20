import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Statement, StatementList, StatementSummary, ComparisonData } from '../models/statement.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Statement Endpoints
  getStatements(): Observable<StatementList> {
    return this.http.get<StatementList>(`${this.apiUrl}/statements`);
  }

  getStatement(id: string): Observable<Statement> {
    return this.http.get<Statement>(`${this.apiUrl}/statements/${id}`);
  }

  uploadStatement(file: File, password?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (password) {
      formData.append('password', password);
    }
    
    return this.http.post(`${this.apiUrl}/statements/upload`, formData);
  }

  // Transaction Endpoints
  updateTransactionCategory(transactionId: string, category: string, learn: boolean = true): Observable<any> {
    return this.http.put(`${this.apiUrl}/transactions/${transactionId}`, { category, learn });
  }

  // Analytics Endpoints
  getStatementSummary(statementId: string): Observable<StatementSummary> {
    return this.http.get<StatementSummary>(`${this.apiUrl}/analytics/summary?statement_id=${statementId}`);
  }

  getAllSummaries(month?: number, year?: number): Observable<{ summaries: StatementSummary[] }> {
    let params = new HttpParams();
    
    if (month !== undefined) {
      params = params.append('month', month.toString());
    }
    
    if (year !== undefined) {
      params = params.append('year', year.toString());
    }
    
    return this.http.get<{ summaries: StatementSummary[] }>(`${this.apiUrl}/analytics/summary`, { params });
  }

  compareStatements(statementIds: string[]): Observable<ComparisonData> {
    let params = new HttpParams();
    
    statementIds.forEach(id => {
      params = params.append('statement_ids', id);
    });
    
    return this.http.get<ComparisonData>(`${this.apiUrl}/analytics/compare`, { params });
  }
} 