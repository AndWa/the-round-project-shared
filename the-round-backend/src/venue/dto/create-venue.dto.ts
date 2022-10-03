import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';

export class CreateVenueDto {
  @ApiProperty({
    type: Boolean,
    required: false,
  })
  readonly isActive: boolean;

  @ApiProperty({
    type: String,
  })
  readonly title: string;

  @ApiProperty({
    type: String,
  })
  readonly shortDescription: string;

  @ApiProperty({
    type: String,
  })
  readonly longDescription: string;

  @ApiProperty({
    type: String,
  })
  readonly bannerUrl: string;

  @ApiProperty({
    type: String,
  })
  readonly logoUrl: string;

  @ApiProperty({
    type: Number,
    required: false,
  })
  readonly latitude?: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  readonly longitude?: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  readonly websiteUrl?: string;

  location: any;
  owner: ObjectId;
}
