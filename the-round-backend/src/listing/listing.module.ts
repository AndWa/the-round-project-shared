import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Listing, ListingSchema } from './entities/listing.entity';
import { Merchandise, MerchandiseSchema } from './entities/merchandise.entity';
import { Royalty, RoyaltySchema } from './entities/royalty.entity';
import { Ticket, TicketSchema } from './entities/ticket.entity';
import { VenuePass, VenuePassSchema } from './entities/venue-pass.entity';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';

@Module({
  imports: [
    HttpModule,
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
  controllers: [ListingController],
  providers: [ListingService],
  exports: [ListingService],
})
export class ListingModule {}
