// src/app/core/session.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../shared/models/User';

const LS_USER_KEY = 'foodeli_user';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private userSubject = new BehaviorSubject<User | null>(this.readUserFromStorage());
  user$ = this.userSubject.asObservable();

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  setUser(user: User) {
    localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  clear() {
    localStorage.removeItem(LS_USER_KEY);
    this.userSubject.next(null);
  }

  private readUserFromStorage(): User | null {
    const raw = localStorage.getItem(LS_USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  get isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }
}
