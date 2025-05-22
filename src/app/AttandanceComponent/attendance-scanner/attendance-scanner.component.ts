import { Component } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { CommonModule } from '@angular/common';
import { AttendanceScannerService } from '../../Services/attendance-scanner.service';

@Component({
  selector: 'app-attendance-scanner',
  standalone: true,
  imports: [ZXingScannerModule, CommonModule],
  templateUrl: './attendance-scanner.component.html',
  styleUrls: ['./attendance-scanner.component.css']
})
export class AttendanceScannerComponent {
  allowedFormats = [BarcodeFormat.QR_CODE];
  isScanning = false;
  scanResult: string | null = null;
  employeeFullName: string | null = null;
  message: string = '';
  showScanner = false;
  private scannerTimeout: any;
  messageType: string | undefined;

  constructor(private attendanceService: AttendanceScannerService) {}

  openScanner() {
    this.showScanner = true;
    this.isScanning = true;
    this.scanResult = null;
    this.employeeFullName = null;
    this.message = '';

    this.scannerTimeout = setTimeout(() => {
      if (this.isScanning) {
        this.resetToInitial();
      }
    }, 40000); // 40 sekund
  }

  onCodeResult(result: string) {
    this.scanResult = result;
    this.isScanning = false;
    this.checkEmployee(result);

    if (this.scannerTimeout) {
      clearTimeout(this.scannerTimeout);
    }
  }

  checkEmployee(employeeId: string) {
    this.attendanceService.getEmployeeNameById(employeeId).subscribe({
      next: (response: any) => {
        this.employeeFullName = `${response.firstName} ${response.lastName}`;
        this.message = '';
      },
      error: (err) => {
        console.error('Employee check error:', err);
        this.employeeFullName = null;
        setTimeout(() => this.resetToInitial(), 2000);
      }
    });
  }

  submitAttendance(type: 'entry' | 'exit') {
    if (!this.scanResult) return;

    this.attendanceService.submitAttendance(type, this.scanResult).subscribe({
      next: (response: any) => {
        this.messageType = 'success';
        this.message = response.message || `${type === 'entry' ? 'Kirish' : 'Chiqish'} muvaffaqiyatli qayd etildi!`;
        setTimeout(() => this.resetToInitial(), 3000);
      },
      error: (err) => {
        console.error('Attendance submit error:', err);
        this.messageType = 'error';

        if (err.error?.message) {
          this.message = err.error.message;
        } else if (err.status === 0) {
          this.message = "Serverga ulanishda muammo. API ishlayaptimi?";
        } else {
          this.message = "Noma'lum xatolik yuz berdi!";
        }

        setTimeout(() => this.resetToInitial(), 4000);
      }
    });
  }

  resetToInitial() {
    this.showScanner = false;
    this.isScanning = false;
    this.scanResult = null;
    this.employeeFullName = null;
    this.message = '';
    if (this.scannerTimeout) {
      clearTimeout(this.scannerTimeout);
    }
  }
}
