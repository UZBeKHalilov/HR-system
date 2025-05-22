import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class PayrollService {

  private apiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private safeGetCookie(key: string): string {
    return isPlatformBrowser(this.platformId) ? this.cookieService.get(key) : '';
  }

  schedulePayroll(payload: {
    employeeId: number;
    workStartTime: string;
    workEndTime: string;
    workDays: string;
    hourlyRate: number;
  }): Observable<any> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

    const url = `${this.apiUrl}/Payroll/schedule`;
    return this.http.post<any>(url, payload, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getPayroll(id?: string, month?: number, year?: number): Observable<any> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    let url = `${this.apiUrl}/Payroll/GetPayroll`;
    const params: string[] = [];
    if (id) params.push(`id=${id}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }


  // Yangi POST metodi
  payPayroll(payload: {
    employeeId: number;
    paidAmount: number;
    month: number;
    year: number;
  }): Observable<any> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

    const url = `${this.apiUrl}/Payroll/pay`;
    return this.http.post<any>(url, payload, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getPayrollHistory(employeeId: string, month: number, year: number): Observable<any> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const url = `${this.apiUrl}/Payroll/payroll-history?employeeId=${employeeId}&month=${month}&year=${year}`;
    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  getGeneralReport(month: number, year: number): Observable<any> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const url = `${this.apiUrl}/Payroll/general-report?month=${month}&year=${year}`;
    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error && typeof error.error === 'string') {
      errorMessage = `Error: ${error.error}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.status === 0) errorMessage = 'Unable to connect to the server.';
      else if (error.status === 401) errorMessage = 'Unauthorized. Please login again.';
      else if (error.status === 400) errorMessage = 'Bad request. Check the payload.';
    }
    console.error('Payroll API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}