import { Injectable, inject } from '@angular/core';
import {
  Auth, User, user, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, updateProfile
} from '@angular/fire/auth';
import {
  Firestore, doc, setDoc, getDoc, serverTimestamp, updateDoc
} from '@angular/fire/firestore';
import { map, firstValueFrom } from 'rxjs';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt?: any;
  lastLoginAt?: any;
  // add your own fields here (role, phone, etc.)
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private db = inject(Firestore);

  /** Observable of the Firebase user (null if signed out) */
  user$ = user(this.auth); // AngularFire Rx wrapper of onAuthStateChanged

  /** Derived observable: your AppUser from Firestore (or null) */
  appUser$ = this.user$.pipe(
    map(async (u: User | null) => {
      if (!u) return null;
      const snap = await getDoc(doc(this.db, 'users', u.uid));
      return snap.exists() ? (snap.data() as AppUser) : null;
    }),
    // flatten Promise<AppUser|null> -> AppUser|null
    // small util:
    // You can also switchMap(() => from(...))
  );

  async signUpEmail(email: string, password: string, displayName?: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    // Create profile doc on first sign up
    const ref = doc(this.db, 'users', cred.user.uid);
    await setDoc(ref, {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName ?? null,
      photoURL: cred.user.photoURL ?? null,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    } as AppUser);
    return cred.user;
  }

  async signInEmail(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    // Update lastLoginAt on successful sign in
    await updateDoc(doc(this.db, 'users', cred.user.uid), {
      lastLoginAt: serverTimestamp()
    });
    return cred.user;
  }

  async logout() {
    await signOut(this.auth);
  }

  /** Get the current Firebase User once (not reactive) */
  async currentUser(): Promise<User | null> {
    return await firstValueFrom(this.user$);
  }

    /**
   * Check if user is currently logged in (Firebase auth state)
   * Safe to use before protected actions (Place Order, etc.)
   */
  async isLoggedIn(): Promise<boolean> {
    const u = await firstValueFrom(this.user$);
    return !!u;
  }
}
