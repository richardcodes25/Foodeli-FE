import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isLoggedIn = false;

  constructor(private router: Router) { }

  toggleHome() {
    this.router.navigate(['']);
  }

  toggleAuth() {
    console.log('Navigating to sign-in page');
    this.router.navigate(['/auth/login']);
  }
}
