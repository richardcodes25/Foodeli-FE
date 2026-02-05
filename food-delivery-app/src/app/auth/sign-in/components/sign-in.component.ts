// sign-in.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  success: string | null = null;
  error: string | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor(
    private userService: UserService
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    const savedEmail = localStorage.getItem("newUserEmail");
    const savedPassword = localStorage.getItem("newUserPassword");
    if (savedEmail && savedPassword) {
      this.form.setValue({
        email: savedEmail,
        password: savedPassword
      });
      // Optionally, clear the saved credentials after using them
    }
  }

  async submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    const { email, password } = this.form.value;
    try {
      await this.auth.signInEmail(email!, password!).then(() => {
        this.success = 'Login successful!';

        console.log("Signinn successful, fetching user data...");
        console.log("Fetching user data for email:", email);

        this.userService.getUserByEmail(email!).subscribe();

        this.router.navigateByUrl('/');
      });
    } catch (e: any) {
      this.error = e?.message ?? 'Login failed';
    } finally {

      this.loading = false;

      // this.router.navigateByUrl('/');
      localStorage.removeItem("newUserEmail");
      localStorage.removeItem("newUserPassword");
    }
  }

  gotoAccountPage() {
    this.router.navigateByUrl('/auth/register');
  }

  async logout() {
    await this.auth.logout();
  }
}
