export interface User {
  id: number;

  // Firebase Auth UID
  firebaseUid: string;

  userName: string;
  email: string;

  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;

  address?: string;
  city?: string;

  /**
   * 1 = normal user
   * 2 = restaurant owner
   * 3 = admin
   */
  role: number;

  preferredLanguage: string;
}
