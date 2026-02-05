import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user/user.service';

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

  // form = this.fb.group({
  //   userName: ['', [Validators.required, Validators.minLength(3)]],
  //   fullName: ['', [Validators.required, Validators.minLength(2)]],
  //   email: ['', [Validators.required, Validators.email]],
  //   phone: [''],
  //   city: ['', Validators.required],
  //   address: ['', Validators.required],
  //   preferred_language: ['en', Validators.required],
  //   avatarUrl: [''],
  //   bio: [''],
  //   password: ['', [Validators.required, Validators.minLength(6)]],
  // });

  form = this.fb.group({
    userName: ['richardDo', [Validators.required, Validators.minLength(3)]],
    fullName: ['Richard Do', [Validators.required, Validators.minLength(2)]],
    email: ['thanhnguyen16.gers@gmail.com', [Validators.required, Validators.email]],
    phone: ['6823748227'],
    city: ['Fort Worth, Tx', Validators.required],
    address: ['3145 Cockrell Avenue', Validators.required],
    preferred_language: ['en', Validators.required],
    avatarUrl: ['sadsadasdaadad'],
    bio: ['asddaddasasda'],
    password: ['@Thanhnugyen14#', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private userService: UserService
  ) {}

  backToLogin() {
    this.router.navigateByUrl('/auth/login');
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // 🔥 this line
      return;
    }

    this.error = null;
    this.success = null;

    if (this.form.invalid) {
      console.log('Form is invalid');
      return;
    }

    this.loading = true;

    try {
      const { email, password, fullName } = this.form.value;
      const firebaseUser = await this.auth.signUpEmail(email!, password!, fullName!);
      // console.log('Firebase user created:', firebaseUser);
      const payload = {
        firebaseUid: firebaseUser.uid,
        ...this.form.value
      }
      console.log('Payload for backend:', payload)
      this.userService.addUser(payload).subscribe({
        next: (res) => {
          this.success = 'Account created successfully 🎉';
          this.form.reset();
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to create account';
        }
      });
    } catch (e: any) {
      this.error = e?.message ?? 'Sign up failed';
    } finally {
      console.log()
      this.loading = false;
      // this.router.navigate(['/food-catalogue', id]);
      localStorage.setItem("newUserEmail", this.form.value.email);
      localStorage.setItem("newUserPassword", this.form.value.password);
      this.router.navigate(['/auth/login']);
    }
  }
}
