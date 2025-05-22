import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private apiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private safeGetCookie(key: string): string {
    return isPlatformBrowser(this.platformId) ? this.cookieService.get(key) : '';
  }


  uploadProfileImage(file: File): Observable<any> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
  
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const formData = new FormData();
    formData.append('file', file, file.name);
  
    return this.http.put(`${this.apiUrl}/Employee/upload-profile-image`, formData, { headers }).pipe(
      map(response => {
        // Assuming the API returns the updated employee or just the image path
        return response;
      }),
      catchError(this.handleError)
    );
  }
  
  // Delete profile image
  deleteProfileImage(): Observable<any> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
  
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.delete(`${this.apiUrl}/Employee/delete-profile-image`, { headers }).pipe(
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