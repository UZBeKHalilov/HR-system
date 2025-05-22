import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs'; // Tablar uchun
import { MatListModule } from '@angular/material/list'; // Ro‘yxat uchun
import { FormsModule } from '@angular/forms';
import { PayrollService } from '../../Services/payroll.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-setting-payroll',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule, // Qo‘shildi
    MatListModule, // Qo‘shildi
    FormsModule,
  ],
  templateUrl: './setting-payroll.component.html',
  styleUrls: ['./setting-payroll.component.css'],
})
export class SettingPayrollComponent implements OnInit {
  @Input() employeeId: string | null = null;

  // Schedule uchun
  payrollSettings = {
    employeeId: 0,
    workStartTime: '09:00',
    workEndTime: '18:00',
    workDays: '',
    hourlyRate: 0,
  };

  // Pay uchun
  payrollPayment = {
    employeeId: 0,
    paidAmount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  };

  // Paid uchun
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  payrollHistory: any = null;

  workDayOptions = [
    { value: 'Mon', label: 'Monday' },
    { value: 'Tue', label: 'Tuesday' },
    { value: 'Wed', label: 'Wednesday' },
    { value: 'Thu', label: 'Thursday' },
    { value: 'Fri', label: 'Friday' },
    { value: 'Sat', label: 'Saturday' },
    { value: 'Sun', label: 'Sunday' },
  ];

  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  selectedWorkDays: string[] = [];

  constructor(
    private payrollService: PayrollService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (this.employeeId) {
      const id = parseInt(this.employeeId, 10);
      this.payrollSettings.employeeId = id;
      this.payrollPayment.employeeId = id;
      this.loadPayrollHistory();
    }
  }

  submitPayrollSettings() {
    if (!this.isSettingsFormValid()) {
      this.snackBar.open('Please fill all schedule fields correctly!', 'Close', { duration: 3000 });
      return;
    }
    this.payrollSettings.workDays = this.selectedWorkDays.join(',');
    console.log('Submitting payroll settings:', this.payrollSettings);
    this.payrollService.schedulePayroll(this.payrollSettings).subscribe({
      next: (response) => {
        console.log('Payroll settings saved:', response);
        this.snackBar.open('Payroll settings saved successfully!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error saving payroll settings:', err);
        this.snackBar.open('Error saving payroll settings: ' + err.message, 'Close', { duration: 5000 });
      },
    });
  }

  submitPayment() {
    if (!this.isPaymentFormValid()) {
      this.snackBar.open('Please fill all payment fields correctly!', 'Close', { duration: 3000 });
      return;
    }
    console.log('Submitting payment:', this.payrollPayment);
    this.payrollService.payPayroll(this.payrollPayment).subscribe({
      next: (response) => {
        console.log('Payment successful:', response);
        this.snackBar.open('Payment submitted successfully!', 'Close', { duration: 3000 });
        this.loadPayrollHistory(); // To‘lovdan keyin tarixni yangilash
      },
      error: (err) => {
        // console.error('Error submitting payment:', err);
        // this.snackBar.open('Error submitting payment: ' + err.message, 'Close', { duration: 5000 });
      },
    });
  }

  loadPayrollHistory() {
    if (!this.employeeId) {
      this.snackBar.open('Employee ID is required!', 'Close', { duration: 3000 });
      return;
    }
    this.payrollService.getPayrollHistory(this.employeeId, this.selectedMonth, this.selectedYear).subscribe({
      next: (response) => {
        this.payrollHistory = response;
        console.log('Payroll History:', this.payrollHistory);
      },
      error: (err) => {
        // console.error('Error loading payroll history:', err);
        this.payrollHistory = null;
        // this.snackBar.open('Error loading payroll history: ' + err.message, 'Close', { duration: 5000 });
      },
    });
  }

  updateHistory() {
    this.loadPayrollHistory();
  }

  isSettingsFormValid(): boolean {
    return (
      this.payrollSettings.workStartTime !== '' &&
      this.payrollSettings.workEndTime !== '' &&
      this.selectedWorkDays.length > 0 &&
      this.payrollSettings.hourlyRate > 0
    );
  }

  isPaymentFormValid(): boolean {
    return (
      this.payrollPayment.paidAmount > 0 &&
      this.payrollPayment.month >= 1 && this.payrollPayment.month <= 12 &&
      this.payrollPayment.year > 0
    );
  }
}