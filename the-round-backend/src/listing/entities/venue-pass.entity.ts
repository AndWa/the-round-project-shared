import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type VenuePassDocument = VenuePass & Document;

@Schema({ _id: false })
export class VenuePass {
  @ApiProperty({
    type: Number,
  })
  @Prop({ type: Number })
  daysValid: number;
}

export const VenuePassSchema = SchemaFactory.createForClass(VenuePass);
