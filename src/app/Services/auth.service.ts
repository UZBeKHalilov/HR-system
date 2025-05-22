import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getAuthState() {
    throw new Error('Method not implemented.');
  }
  private apiUrl = environment.baseUrl;
  private userSubject = new BehaviorSubject<{ name: string; role: string; avatar: string; token: string } | null>(null);

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    const user = this.safeGetCookie('user');
    if (user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  private safeGetCookie(key: string): string {
    return isPlatformBrowser(this.platformId) ? this.cookieService.get(key) || '' : '';
  }

  private safeSetCookie(key: string, value: string, days = 7): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cookieService.set(key, value, days, '/');
    }
  }

  private safeDeleteCookie(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cookieService.delete(key, '/');
    }
  }

  login(username: string, password: string): Observable<{ name: string; role: string; avatar: string; token: string }> {
    const body = { username, password };
    return this.http.post<any>(`${this.apiUrl}/api/Employee/login`, body).pipe(
      switchMap(response => {
        if (!response.token) {
          return throwError(() => new Error('Invalid login response. No token received.'));
        }
        
        const user = {
          name: response.username || 'Unknown User',
          role: response.role || 'Employee',
          avatar: '',
          token: response.token
        };
        
        this.safeSetCookie('token', response.token);
        this.safeSetCookie('user', JSON.stringify(user));
        
        return this.getProfileImage().pipe(
          map(imageResponse => {
            user.avatar = imageResponse.imagePath ? `${this.apiUrl}${imageResponse.imagePath}` : '';
            this.safeSetCookie('user', JSON.stringify(user));
            this.userSubject.next(user); // BehaviorSubject orqali user yangilandi
            return user;
          }),
          catchError(() => {
            this.safeSetCookie('user', JSON.stringify(user));
            this.userSubject.next(user); // Foydalanuvchi ma'lumotlarini yangilash
            return of(user);
          })
        );
      }),
      catchError(this.handleError)
    );
  }
  
  getUser(): Observable<{ name: string; role: string; avatar: string; token: string } | null> {
    return this.userSubject.asObservable(); // Observable sifatida return qilish
  }
  
  setUser(user: { name: string; role: string; avatar: string; token: string }) {
    this.userSubject.next(user); // Userni yangilash uchun ishlatiladi
  }
  
  getProfileImage(): Observable<{ imagePath: string | null }> {
    const token = this.safeGetCookie('token');
    if (!token) return throwError(() => new Error('No token found. Please login first.'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    
    return this.http.get<{ imagePath: string | null }>(`${this.apiUrl}/api/Employee/get-profile-image`, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  
  getToken(): string | null {
    return this.safeGetCookie('token') || null;
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  
  logout(): void {
    this.safeDeleteCookie('user');
    this.safeDeleteCookie('token');
    this.userSubject.next(null); // Userni null qilib BehaviorSubject ni yangilash
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error && typeof error.error === 'string') {
      errorMessage = `Error: ${error.error}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please check if the backend server is running.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please login again.';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
