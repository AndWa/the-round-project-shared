import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as borsh from 'borsh';
import admin from 'firebase-admin';
import { sha256 } from 'js-sha256';
import { firstValueFrom } from 'rxjs';
import { UserService } from 'src/user/user.service';
import * as nacl from 'tweetnacl';
import serviceAccount from './firebase/near-auth-firebase-adminsdk-fhr9n-aca534fbae.json';

export interface JwtUser {
  uid: string;
  username: string;
  accountType: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      }),
    });
  }

  private async nearValidatePublicKeyByAccountId(
    accountId: string,
    pkArray: string | Uint8Array,
  ): Promise<boolean> {
    const currentPublicKey = 'ed25519:' + borsh.baseEncode(pkArray);

    const result = await firstValueFrom(
      this.httpService.post(
        'https://rpc.testnet.near.org',
        {
          jsonrpc: '2.0',
          method: 'query',
          params: [`access_key/${accountId}`, ''],
          id: 1,
        },
        {
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        },
      ),
    );

    const data = result.data;

    if (!data || !data.result || !data.result.keys) return false;

    for (const key in data.result.keys) {
      if (data.result.keys[key].public_key === currentPublicKey) return true;
    }

    return false;
  }

  private async nearValidate(
    username: string,
    signedJsonString: string,
  ): Promise<JwtUser> {
    // Parameters:
    //   username: the NEAR accountId (e.g. test.near)
    //   signedJsonString: a json.stringify of the object {"signature", "publicKey"},
    //             where "signature" is the signature obtained after signing
    //             the user's username (e.g. test.near), and "publicKey" is
    //             the user's public key
    let { signature, publicKey } = JSON.parse(signedJsonString);

    // We expect the user to sign a message composed by its USERNAME
    const msg = Uint8Array.from(sha256.array(username));
    signature = Uint8Array.from(Object.values(signature));
    publicKey = Uint8Array.from(Object.values(publicKey.data));

    // check that the signature was created using the counterpart private key
    const valid_signature = nacl.sign.detached.verify(
      msg,
      signature,
      publicKey,
    );

    // and that the publicKey is from this USERNAME
    const pK_of_account = await this.nearValidatePublicKeyByAccountId(
      username,
      publicKey,
    );

    if (!valid_signature || !pK_of_account) return null;

    return {
      uid: username,
      username,
      accountType: 'near',
      roles: ['customer'],
    };
  }

  private async firebaseValidate(jwt: string): Promise<JwtUser> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(jwt);
      return {
        uid: decodedToken.uid,
        username: decodedToken.email ?? '',
        accountType: 'firebase',
        roles: ['customer'],
      };
    } catch (error) {
      // console.log(error);
      return null;
    }
  }

  private async validateUserExistance(jwtUser: JwtUser) {
    const user = await this.userService.findOne(jwtUser.uid);

    if (!user) {
      const newUser = await this.userService.create({
        uid: jwtUser.uid,
        username: jwtUser.username,
        accountType: jwtUser.accountType,
        nearWalletAccountId:
          jwtUser.accountType === 'near' ? jwtUser.username : null,
      });

      return {
        uid: newUser.uid,
        username: newUser.username,
        accountType: newUser.accountType,
        roles: newUser.roles,
      };
    }

    return {
      uid: user.uid,
      username: user.username,
      accountType: user.accountType,
      roles: user.roles,
    };
  }

  async getNearJwtToken(
    username: string,
    signedJsonString: string,
  ): Promise<{ token: string } | null> {
    const jwtUser = await this.nearValidate(username, signedJsonString);

    if (!jwtUser) return null;

    const user = await this.validateUserExistance(jwtUser);

    return {
      token: this.jwtService.sign(user),
    };
  }

  async getFirebaseJwtToken(
    jwtToken: string,
  ): Promise<{ token: string } | null> {
    const jwtUser = await this.firebaseValidate(jwtToken);

    if (!jwtUser) return null;

    const user = await this.validateUserExistance(jwtUser);

    return {
      token: this.jwtService.sign(user),
    };
  }
}
