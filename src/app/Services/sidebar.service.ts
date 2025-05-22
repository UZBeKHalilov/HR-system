import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private collapsed = new BehaviorSubject<boolean>(false);
  collapsed$ = this.collapsed.asObservable();

  isCollapsed(): boolean {
    return this.collapsed.value;
  }

  toggleSidebar(): void {
    this.collapsed.next(!this.collapsed.value);
  }
}