import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  afterEventMedia?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  utilityInstructions?: string;

  @ApiProperty({
    type: [String],
    required: false,
  })
  reedemableCodes?: string[];
}
