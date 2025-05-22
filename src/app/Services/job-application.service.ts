import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FormData } from 'undici-types';
import { environment } from '../../environments/environments';


export interface JobApplication {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  route: string | null;
  status: string;
  appliedAt: string;
  files: { fileName: string; filePath: string }[];
}

@Injectable({
  providedIn: 'root'
})

export class JobApplicationService {
  sendApprovalEmail(id: number, email: string) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = environment.apiBaseUrl;
  private baseUrl = environment.baseUrl; // Backend bazaviy URL

  constructor(private http: HttpClient) { }
  submitApplication(formData: globalThis.FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/JobApplication`, formData);
  }


  getApplications(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(`${this.apiUrl}/JobApplication/GetApplications`);
  }

  changeStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/JobApplication/ChangeStatus?id=${id}&status=${status}`, null);

  }

  deleteApplication(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/JobApplication/DeleteJobApplication?id=${id}`);
  }

  downloadFile(filePath: string): Observable<Blob> {
    const fullUrl = filePath.startsWith('http') ? filePath : `${this.baseUrl}${filePath}`; // To‘liq URL yaratish
    console.log('To‘liq fayl URL:', fullUrl); // URLni tekshirish
    return this.http.get(fullUrl, { responseType: 'blob' });
  }

  // job-application.service.ts
  getPendingApplicationsCount(): Observable<number> {
    return this.getApplications().pipe(
      map((applications: JobApplication[]) => {
        const pendingCount = applications.filter(app => app.status === 'Pending').length;
        console.log('Pending applications count:', pendingCount); // Tekshirish uchun
        return pendingCount;
      })
    );
  }
}