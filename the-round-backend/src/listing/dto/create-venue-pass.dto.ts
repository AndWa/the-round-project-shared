import { ApiProperty } from '@nestjs/swagger';

export class CreateVenuePassDto {
  @ApiProperty({
    type: Number,
  })
  daysValid: number;
}
