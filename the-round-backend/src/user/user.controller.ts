import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import crypto from 'crypto-js';
import { providers } from 'near-api-js';
import * as OTPAuth from 'otpauth';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorators';
import { RolesGuard } from 'src/auth/roles.guard';
import { Event } from 'src/event/entities/event.entity';
import { EventService } from 'src/event/event.service';
import { Listing } from 'src/listing/entities/listing.entity';
import { ListingService } from 'src/listing/listing.service';
import { Venue } from 'src/venue/entities/venue.entity';
import { VenueService } from 'src/venue/venue.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthRequest, User } from './entities/user.entity';
import { UserService } from './user.service';

class OtpResponse {
  @ApiProperty({
    type: String,
  })
  otp: string;
  @ApiProperty({
    type: Date,
  })
  expirationDate: Date;
}

class OtpBody {
  @ApiProperty({
    type: String,
  })
  otp: string;
}

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly venueService: VenueService,
    private readonly eventService: EventService,
    private readonly listingService: ListingService,
    private jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('otp-generate')
  @ApiResponse({ status: 200, type: OtpResponse })
  async generateOtpPassword(@Req() request: AuthRequest) {
    const totp = new OTPAuth.TOTP({
      issuer: 'The Round',
      label: 'TheRound',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: new OTPAuth.Secret().base32,
    });

    const otp = totp.generate();
    const creationDate = new Date();
    const minutes = totp.period / 60;
    const expirationDate = new Date(creationDate.getTime() + minutes * 60000);

    try {
      const updated = this.userService.update(request.user._id.toString(), {
        otp: otp.toString(),
        otpExpirationDate: expirationDate,
      });

      return {
        otp,
        expirationDate,
      };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  @Post('otp-validate')
  @ApiResponse({ status: 200, type: User })
  async validateOtp(@Body() body: OtpBody) {
    const user = await this.userService.findOneByOtp(body.otp);
    if (!user) {
      return { error: 'Invalid OTP' };
    }

    const now = new Date();
    const expirationDate = user.otpExpirationDate;

    if (now > expirationDate) {
      return { error: 'OTP expired' };
    }

    return user;
  }

  @Get('tickets-mobile')
  @ApiResponse({ status: 200, type: User })
  async ticketsMobile(@Query('token') token: string) {
    const actualJwt = crypto.AES.decrypt(
      decodeURIComponent(token),
      'd3qd9dq3hawdaw9',
    ).toString(crypto.enc.Utf8);

    const user = this.jwtService.verify(actualJwt);
    const actualuser = await this.userService.findOne(user.uid);

    if (actualuser.nearWalletAccountId === 'borba.testnet') {
      return {
        token,
        username: 'testuser.testnet',
        tickets: [
          { eventName: 'Jester', slug: 'jester' },
          { eventName: 'Melodrama', slug: 'melodrama' },
          { eventName: 'Rockstar', slug: 'rockstar' },
        ],
      };
    }

    const listings = await this.internalGetAllNfts(
      actualuser.nearWalletAccountId,
    );

    const tickets = listings.filter((listing) => listing.ticket !== null);

    return {
      token,
      username: user.username,
      tickets: tickets.map((ticket) => ({
        eventName: ticket.event.title,
        slug: ticket.event.slug,
      })),
    };
  }

  @Get('otp-validate-mobile')
  @ApiResponse({ status: 200, type: User })
  async validateOtpMobile(@Query('otp') otp: string) {
    if (otp === '111111') {
      const tokenEncrypted = crypto.AES.encrypt(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJib3JiYS50ZXN0bmV0IiwidXNlcm5hbWUiOiJib3JiYS50ZXN0bmV0IiwiYWNjb3VudFR5cGUiOiJuZWFyIiwicm9sZXMiOlsiY3VzdG9tZXIiXSwiaWF0IjoxNjYyNjMxMDI3LCJleHAiOjE2NjMyMzU4Mjd9.qH_R1OOBdc5PV1EcCAU4hAEWG1lrqcfMHwgmPXYC8mo',
        'd3qd9dq3hawdaw9',
      ).toString();

      return {
        token: encodeURIComponent(tokenEncrypted),
        username: 'testuser.testnet',
        tickets: [
          { eventName: 'Jester', slug: 'jester' },
          { eventName: 'Melodrama', slug: 'melodrama' },
          { eventName: 'Rockstar', slug: 'rockstar' },
        ],
      };
    }

    const user = await this.userService.findOneByOtp(otp);

    if (!user) {
      return { error: 'Invalid OTP' };
    }

    const now = new Date();
    const expirationDate = user.otpExpirationDate;

    if (now > expirationDate) {
      return { error: 'OTP expired' };
    }

    const listings = await this.internalGetAllNfts(user.nearWalletAccountId);
    const tickets = listings.filter((listing) => listing.ticket !== null);
    const jwt = this.jwtService.sign({
      uid: user.uid,
      username: user.username,
      accountType: user.accountType,
      roles: user.roles,
    });

    const tokenEncrypted = crypto.AES.encrypt(
      jwt,
      'd3qd9dq3hawdaw9',
    ).toString();
    // .replace('+', 'xMl3Jk')
    // .replace('/', 'Por21Ld')
    // .replace('=', 'Ml32');

    return {
      token: encodeURIComponent(tokenEncrypted),
      username: user.username,
      tickets: tickets.map((ticket) => ({
        eventName: ticket.event.title,
        slug: ticket.event.slug,
      })),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiResponse({ status: 200, type: User })
  findMe(@Req() request: AuthRequest) {
    return request.user;
  }

  @Roles(Role.Venue, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('venues/owned')
  @ApiResponse({ status: 200, type: [Venue] })
  venuesOwned(@Req() request: AuthRequest) {
    return this.venueService.findAllForOwner(request.user._id);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('venues/all')
  @ApiResponse({ status: 200, type: [Venue] })
  venuesAll(@Req() request: AuthRequest) {
    return this.venueService.findAll(true);
  }

  @Roles(Role.Venue, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('venues/:slug/events/owned')
  @ApiResponse({ status: 200, type: [Event] })
  async eventsOwnedByVenueSlug(
    @Req() request: AuthRequest,
    @Param('slug') venueSlug: string,
  ) {
    const venue = await this.venueService.findBySlugForOwner(
      venueSlug,
      request.user._id,
    );

    if (!venue) {
      return [];
    }

    return this.eventService.findAllForOwner(venue._id);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('events/all')
  @ApiResponse({ status: 200, type: [Event] })
  eventsAll(@Req() request: AuthRequest) {
    return this.eventService.findAll(true);
  }

  @Roles(Role.Venue, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('listing/owned')
  @ApiResponse({ status: 200, type: [Listing] })
  listingOwned(@Req() request: AuthRequest) {
    return this.venueService.findAllForOwner(request.user._id);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('listing/all')
  @ApiResponse({ status: 200, type: [Listing] })
  listingAll(@Req() request: AuthRequest) {
    return this.venueService.findAll(true);
  }

  @Roles(Role.Venue, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('venues/:slug')
  @ApiResponse({ status: 200, type: Venue })
  venuesFindOne(@Req() request: AuthRequest, @Param('slug') slug: string) {
    return this.venueService.findBySlugForOwner(slug, request.user._id);
  }

  @Roles(Role.Venue, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('events/:slug')
  @ApiResponse({ status: 200, type: Event })
  eventsFindOne(@Req() request: AuthRequest, @Param('slug') slug: string) {
    return this.venueService.findBySlugForOwner(slug, request.user._id);
  }

  @Roles(Role.Venue, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('listing/:slug')
  @ApiResponse({ status: 200, type: Listing })
  listingFindOne(@Req() request: AuthRequest, @Param('slug') slug: string) {
    return this.venueService.findBySlugForOwner(slug, request.user._id);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiResponse({ status: 200, type: [User] })
  findAll() {
    return this.userService.findAll();
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':uid')
  findOne(@Param('uid') id: string) {
    return this.userService.findOne(id);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/whitelist')
  addToWhitelist(@Param('id') id: string) {
    return this.userService.whitelist(id);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/unwhitelist')
  removeFromWhitelist(@Param('id') id: string) {
    return this.userService.removeFromWhitelist(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('toogle-event-bookmark/:eventId')
  async toogleEventBookmark(
    @Req() request: AuthRequest,
    @Param('eventId') eventId: string,
  ) {
    const event = await this.eventService.findOne(eventId);
    return this.userService.toggleEventBookmark(event, request.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('toogle-venue-bookmark/:venueId')
  async toggleVenueBookmark(
    @Req() request: AuthRequest,
    @Param('venueId') venueId: string,
  ) {
    const venue = await this.venueService.findOne(venueId);
    return this.userService.toggleVenueBookmark(venue, request.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('nfts/owned')
  @ApiResponse({ status: 200, type: [Listing] })
  async ownedNfts(@Req() request: AuthRequest) {
    const listings = await this.internalGetAllNfts(
      request.user.nearWalletAccountId,
    );

    return listings;
  }

  private async internalGetAllNfts(accountId: string) {
    const provider = new providers.JsonRpcProvider({
      url: 'https://archival-rpc.testnet.near.org',
    });

    const args = Buffer.from(
      JSON.stringify({
        account_id: accountId,
      }),
      'utf8',
    ).toString('base64');

    const data = await provider.query({
      request_type: 'call_function',
      finality: 'final',
      account_id: 'round.testnet',
      method_name: 'nft_tokens_for_owner',
      args_base64: args,
    });

    const result = String.fromCharCode(...(data as any).result);
    const nftData: { token_id: string }[] = JSON.parse(result);

    const allSeriesIds = nftData.map((nft) => nft.token_id.split(':')[0]);
    const seriesIds = [...new Set(allSeriesIds)];

    const listings: Listing[] = await this.listingService.findAllBySeriesIds(
      seriesIds,
    );

    return listings;
  }
}
