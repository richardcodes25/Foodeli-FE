import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})

export class SignUpComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  success: string | null = null;
  error: string | null = null;

  form = this.fb.group({
    displayName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  backToLogin() {
    this.router.navigateByUrl('/auth/login');
  }

  async submit() {
    this.error = null;
    this.success = null;

    if (this.form.invalid) return;

    this.loading = true;

    try {
      const { email, password, displayName } = this.form.value;
      await this.auth.signUpEmail(email!, password!, displayName!);
      await this.router.navigateByUrl('/');
    } catch (e: any) {
      this.error = e?.message ?? 'Sign up failed';
    } finally {
      this.loading = false;
    }
  }
}
