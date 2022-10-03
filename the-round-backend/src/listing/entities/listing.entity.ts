import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { ObjectId } from 'mongoose';
import { Event } from 'src/event/entities/event.entity';
import { toSlug } from 'src/utils/slug';
import { Venue } from 'src/venue/entities/venue.entity';
import { Merchandise, MerchandiseSchema } from './merchandise.entity';
import { Royalty, RoyaltySchema } from './royalty.entity';
import { Ticket, TicketSchema } from './ticket.entity';
import { VenuePass, VenuePassSchema } from './venue-pass.entity';

export type ListingDocument = Listing & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class Listing {
  _id: ObjectId;

  @ApiProperty({
    type: Date,
  })
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @ApiProperty({
    type: Date,
  })
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @ApiProperty({
    type: Boolean,
  })
  @Prop({ default: false })
  isCensored: boolean;

  @ApiProperty({
    type: Boolean,
  })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  media: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true, unique: true })
  title: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ unique: true })
  slug: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ default: null })
  description?: string;

  @ApiProperty({
    type: Number,
  })
  @Prop({ type: Number, default: null })
  price?: number;

  @ApiProperty({
    type: Number,
  })
  @Prop({ type: Number, default: null })
  stock?: number;

  @ApiProperty({
    type: Number,
  })
  @Prop({ type: Number, default: null })
  available?: number;

  @ApiProperty({
    type: Number,
  })
  @Prop({ type: Number, default: 0.25 })
  marketplaceRoyalty: number;

  @ApiProperty({
    type: [RoyaltySchema],
  })
  @Prop({
    type: [RoyaltySchema],
    validate: {
      validator: (p: Royalty[]) =>
        p.length === 0 ||
        p.map((e) => e.royaltyPercentage).reduce((a, b) => a + b) <= 1,
    },
  })
  royalties: Royalty[];

  @ApiProperty({
    type: Date,
  })
  @Prop({ type: Date, required: true })
  startDate: Date;

  @ApiProperty({
    type: Date,
  })
  @Prop({ type: Date, default: null })
  endDate?: Date;

  @ApiProperty({
    type: Ticket,
  })
  @Prop({ type: TicketSchema, default: null })
  ticket?: Ticket;

  @ApiProperty({
    type: Merchandise,
  })
  @Prop({ type: MerchandiseSchema, default: null })
  merchandise?: Merchandise;

  @ApiProperty({
    type: VenuePass,
  })
  @Prop({ type: VenuePassSchema, default: null })
  venuePass?: VenuePass;

  @ApiProperty({
    type: Event,
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Event.name,
    default: null,
  })
  event?: Event;

  @ApiProperty({
    type: Venue,
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Venue.name,
    default: null,
  })
  venue?: Venue;

  @ApiProperty({
    type: String,
  })
  @Prop({
    type: String,
    required: true,
  })
  tokenSeriesId: string;

  @ApiProperty({
    type: String,
  })
  @Prop({
    type: String,
    required: true,
  })
  ownerAccountId: string;

  @ApiProperty({
    type: 'object',
  })
  nft: Record<string, any>;
}

const ListingSchema = SchemaFactory.createForClass(Listing);

ListingSchema.pre('save', function (next) {
  this.slug = toSlug(this.title);
  next();
});

ListingSchema.virtual('nft').get(function (this: ListingDocument) {
  const getType = () => {
    if (this.merchandise) {
      return 'merchandise';
    }

    if (this.venuePass) {
      return 'venuePass';
    }

    if (this.ticket) {
      return 'ticket';
    }

    return null;
  };

  const getItemByType = (type: string) => {
    switch (type) {
      case 'ticket':
        return this.ticket;
      case 'merchandise':
        return this.merchandise;
      case 'venuePass':
        return this.venuePass;
      default:
        return null;
    }
  };

  const type = getType();
  const item = getItemByType(type);

  const extra: Record<string, any> = {
    type: type,
  };

  if (this.event) {
    extra.event = this.event.title;
    extra.eventUrl = `https://${process.env.DOMAIN}/event/${this.event.slug}`;
  }

  if (this.venue) {
    extra.venue = this.venue.title;
    extra.venueUrl = `https://${process.env.DOMAIN}/venue/${this.venue.slug}`;
  }

  if (type === 'merchandise') {
    extra.model = (item as Merchandise).model;
  }

  if (type === 'venuePass') {
    extra.daysValid = (item as VenuePass).daysValid;
  }

  return {
    title: this.title,
    description: this.description,
    media: this.media,
    media_hash: null,
    copies: this.stock,
    issues_at: null,
    expires_at: null,
    starts_at: null,
    updated_at: null,
    extra: extra,
    reference: `https://${process.env.DOMAIN}/listing/${this._id}`,
    reference_hash: null,
  };
});

export { ListingSchema };
