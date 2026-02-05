import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { map } from 'rxjs/operators';
import { SessionService } from '../../services/session/session.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  user$ = this.session.user$;
  isLoggedIn$ = this.user$.pipe(map(u => !!u));

  constructor(private router: Router, private session: SessionService) { }

  toggleHome() {
    this.router.navigate(['']);
  }

  toggleAuth() {
    console.log('Navigating to sign-in page');
    this.router.navigate(['/auth/login']);
  }
}
