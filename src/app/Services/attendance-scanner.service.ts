import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class AttendanceScannerService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getEmployeeNameById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/Employee/GetEmployeeNameId?id=${id}`);
  }

  submitAttendance(type: 'entry' | 'exit', employeeId: string): Observable<any> {
    const url = type === 'entry'
      ? `${this.baseUrl}/api/Attendance/entry`
      : `${this.baseUrl}/api/Attendance/exit`;

    return this.http.post(url, { employeeId });
  }
}
