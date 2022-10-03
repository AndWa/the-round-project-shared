import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId, SchemaTypes } from 'mongoose';
import { Event } from 'src/event/entities/event.entity';
import { Venue } from 'src/venue/entities/venue.entity';

export type UserDocument = User & Document;

export type AuthRequest = Request & { user: User };

@Schema()
export class User {
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
  uid: string; // FIREBASE UID or NEAR accountId (e.g. test.near)

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  accountType: string; // 'near' or 'firebase'

  @ApiProperty({
    type: [String],
  })
  @Prop({ type: [String], required: true, default: ['customer'] })
  roles: string[]; // 'customer' or 'venue' or 'admin'.

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true, unique: true })
  username: string; // FIREBASE EMAIL or NEAR accountId (e.g. test.near)

  @ApiProperty({
    type: String,
  })
  @Prop({ default: null })
  nearWalletAccountId: string; // NEAR accountId (e.g. test.near)

  @ApiProperty({
    type: String,
  })
  @Prop({ default: null, select: false })
  seedPhraseHash: string; // NEAR seed phrase hash - only for Firebase accounts

  @ApiProperty({
    type: [Event],
  })
  @Prop({ type: [SchemaTypes.ObjectId], ref: 'Event' })
  bookmarkedEvents: Event[]; // Array of event ids

  @ApiProperty({
    type: [Venue],
  })
  @Prop({ type: [SchemaTypes.ObjectId], ref: 'Venue' })
  bookmarkedVenues: Venue[]; // Array of venue ids

  @ApiProperty({
    type: String,
  })
  @Prop({ default: null })
  otp: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ type: Date, default: null })
  otpExpirationDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
