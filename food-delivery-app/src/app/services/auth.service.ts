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

      // console.log('Starting signup');
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('Auth created', cred.user);

      if (displayName) {
        await updateProfile(cred.user, { displayName });
        // console.log('Profile updated');
      }
      // Create profile doc on first sign up
      const ref = doc(this.db, 'users', cred.user.uid);
      // console.log('Writing Firestore doc');

      try {
        // console.log('[signup] writing Firestore user doc...');
        setDoc(ref, {
        // await setDoc(ref, {
          uid: cred.user.uid,
          email: cred.user.email,
          createdAt: serverTimestamp(),
        });
        // console.log('[signup] Firestore write success ✅');
      } catch (e) {
        console.error('signUpEmail failed:', e);
        throw e; // rethrow so UI can show message
      }

      return cred.user;
  }

  async signInEmail(email: string, password: string) {
      console.log('[Auth] Attempting sign in...');
      console.log('[Auth] Email:', email);
      console.log('[Auth] Password:', password);
      console.log("[Auth] Auth token", this.auth);
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      console.log("User signed in:", cred.user);

      console.log('[Auth] ✅ signInWithEmailAndPassword SUCCESS');
      console.log('[Auth] Firebase User:', cred.user);
      console.log('[Auth] UID:', cred.user.uid);
      console.log('[Auth] Email verified:', cred.user.emailVerified);

      // Update lastLoginAt on successful sign in
      // await updateDoc(doc(this.db, 'users', cred.user.uid), {
      //   lastLoginAt: serverTimestamp()
      // });

      // Non-blocking update (won't delay navigation/UI)
      updateDoc(doc(this.db, 'users', cred.user.uid), {
        lastLoginAt: serverTimestamp()
      }).then(() => {
        console.log('[Auth] lastLoginAt updated');
      }).catch(err => {
        console.warn('[Auth] lastLoginAt update failed (ignored):', err);
      });

      console.log('[Auth] ✅ Firestore lastLoginAt updated');

      return cred.user;
    } catch (e: any) {

      console.error('[Auth] ❌ signInWithEmailAndPassword FAILED');
      console.error('[Auth] Error object:', e);
      console.error('[Auth] Error code:', e?.code);
      console.error('[Auth] Error message:', e?.message);
      // Firebase error code is what matters (auth/xxx)
      console.error('Firebase signIn error:', e);

      const code = e?.code;
      const message = e?.message;

      console.error('code:', code, 'message:', message);

      // optional: rethrow a friendly message for UI
      throw e;
    }
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
