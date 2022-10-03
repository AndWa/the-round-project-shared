import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    type: String,
  })
  readonly title: string;

  @ApiProperty({
    type: Boolean,
  })
  readonly isMature: boolean;

  @ApiProperty({
    type: Boolean,
  })
  readonly isActive: boolean;

  @ApiProperty({
    type: String,
  })
  readonly type: string;

  @ApiProperty({
    type: String,
  })
  readonly shortDescription: string;

  @ApiProperty({
    type: String,
  })
  readonly longDescription: string;

  @ApiProperty({
    type: Date,
  })
  readonly startDate: Date;

  @ApiProperty({
    type: Date,
  })
  readonly endDate: Date;

  @ApiProperty({
    type: String,
  })
  readonly bannerUrl: string;

  @ApiProperty({
    type: String,
  })
  readonly mediaUrl: string;

  @ApiProperty({
    type: [String],
    required: false,
  })
  readonly mediaUrls?: string[];

  @ApiProperty({
    type: String,
    required: false,
  })
  readonly trailerUrl?: string;

  @ApiProperty({
    type: String,
  })
  readonly venue: string;
}
