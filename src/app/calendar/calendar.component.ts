import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-modern-calendar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1; // 1-12
  calendarDays: number[] = [];
  weekdays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  months: { value: number; name: string }[] = [
    { value: 1, name: 'january' }, { value: 2, name: 'february' }, { value: 3, name: 'march' },
    { value: 4, name: 'april' }, { value: 5, name: 'may' }, { value: 6, name: 'june' },
    { value: 7, name: 'july' }, { value: 8, name: 'august' }, { value: 9, name: 'september' },
    { value: 10, name: 'october' }, { value: 11, name: 'november' }, { value: 12, name: 'december' }
  ];

  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    this.calendarDays = [];
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      this.calendarDays.push(day);
    }
  }

  getEmptyDays(): number[] {
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
    this.generateCalendar();
  }

  nextMonth() {
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.generateCalendar();
  }

  getMonthName(): string {
    return this.months.find(month => month.value === this.selectedMonth)?.name || '';
  }

  isCurrentDay(day: number): boolean {
    const today = new Date();
    return (
      day === today.getDate() &&
      this.selectedMonth === today.getMonth() + 1 &&
      this.selectedYear === today.getFullYear()
    );
  }

  isWeekend(day: number): boolean {
    const date = new Date(this.selectedYear, this.selectedMonth - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Yakshanba (0) yoki Shanba (6)
  }
}