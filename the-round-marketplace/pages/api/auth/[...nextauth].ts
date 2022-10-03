import NextAuth from 'next-auth';
import CognitoProvider from "next-auth/providers/cognito";

export default NextAuth({
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID as string,
      clientSecret: process.env.COGNITO_CLIENT_SECRET as string,
      issuer: process.env.COGNITO_DOMAIN as string,
    })
  ],
  debug: process.env.NODE_ENV === 'development' ? true : false
})