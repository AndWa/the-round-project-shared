import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  StreamableFile,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { providers } from 'near-api-js';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorators';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthRequest } from 'src/user/entities/user.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { Listing } from './entities/listing.entity';
import { ListingService } from './listing.service';

@ApiTags('listing')
@Controller('listing')
export class ListingController {
  constructor(
    private readonly listingService: ListingService,
    private readonly httpService: HttpService,
  ) {}

  @Roles(Role.Venue, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiResponse({ status: 200, type: Listing })
  create(
    @Req() request: AuthRequest,
    @Body() createListingDto: CreateListingDto,
  ) {
    createListingDto.available = createListingDto.stock;
    createListingDto.ownerAccountId = request.user.nearWalletAccountId;
    return this.listingService.create(createListingDto);
  }

  @Get()
  @ApiResponse({ status: 200, type: [Listing] })
  findAll() {
    return this.listingService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: Listing })
  findOne(@Param('id') id: string) {
    return this.listingService.findOne(id);
  }

  @Get(':slug/nft')
  @ApiResponse({ status: 200, type: Object })
  findNft(@Param('slug') slug: string) {
    return this.listingService.findNftByListingSlug(slug);
  }

  @Get(':slug/nft')
  @ApiResponse({ status: 200, type: Object })
  getNftImage(@Param('slug') slug: string) {
    return this.listingService.findNftByListingSlug(slug);
  }

  @Roles(Role.Venue, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiResponse({ status: 200, type: Listing })
  async update(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() updateListingDto: UpdateListingDto,
  ) {
    const listing = await this.listingService.findOne(id);
    if (
      listing.ownerAccountId.toString() !==
        request.user.nearWalletAccountId.toString() &&
      !request.user.roles.includes('admin')
    )
      throw new UnauthorizedException();

    return this.listingService.update(id, updateListingDto);
  }

  @Roles(Role.Venue, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiResponse({ status: 200, type: Listing })
  async remove(@Req() request: AuthRequest, @Param('id') id: string) {
    const listing = await this.listingService.findOne(id);
    if (
      listing.ownerAccountId.toString() !==
        request.user.nearWalletAccountId.toString() &&
      !request.user.roles.includes('admin')
    )
      throw new UnauthorizedException();

    return this.listingService.remove(id);
  }

  // @Roles(Role.Venue, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':tokenSeriesId/claimed')
  @ApiResponse({ status: 200, type: Listing })
  async claimListing(
    @Req() request: AuthRequest,
    @Param('tokenSeriesId') tokenSeriesId: string,
  ) {
    const listing = await this.listingService.findByTokenSeriesId(
      tokenSeriesId,
    );

    // if (
    //   listing.venue.owner.uid !== request.user.uid &&
    //   !request.user.roles.includes('admin')
    // )
    //   throw new UnauthorizedException();

    return this.listingService.update(listing._id.toString(), {
      available: listing.available - 1,
    });
  }

  @Post('/claimed')
  async claimedWebhook(
    @Req() request: Request,
    @Body()
    webhookPayload: {
      payload: { Events: { transaction_hash: string } };
    },
  ) {
    if (request.headers['authorization'] !== 'Bearer 5aTHOwKc85hU')
      throw new UnauthorizedException();

    const transactionHash = webhookPayload.payload.Events.transaction_hash;

    const provider = new providers.JsonRpcProvider({
      url: 'https://archival-rpc.testnet.near.org',
    });

    const tx = await provider.txStatus(transactionHash, 'round.testnet');

    const log = JSON.parse(
      tx.receipts_outcome[0].outcome.logs[1].split('EVENT_JSON:')[1],
    );

    const tokenSeriesId = log.data.token_series_id;

    const listing = await this.listingService.findByTokenSeriesId(
      tokenSeriesId,
    );

    return this.listingService.update(listing._id.toString(), {
      available: listing.available - 1,
    });
  }

  @Get(':tokenSeriesId/media')
  @ApiResponse({ status: 200, type: StreamableFile })
  async nftMedia(
    @Param('tokenSeriesId') tokenSeriesId: string,
    @Res() res: Response,
  ) {
    const listing = await this.listingService.findByTokenSeriesId(
      tokenSeriesId,
    );

    let mediaUrl = listing.media;

    const endDate = listing.event.endDate;

    if (endDate < new Date()) {
      if (listing.ticket && listing.ticket.afterEventMedia) {
        mediaUrl = listing.ticket.afterEventMedia;
      }
    }

    const response = await this.httpService.axiosRef(mediaUrl, {
      responseType: 'stream',
    });

    response.data.pipe(res);
  }
}
