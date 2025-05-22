import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private apiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private safeGetCookie(key: string): string {
    return isPlatformBrowser(this.platformId) ? this.cookieService.get(key) : '';
  }
  getMyAttendance(): Observable<any> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any>(`${this.apiUrl}/Attendance/my-attendance`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getAttendanceByEmployeeId(employeeId: string): Observable<any> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
    const params = new HttpParams().set('employeeId', employeeId);
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any>(`${this.apiUrl}/Attendance`, { headers, params }).pipe(
      catchError(this.handleError)
    );
  }

  
  postAttendanceEntry(employeeId: number): Observable<any> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const body = { employeeId };
    return this.http.post<any>(`${this.apiUrl}/Attendance/entry`, body, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  postAttendanceExit(employeeId: number): Observable<any> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const body = { employeeId };
    return this.http.post<any>(`${this.apiUrl}/Attendance/exit`, body, { headers }).pipe(
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
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}