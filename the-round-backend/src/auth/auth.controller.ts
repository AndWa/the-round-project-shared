import { Body, Controller, Post } from '@nestjs/common';
import { ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

class NearLoginDto {
  @ApiProperty({
    type: String,
  })
  username: string;
  @ApiProperty({
    type: String,
  })
  signedJsonString: string;
}

class FirebaseLoginDto {
  @ApiProperty({
    type: String,
  })
  jwt: string;
}

class Response {
  @ApiProperty({
    type: String,
  })
  token: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/near')
  @ApiResponse({
    status: 200,
    description: 'The user has been logged in',
    type: Response,
  })
  nearLogin(@Body() data: NearLoginDto) {
    return this.authService.getNearJwtToken(
      data.username,
      data.signedJsonString,
    );
  }

  @Post('/firebase')
  @ApiResponse({
    status: 200,
    description: 'The user has been logged in',
    type: Response,
  })
  async firebaseLogin(@Body() data: FirebaseLoginDto) {
    const tokenResponse = await this.authService.getFirebaseJwtToken(data.jwt);

    if (!tokenResponse) return { token: null };
    return tokenResponse;
  }
}
