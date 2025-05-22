
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { EmployeeService } from '../Services/employee.service';
import { AttendanceService } from '../Services/attendance.service';
import { PayrollService } from '../Services/payroll.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { GetPayrollComponent } from "../PayrollComponent/get-payroll/get-payroll.component";
import { SettingPayrollComponent } from '../PayrollComponent/setting-payroll/setting-payroll.component';
import { UploadService } from '../Services/upload.service';
import { AttendanceInfoComponent } from '../AttandanceComponent/attendance-info/attendance-info.component';
@Component({
  selector: 'app-employee-info',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatListModule,
    FormsModule,
    GetPayrollComponent,
    SettingPayrollComponent,
    AttendanceInfoComponent // Yangi komponent qo‘shildi
  ],
  templateUrl: './employee-info.component.html',
  styleUrl: './employee-info.component.css'
})
export class EmployeeInfoComponent implements OnInit {
  employee: { name: string; role: string; avatar: string; token: string } | null = null;
  employeeDetails: any = null;
  attendances: any[] = [];
  payrolls: any[] = [];
  errorMessage: string | null = null;
  employeeId: string | null = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isCurrentUser: boolean = false;
  isEditMode: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedYear: number = new Date().getFullYear(); // AttendanceInfo uchun
  selectedMonth: number = new Date().getMonth() + 1; // AttendanceInfo uchun

  timeOffStats = { annualLeave: 28.0, sickLeave: 15.0, withoutPay: 0.0 };
  requests = [
    { leaveType: 'Annual Leave', dateRange: '31 Oct 22 - 02 Nov 22', amount: '3.0 days', status: 'Approved' },
  ];

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private attendanceService: AttendanceService,
    private payrollService: PayrollService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private uploadService: UploadService
  ) {}

  ngOnInit() {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    this.isCurrentUser = !this.employeeId;
    if (!this.employeeId) {
      this.loadUserData();
    }
    this.loadEmployeeDetails();
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  triggerFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    } else {
      console.error('fileInput element topilmadi');
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
        this.uploadProfileImage();
      };
      reader.readAsDataURL(this.selectedFile);
      this.isEditMode = false;
    }
  }

  uploadProfileImage() {
    if (!this.selectedFile) {
      this.snackBar.open('Please select an image to upload.', 'Close', { duration: 3000 });
      return;
    }

    this.uploadService.uploadProfileImage(this.selectedFile).subscribe({
      next: (response) => {
        if (response.profileImagePath) {
          this.employeeDetails.profileImagePath = response.profileImagePath;
        } else {
          this.loadEmployeeDetails();
        }
      },
      error: (err) => {
        // this.snackBar.open(err.message || 'Failed to upload image.', 'Close', { duration: 5000 });
      }
    });
  }

  deleteProfileImage() {
    this.uploadService.deleteProfileImage().subscribe({
      next: () => {
        this.employeeDetails.profileImagePath = null;
        this.selectedFile = null;
        this.previewUrl = null;
        this.isEditMode = false;
      },
      error: (err) => {
        // this.snackBar.open(err.message || 'Failed to delete image.', 'Close', { duration: 5000 });
      }
    });
  }

  loadUserData() {
    this.authService.getUser().subscribe({
      next: (user) => {
        this.employee = user;
        if (!this.employee) {
          this.snackBar.open('No user data found.', 'Close', { duration: 3000 });
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.snackBar.open(this.errorMessage ?? 'An error occurred', 'Close', { duration: 5000 });
        this.router.navigate(['/login']);
      },
    });
  }

  loadEmployeeDetails() {
    if (this.employeeId) {
      this.employeeService.getEmployeeInfo(this.employeeId).subscribe({
        next: (employee) => {
          this.employeeDetails = employee;
          console.log('Loaded Employee Details:', this.employeeDetails.profileImagePath);
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.snackBar.open(this.errorMessage ?? 'An error occurred', 'Close', { duration: 5000 });
        },
      });
    } else {
      this.employeeService.getCurrentEmployee().subscribe({
        next: (employee) => {
          this.employeeDetails = employee;
          console.log('Loaded Current Employee:', this.employeeDetails.profileImagePath);
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.snackBar.open(this.errorMessage ?? 'An error occurred', 'Close', { duration: 5000 });
        },
      });
    }
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getFullName(): string {
    return this.employeeDetails ? `${this.employeeDetails.firstName} ${this.employeeDetails.lastName}` : this.employee?.name || 'N/A';
  }

  recordTimeOff(type: string) {
    console.log(`Recording time off for ${type}`);
    this.snackBar.open(`Recording ${type} time off...`, 'Close', { duration: 3000 });
  }

  onImageError() {
    if (this.employeeDetails) {
      this.employeeDetails.profileImagePath = null;
      console.log('Image failed to load, set to null');
    }
  }
}