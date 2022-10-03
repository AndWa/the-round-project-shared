import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocationDocument = Location & Document;

@Schema({
  _id: false,
})
export class Location {
  @Prop({ default: 'Point' })
  type: string;

  @Prop({ type: [Number, Number], default: [0, 0] })
  coordinates: [number, number]; // longitude, latitude
}

export const LocationSchema = SchemaFactory.createForClass(Location);
