import { Routes } from '@angular/router';
import { PageComponent } from './page/page.component';
import { EmployeeComponent } from './employee/employee.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { AttendanceScannerComponent } from './AttandanceComponent/attendance-scanner/attendance-scanner.component';
import { JobApplicationComponent } from './JobComponents/job-application/job-application.component';
import { DepartmentComponent } from './department/department.component';
import { PayrollReportComponent } from './PayrollComponent/payroll-report/payroll-report.component';
import { EmployeeInfoComponent } from './employee-info/employee-info.component';
import { CalendarComponent } from './calendar/calendar.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AttendanceComponent } from './attendance/attendance.component';


export const routes: Routes = [
  { path: 'my-activity', component: EmployeeInfoComponent },
  { path: 'employee-info/:id', component: EmployeeInfoComponent, data: { renderMode: 'client' } },
  { path: 'login', component: LoginComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: 'my-activity', component: EmployeeInfoComponent, canActivate: [AuthGuard] },
  { path: 'payroll-report', component: PayrollReportComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'employees', component: EmployeeComponent },
  { path: 'jobApplication', component: JobApplicationComponent },
  { path: 'departments', component: DepartmentComponent },
  // { path: 'time', component: PageComponent, data: { page: 'time' } },
  // { path: 'directory', component: PageComponent, data: { page: 'directory' } },
  // { path: 'tasks', component: PageComponent, data: { page: 'surveys' } },
  // { path: 'performance', component: PageComponent, data: { page: 'performance' } },
  // { path: 'surveys', component: PageComponent, data: { page: 'surveys' } },
  // { path: 'assets', component: PageComponent, data: { page: 'assets' } },
  // { path: 'knowledge-base', component: PageComponent, data: { page: 'knowledge-base' } },
  // { path: 'reports', component: PageComponent, data: { page: 'reports' } },
  // { path: 'settings', component: PageComponent, data: { page: 'settings' } },
  // { path: '', redirectTo: '/my-activity', pathMatch: 'full' },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];


