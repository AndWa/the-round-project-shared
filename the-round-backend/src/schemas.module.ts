import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './event/entities/event.entity';
import { Listing, ListingSchema } from './listing/entities/listing.entity';
import {
  Merchandise,
  MerchandiseSchema,
} from './listing/entities/merchandise.entity';
import { Royalty, RoyaltySchema } from './listing/entities/royalty.entity';
import { Ticket, TicketSchema } from './listing/entities/ticket.entity';
import {
  VenuePass,
  VenuePassSchema,
} from './listing/entities/venue-pass.entity';
import { User, UserSchema } from './user/entities/user.entity';
import { Location, LocationSchema } from './venue/entities/location.entity';
import { Venue, VenueSchema } from './venue/entities/venue.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Venue.name, schema: VenueSchema }]),
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    MongooseModule.forFeature([{ name: Listing.name, schema: ListingSchema }]),
    MongooseModule.forFeature([
      { name: Merchandise.name, schema: MerchandiseSchema },
    ]),
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
    MongooseModule.forFeature([
      { name: VenuePass.name, schema: VenuePassSchema },
    ]),
    MongooseModule.forFeature([{ name: Royalty.name, schema: RoyaltySchema }]),
  ],
  exports: [MongooseModule],
})
export class MongooseSchemasModule {}
