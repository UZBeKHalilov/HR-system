import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SidebarService } from './Services/sidebar.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { AuthService } from './Services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isAuthenticated: boolean = false;
isAttendancePage: any;

  constructor(
    public sidebarService: SidebarService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getUser().subscribe(user => {
      this.isAuthenticated = !!user;
      const currentRoute = this.router.url; // Joriy URL ni olish
      if (!this.isAuthenticated) {
        // Agar login bo‘lmasa va joriy sahifa /home yoki /attendance emas bo‘lsa
        if (currentRoute !== '/home' && currentRoute !== '/attendance') {
        }
        // /home yoki /attendance bo‘lsa, hech narsa qilmaymiz
      }
    });
  }
}