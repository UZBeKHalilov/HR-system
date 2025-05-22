import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./not-found.component.html",
})
export class NotFoundComponent {


  constructor(private router: Router) {}

  navigateToHome(): void {
    this.router.navigate(["/"])
  }

  goBack(): void {
    window.history.back()
  }
}
