import { Component, Input, OnInit } from '@angular/core';
import { AttendanceService } from '../../Services/attendance.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-attendance-info',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './attendance-info.component.html',
  styleUrls: ['./attendance-info.component.css']
})
export class AttendanceInfoComponent implements OnInit {
  @Input() employeeId: string | null = null;
  @Input() selectedYear: number = new Date().getFullYear();
  @Input() selectedMonth: number = new Date().getMonth() + 1;

  attendances: any[] = [];
  calendarDays: { day: number; status: string; workedHours?: string }[] = [];
  workDays: string[] = [];
  months: { value: number; name: string }[] = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' },
    { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
    { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' },
  ];

  constructor(
    private attendanceService: AttendanceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadAttendanceData();
  }

  loadAttendanceData() {
    const serviceCall = this.employeeId
      ? this.attendanceService.getAttendanceByEmployeeId(this.employeeId)
      : this.attendanceService.getMyAttendance();

    serviceCall.subscribe({
      next: (response) => {
        this.attendances = response.attendances || response || [];
        this.workDays = response.workDays ? response.workDays.split(',') : [];
        this.prepareCalendarData();
      },
      error: (err) => {
        this.snackBar.open(err.message ?? 'An error occurred', 'Close', { duration: 5000 });
      },
    });
  }

  prepareCalendarData() {
    this.calendarDays = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const currentDate = new Date(currentYear, currentMonth - 1, currentDay);

    let firstAttendanceDate: Date | null = null;
    if (this.attendances.length > 0) {
      const sortedAttendances = [...this.attendances].sort((a, b) =>
        new Date(a.attendanceDate).getTime() - new Date(b.attendanceDate).getTime()
      );
      firstAttendanceDate = new Date(sortedAttendances[0].attendanceDate);
    }

    const firstDate = firstAttendanceDate || today;
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();

    // Kun bo‘yicha attendance’larni guruhlash
    const attendanceByDate = new Map<string, any[]>();
    this.attendances.forEach(att => {
      const date = new Date(att.attendanceDate);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      if (!attendanceByDate.has(key)) {
        attendanceByDate.set(key, []);
      }
      attendanceByDate.get(key)?.push(att);
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.selectedYear, this.selectedMonth - 1, day);
      const dateKey = `${this.selectedYear}-${this.selectedMonth}-${day}`;
      const dayAttendances = attendanceByDate.get(dateKey) || [];
      const dayOfWeek = dayNames[date.getDay()];
      let status = 'absent';
      let workedHours = '00:00:00'; // Standart qiymat

      if (this.selectedYear === currentYear && this.selectedMonth === currentMonth && day === currentDay) {
        status = 'ongoing';
        if (dayAttendances.length > 0) {
          workedHours = this.calculateTotalWorkedHours(dayAttendances);
        }
      } else if (
        this.workDays.includes(dayOfWeek) &&
        date >= firstDate &&
        date <= currentDate &&
        dayAttendances.length === 0
      ) {
        status = 'absent';
      } else if (!this.workDays.includes(dayOfWeek)) {
        status = 'off-day';
      } else if (date < firstDate) {
        status = 'past';
      } else if (date > currentDate) {
        status = 'future';
      } else if (dayAttendances.length > 0) {
        status = 'present';
        workedHours = this.calculateTotalWorkedHours(dayAttendances);
      }

      this.calendarDays.push({ day, status, workedHours });
    }
  }

  // Kun bo‘yicha umumiy ish soatlarini hisoblash (00:00:00 formatida)
  private calculateTotalWorkedHours(attendances: any[]): string {
    let totalSeconds = 0;

    attendances.forEach(att => {
      const entry = new Date(att.entryTime);
      const exit = new Date(att.exitTime);
      const diffMs = exit.getTime() - entry.getTime(); // Millisekunddagi farq
      const diffSeconds = Math.floor(diffMs / 1000); // Soniyalarga aylantirish
      totalSeconds += diffSeconds;
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  public getEmptyDays(): number[] {
    const firstDayOfMonth = new Date(this.selectedYear, this.selectedMonth - 1, 1).getDay();
    return Array(firstDayOfMonth).fill(null);
  }

  previousMonth() {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.loadAttendanceData();
  }

  nextMonth() {
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.loadAttendanceData();
  }

  getMonthName(): string {
    return this.months.find(month => month.value === this.selectedMonth)?.name || '';
  }
}