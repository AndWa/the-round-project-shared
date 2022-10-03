import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from 'src/event/event.module';
import { ListingModule } from 'src/listing/listing.module';
import { Location, LocationSchema } from './entities/location.entity';
import { Venue, VenueSchema } from './entities/venue.entity';
import { VenueController } from './venue.controller';
import { VenueService } from './venue.service';

@Module({
  imports: [
    ListingModule,
    EventModule,
    MongooseModule.forFeature([{ name: Venue.name, schema: VenueSchema }]),
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
    ]),
  ],
  controllers: [VenueController],
  providers: [VenueService],
  exports: [VenueService],
})
export class VenueModule {}
