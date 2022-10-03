import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document, ObjectId } from 'mongoose';
import { User } from 'src/user/entities/user.entity';
import { toSlug } from 'src/utils/slug';
import { Location, LocationSchema } from './location.entity';

export type VenueDocument = Venue & Document;

@Schema({
  _id: true,
})
export class Venue {
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
  shortDescription: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  longDescription: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  logoUrl: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  bannerUrl: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ default: null })
  websiteUrl?: string;

  @ApiProperty({
    type: Location,
  })
  @Prop({ type: LocationSchema, index: '2dsphere', default: null })
  location?: Location;

  @ApiProperty({
    type: User,
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  owner: User;
}

export const VenueSchema = SchemaFactory.createForClass(Venue);

VenueSchema.pre('save', function (next) {
  this.slug = toSlug(this.title);
  next();
});
