import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PayrollService } from '../../Services/payroll.service';

@Component({
  selector: 'app-get-payroll',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './get-payroll.component.html',
  styleUrl: './get-payroll.component.css'
})
export class GetPayrollComponent implements OnInit {
  @Input() employeeId: string | null = null; 
  payrollData: any = null;

  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  months: { value: number; name: string }[] = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' },
    { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
    { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' },
  ];

  constructor(private payrollService: PayrollService) {}

  ngOnInit() {
    this.loadPayrollData();
  }

  loadPayrollData() {
    const idForService = this.employeeId !== null ? this.employeeId : undefined;
    this.payrollService.getPayroll(idForService, this.selectedMonth, this.selectedYear).subscribe({
      next: (response) => {
        this.payrollData = response;
        console.log('Payroll Data for', this.getMonthName(), this.selectedYear, ':', this.payrollData);
      },
      error: (err) => {
        console.error('Error loading payroll:', err);
        this.payrollData = null; // Xato bo‘lsa ma'lumotni tozalaymiz
      },
    });
  }

  previousMonth() {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.loadPayrollData(); // Yangi oy uchun API’dan ma'lumot olamiz
  }

  nextMonth() {
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.loadPayrollData(); // Yangi oy uchun API’dan ma'lumot olamiz
  }

  getMonthName(): string {
    return this.months.find(month => month.value === this.selectedMonth)?.name || '';
  }

  formatHours(hours: number): string {
    const hrs = Math.floor(hours);
    const mins = Math.floor((hours * 60) % 60);
    const secs = Math.floor((hours * 3600) % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} $`;
  }

  getTotalHours(): number {
    return this.payrollData?.dailyReport?.reduce((sum: number, report: any) => sum + report.totalDailyHours, 0) || 0;
  }

  getTotalAmount(): number {
    return this.payrollData?.dailyReport?.reduce((sum: number, report: any) => sum + report.dailyAmount, 0) || 0;
  }
}