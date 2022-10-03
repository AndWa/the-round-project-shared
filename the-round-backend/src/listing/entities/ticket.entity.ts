import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type TicketDocument = Ticket & Document;

@Schema({ _id: false })
export class Ticket {
  @ApiProperty({
    type: String,
  })
  @Prop({ default: null })
  afterEventMedia?: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ default: null })
  utilityInstructions?: string;

  @ApiProperty({
    type: [String],
  })
  @Prop({ default: null })
  reedemableCodes?: string[];
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
