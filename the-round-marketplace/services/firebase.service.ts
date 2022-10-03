import { FirebaseApp } from "firebase/app";
import {
  Auth,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";

export default class AuthService {
  auth: Auth;

  constructor(firebaseApp: FirebaseApp) {
    this.auth = getAuth(firebaseApp);
  }

  waitForUser(callback: (user: User | null) => void) {
    return onAuthStateChanged(this.auth, (userCred) => {
      callback(userCred);
    });
  }

  async loginWithGoogle() {
    try {
      const userCred = await signInWithPopup(
        this.auth,
        new GoogleAuthProvider()
      );
      return {
        user: userCred.user,
      };
    } catch (error) {
      return {
        error: (error as any).message,
      };
    }
  }

  async logout() {
    await signOut(this.auth);
  }
}
