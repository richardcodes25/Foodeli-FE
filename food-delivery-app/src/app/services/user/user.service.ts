import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_URL_UD } from '../../constants/url';
import { User } from '../../shared/models/User';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // user-session.util.ts (or inside a SessionService)
  private LS_USER_KEY = 'foodeli_user';

  constructor(
    private http: HttpClient,
    private sessionService: SessionService
  ) {}

  addUser(payload: any): Observable<any> {
    return this.http.post(
      `${API_URL_UD}/user/addUser`,
      payload
    );
  }

  getUserByEmail(email: string): Observable<User> {
    // adjust endpoint to match yours
    return this.http.get<User>(`/user?email=${email}`).pipe(
      tap((u) => {
        console.log('Fetched user by email:', u);
        localStorage.setItem(this.LS_USER_KEY, JSON.stringify(u));
        this.sessionService.setUser(u);
      })
    );;
  }

  getUserLocal() {
    const raw = localStorage.getItem(this.LS_USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  // saveUserLocal(user: any) {
  //   localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
  // }

}
