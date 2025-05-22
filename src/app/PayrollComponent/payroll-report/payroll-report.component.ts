import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PayrollService } from '../../Services/payroll.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-payroll-report',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './payroll-report.component.html',
  styleUrls: ['./payroll-report.component.css'],
})
export class PayrollReportComponent implements OnInit {
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  dataSource: any = { data: [] };
  errorMessage: string | null = null;
  private apiUrl = 'http://localhost:5190'; // API bazaviy URL ni o'zingizga moslashtiring

  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  years: number[] = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);

  constructor(
    private payrollService: PayrollService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.payrollService.getGeneralReport(this.selectedMonth, this.selectedYear).subscribe({
      next: (response) => {
        this.dataSource.data = (response.employeeReports || []).map((employee: any) => ({
          ...employee,
          employeeAvatar: employee.employeeAvatar ? `${this.apiUrl}${employee.employeeAvatar}` : null
        }));
        this.errorMessage = null;
        console.log('Transformed Payroll Report:', this.dataSource.data);
      },
      error: (err) => {
        console.error('Error loading report:', err);
        this.errorMessage = err.message || 'Failed to load report';
        this.dataSource.data = [];
        this.snackBar.open('Error loading payroll report: ' + err.message, 'Close', { duration: 5000 });
      },
    });
  }

  updateReport() {
    this.loadReport();
  }

  applySearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.data = this.dataSource.data.filter((employee: any) =>
      employee.employeeName.toLowerCase().includes(filterValue) ||
      employee.employeeEmail?.toLowerCase().includes(filterValue)
    );
  }

  getFullName(employee: any): string {
    return employee.employeeName || 'Unknown';
  }

  viewEmployee(employeeId: number) {
    console.log('View employee:', employeeId);
  }

  getAvatarUrl(avatarPath: string): string {
    return avatarPath; // To‘liq URL allaqachon `loadReport` da qo‘shilgan
  }
}