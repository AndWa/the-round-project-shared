import { ApiProperty } from '@nestjs/swagger';

export class CreateRoyaltyDto {
  @ApiProperty({
    type: String,
  })
  walletAddress: string;

  @ApiProperty({
    type: Number,
  })
  royaltyPercentage: number;
}
