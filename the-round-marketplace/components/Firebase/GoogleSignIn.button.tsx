import { Button } from "@mantine/core";
import { getApp } from "firebase/app";
import AuthService from "../../services/firebase.service";
import { GoogleIcon } from "../SocialButtons/GoogleIcon";

export interface GoogleSignInButtonProps {
  onUser: (user: { jwt: string; uid: string; email: string }) => void;
  onError: (message: string) => void;
}

const GoogleSignInButton = ({ onUser, onError }: GoogleSignInButtonProps) => {
  const googleSignIn = async () => {
    const authService = new AuthService(getApp());
    const result = await authService.loginWithGoogle();

    if (result.error) {
      onError(result.error);
      return;
    }

    if (result.user && result.user.uid && result.user.email) {
      const jwt = await result.user.getIdToken();
      onUser({
        jwt: jwt,
        uid: result.user.uid,
        email: result.user.email,
      });
    }

    console.log(result);
  };

  return (
    <Button
      leftIcon={<GoogleIcon />}
      onClick={googleSignIn}
      fullWidth
      variant="outline"
      radius="xl"
    >
      Continue with Google
    </Button>
  );
};

export default GoogleSignInButton;
