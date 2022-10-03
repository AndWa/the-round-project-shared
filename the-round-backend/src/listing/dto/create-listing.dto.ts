import { ApiProperty } from '@nestjs/swagger';
import { CreateMerchandiseDto } from './create-merchandise.dto';
import { CreateRoyaltyDto } from './create-royalty.dto';
import { CreateTicketDto } from './create-ticket.dto';
import { CreateVenuePassDto } from './create-venue-pass.dto';

export class CreateListingDto {
  @ApiProperty({
    type: Boolean,
  })
  isCensored: boolean;

  @ApiProperty({
    type: Boolean,
  })
  isActive: boolean;

  @ApiProperty({
    type: String,
  })
  media: string;

  @ApiProperty({
    type: String,
  })
  readonly title: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  description?: string;

  @ApiProperty({
    type: Number,
    required: false,
  })
  price?: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  stock?: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  available?: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  marketplaceRoyalty?: number;

  @ApiProperty({
    type: [CreateRoyaltyDto],
  })
  royalties: CreateRoyaltyDto[];

  @ApiProperty({
    type: Date,
  })
  startDate: Date;

  @ApiProperty({
    type: Date,
    required: false,
  })
  endDate?: Date;

  @ApiProperty({
    type: String,
    required: false,
  })
  readonly event?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  readonly venue?: string;

  @ApiProperty({
    type: CreateTicketDto,
    required: false,
  })
  ticket?: CreateTicketDto;

  @ApiProperty({
    type: CreateMerchandiseDto,
    required: false,
  })
  merchandise?: CreateMerchandiseDto;

  @ApiProperty({
    type: CreateVenuePassDto,
    required: false,
  })
  venuePass?: CreateVenuePassDto;

  @ApiProperty({
    type: String,
  })
  tokenSeriesId: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  ownerAccountId?: string;
}
