import { Component, OnInit, OnDestroy } from '@angular/core'; // OnDestroy qo'shildi
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SidebarService } from '../Services/sidebar.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../Services/auth.service';
import { JobApplicationService } from '../Services/job-application.service';
import { interval, Subscription } from 'rxjs'; // interval va Subscription qo'shildi

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy { // OnDestroy qo'shildi
  private allMenuItems = [
    { label: 'My activity', path: '/my-activity', icon: 'person', count: 0 },
    { label: 'Employees', path: '/employees', icon: 'group', count: 0 },
    { label: 'Job Application', path: '/jobAppication', icon: 'how_to_reg', count: 0 }, // Path tuzatildi
    { label: 'Departments', path: '/departments', icon: 'apartment', count: 0 },
    { label: 'Payroll Report', path: '/payroll-report', icon: 'assignment_turned_in', count: 0 },
    { label: 'Tasks', path: '/tasks', icon: 'assignment', count: 0  },
    { label: 'Time', path: '/time', icon: 'access_time', count: 0 },
    { label: 'Calendar', path: '/calendar', icon: 'calendar_today', count: 0 },
    { label: 'Reports', path: '/reports', icon: 'bar_chart', count: 0 },
    { label: 'Settings', path: '/settings', icon: 'settings', count: 0 }
  ];

  menuItems: { label: string; path: string; icon: string; count: number }[] = [];
  userRole: string | undefined;
  private pollingSubscription: Subscription | undefined; // Intervalni boshqarish uchun

  constructor(
    public sidebarService: SidebarService,
    private authService: AuthService,
    private jobApplicationService: JobApplicationService
  ) {}

  ngOnInit() {
    this.authService.getUser().subscribe(user => {
      this.userRole = user?.role;
      this.filterMenuItems();
    });

    // Har 10 soniyada ma'lumotlarni yangilash
    this.startPolling();
  }

  ngOnDestroy() {
    // Komponent yopilganda pollingni to'xtatish
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  private startPolling() {
    this.pollingSubscription = interval(10000) // 10 soniya (10000 ms)
      .subscribe(() => {
        this.jobApplicationService.getPendingApplicationsCount().subscribe({
          next: (count) => {
            console.log('Updated pending count:', count); // Yangilanishni tekshirish
            const jobAppItem = this.allMenuItems.find(item => item.label === 'Job Application');
            if (jobAppItem) {
              jobAppItem.count = count;
              this.filterMenuItems(); // Menyuni yangilash
            }
          },
          error: (err) => {
            console.error('Error fetching pending count:', err);
          }
        });
      });
  }

  private filterMenuItems() {
    if (this.userRole === 'Admin') {
      this.menuItems = [...this.allMenuItems];
    } else {
      this.menuItems = this.allMenuItems.filter(item =>
        ['/my-activity', '/task', '/time', '/calendar'].includes(item.path)
      );
    }
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }
}