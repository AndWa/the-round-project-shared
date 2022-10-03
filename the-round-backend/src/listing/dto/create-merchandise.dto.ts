import { ApiProperty } from '@nestjs/swagger';

export class CreateMerchandiseDto {
  @ApiProperty({
    type: Boolean,
  })
  equippable: boolean;

  @ApiProperty({
    type: String,
    required: false,
  })
  model?: string;
}
