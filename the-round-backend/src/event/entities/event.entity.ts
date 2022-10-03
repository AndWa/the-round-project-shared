import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document, ObjectId } from 'mongoose';
import { toSlug } from 'src/utils/slug';
import { Venue } from 'src/venue/entities/venue.entity';

export type EventDocument = Event & Document;

@Schema()
export class Event {
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
    type: Boolean,
  })
  @Prop({ default: false })
  isMature: boolean;

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
  @Prop({ required: true })
  type: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  shortDescription: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  longDescription: string;

  @ApiProperty({
    type: Date,
  })
  @Prop({ type: Date, required: true })
  startDate: Date;

  @ApiProperty({
    type: Date,
  })
  @Prop({ type: Date, required: true })
  endDate: Date;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  bannerUrl: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  mediaUrl: string;

  @ApiProperty({
    type: [String],
  })
  @Prop({ type: [String], default: null })
  mediaUrls: string[];

  @ApiProperty({
    type: String,
  })
  @Prop({ default: null })
  trailerUrl?: string;

  @ApiProperty({
    type: Venue,
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Venue.name,
    required: true,
  })
  venue: Venue;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.pre('save', function (next) {
  this.slug = toSlug(this.title);
  next();
});
