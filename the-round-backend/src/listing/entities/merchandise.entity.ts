import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type MerchandiseDocument = Merchandise & Document;

@Schema({ _id: false })
export class Merchandise {
  @ApiProperty({
    type: Boolean,
  })
  @Prop({ required: true, default: false })
  equippable: boolean;

  @ApiProperty({
    type: String,
  })
  @Prop({ default: null })
  model?: string;
}

export const MerchandiseSchema = SchemaFactory.createForClass(Merchandise);
