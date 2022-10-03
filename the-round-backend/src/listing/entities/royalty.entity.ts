import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type RoyaltyDocument = Royalty & Document;

@Schema({ _id: false })
export class Royalty {
  @ApiProperty({
    type: String,
  })
  @Prop()
  walletAddress: string;

  @ApiProperty({
    type: Number,
  })
  @Prop({
    type: Number,
    required: true,
    validate: { validator: (p: number) => p > 0 && p <= 1 },
  })
  royaltyPercentage: number;
}

export const RoyaltySchema = SchemaFactory.createForClass(Royalty);
