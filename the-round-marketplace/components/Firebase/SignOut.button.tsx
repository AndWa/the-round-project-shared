import { getApp } from "firebase/app";
import AuthService from "../../services/firebase.service";

export interface FirebaseSignOutButtonProps {
  onSignOut: () => void;
}

const FirebaseSignOutButton = ({ onSignOut }: FirebaseSignOutButtonProps) => {
  const signOut = async () => {
    const authService = new AuthService(getApp());
    await authService.logout();
    onSignOut();
  };

  return (
    <button onClick={signOut}>
      <span>Sign Out</span>
    </button>
  );
};

export default FirebaseSignOutButton;
