import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Employee } from '../models/employee.model';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private apiUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private safeGetCookie(key: string): string {
    return isPlatformBrowser(this.platformId) ? this.cookieService.get(key) : '';
  }

  getEmployees(): Observable<Employee[]> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Employee[]>(`${this.apiUrl}/api/Employee`, { headers }).pipe(
      map(employees => employees.map(emp => ({
        ...emp,
        profileImagePath: emp.profileImagePath ? `${this.apiUrl}${emp.profileImagePath}` : null,
      }))),
      catchError(this.handleError)
    );
  }

  getCurrentEmployee(): Observable<Employee> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Employee>(`${this.apiUrl}/api/Employee/employee-info`, { headers }).pipe(
      map(employee => {
        const transformedEmployee = {
          ...employee,
          profileImagePath: employee.profileImagePath ? `${this.apiUrl}${employee.profileImagePath}` : null,
        };
        console.log('Transformed Current Employee from /employee-info:', transformedEmployee);
        return transformedEmployee;
      }),
      catchError(this.handleError)
    );
  }
  
  getEmployeeInfo(id: string): Observable<any> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any>(`${this.apiUrl}/api/Employee/employee-info/${id}`, { headers }).pipe(
      map(employee => {
        const transformedEmployee = {
          ...employee,
          profileImagePath: employee.profileImagePath ? `${this.apiUrl}${employee.profileImagePath}` : null,
        };
        console.log(`getEmployeeInfo(${id}) transformed:`, transformedEmployee.profileImagePath); // URL ni tekshirish
        return transformedEmployee;
      }),
      catchError(this.handleError)
    );
  }

  getDepartments(): Observable<any[]> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any[]>(`${this.apiUrl}/api/Department`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  registerEmployee(employee: any): Observable<any> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.apiUrl}/api/Employee/register`, employee, { headers }).pipe(
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