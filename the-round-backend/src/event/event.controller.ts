import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorators';
import { RolesGuard } from 'src/auth/roles.guard';
import { Listing } from 'src/listing/entities/listing.entity';
import { ListingService } from 'src/listing/listing.service';
import { AuthRequest } from 'src/user/entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { EventService } from './event.service';

@ApiTags('event')
@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly listingService: ListingService,
  ) {}

  @Roles(Role.Venue, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiResponse({ status: 200, type: Event })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get()
  @ApiResponse({ status: 200, type: [Event] })
  findAll() {
    return this.eventService.findAll();
  }

  @Get(':slug')
  @ApiResponse({ status: 200, type: Event })
  findOne(@Param('slug') slug: string) {
    return this.eventService.findBySlug(slug);
  }

  @Get(':slug/tickets')
  @ApiResponse({ status: 200, type: [Listing] })
  async findAllTickets(@Param('slug') slug: string) {
    const event = await this.eventService.findBySlug(slug);

    const listings = await this.listingService.findByEventId(
      event._id.toString(),
    );

    return listings.filter(
      (listing) => listing.ticket != null && listing.ticket != undefined,
    );
  }

  @Get(':slug/merchandise')
  @ApiResponse({ status: 200, type: [Listing] })
  async findAllMerchandise(@Param('slug') slug: string) {
    const event = await this.eventService.findBySlug(slug);

    const listings = await this.listingService.findByEventId(
      event._id.toString(),
    );

    return listings.filter(
      (listing) =>
        listing.merchandise != null && listing.merchandise != undefined,
    );
  }

  @Roles(Role.Venue, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiResponse({ status: 200, type: Event })
  async update(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const event = await this.eventService.findOne(id);

    if (
      event.venue.owner._id.toString() !== request.user._id.toString() &&
      !request.user.roles.includes('admin')
    )
      throw new UnauthorizedException();

    return this.eventService.update(id, updateEventDto);
  }

  @Roles(Role.Venue, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiResponse({ status: 200, type: Event })
  async remove(@Req() request: AuthRequest, @Param('id') id: string) {
    const event = await this.eventService.findOne(id);
    if (
      event.venue.owner._id.toString() !== request.user._id.toString() &&
      !request.user.roles.includes('admin')
    )
      throw new UnauthorizedException();

    return this.eventService.remove(id);
  }
}
