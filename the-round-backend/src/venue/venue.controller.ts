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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorators';
import { RolesGuard } from 'src/auth/roles.guard';
import { Event } from 'src/event/entities/event.entity';
import { EventService } from 'src/event/event.service';
import { Listing } from 'src/listing/entities/listing.entity';
import { ListingService } from 'src/listing/listing.service';
import { AuthRequest } from 'src/user/entities/user.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { Venue } from './entities/venue.entity';
import { VenueService } from './venue.service';

@ApiTags('venue')
@Controller('venue')
export class VenueController {
  constructor(
    private readonly venueService: VenueService,
    private readonly eventService: EventService,
    private readonly listingService: ListingService,
  ) {}

  @Roles(Role.Venue, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiResponse({ status: 200, type: Venue })
  create(@Req() request: AuthRequest, @Body() createVenueDto: CreateVenueDto) {
    createVenueDto.owner = request.user._id;
    return this.venueService.create(createVenueDto);
  }

  @Get()
  @ApiQuery({ name: 'id', required: false })
  @ApiQuery({ name: 'slug', required: false })
  @ApiResponse({ status: 200, type: [Venue] })
  findAll(@Query('id') id?: string, @Query('slug') slug?: string) {
    if (id) {
      return this.venueService.findOne(id);
    }

    if (slug) {
      return this.venueService.findBySlug(slug);
    }

    return this.venueService.findAll();
  }

  @Get(':slug')
  @ApiResponse({ status: 200, type: Venue })
  findOne(@Param('slug') slug: string) {
    return this.venueService.findBySlug(slug);
  }

  @Get(':slug/events')
  @ApiResponse({ status: 200, type: [Event] })
  async findEvents(@Param('slug') slug: string) {
    const venue = await this.venueService.findBySlug(slug);
    return this.eventService.findByVenue(venue._id.toString());
  }

  @Get(':slug/pass')
  @ApiResponse({ status: 200, type: [Listing] })
  async findVenuePass(@Param('slug') slug: string) {
    const venue = await this.venueService.findBySlug(slug);

    const listings = await this.listingService.findByVenueId(
      venue._id.toString(),
    );

    return listings.filter(
      (listing) => listing.venuePass != null && listing.venuePass != undefined,
    );
  }

  @Get(':slug/merchandise')
  @ApiResponse({ status: 200, type: [Listing] })
  async findAllMerchandise(@Param('slug') slug: string) {
    const venue = await this.venueService.findBySlug(slug);

    const listings = await this.listingService.findByVenueId(
      venue._id.toString(),
    );

    return listings.filter(
      (listing) =>
        listing.merchandise != null && listing.merchandise != undefined,
    );
  }

  @Roles(Role.Venue, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiResponse({ status: 200, type: Venue })
  async update(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() updateVenueDto: UpdateVenueDto,
  ) {
    const venue = await this.venueService.findOne(id);
    if (
      venue.owner.uid !== request.user.uid &&
      !request.user.roles.includes('admin')
    )
      throw new UnauthorizedException();
    return this.venueService.update(id, updateVenueDto);
  }

  @Roles(Role.Venue, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiResponse({ status: 200, type: Venue })
  async remove(@Req() request: AuthRequest, @Param('id') id: string) {
    const venue = await this.venueService.findOne(id);
    if (
      venue.owner.uid !== request.user.uid &&
      !request.user.roles.includes('admin')
    )
      throw new UnauthorizedException();

    const events = await this.eventService.findByVenue(id);

    for (const event of events) {
      await this.eventService.remove(event._id.toString());
    }

    return this.venueService.remove(id);
  }
}
