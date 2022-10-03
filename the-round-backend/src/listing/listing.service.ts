import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { Listing, ListingDocument } from './entities/listing.entity';

@Injectable()
export class ListingService {
  constructor(
    @InjectModel(Listing.name) private repo: Model<ListingDocument>,
  ) {}

  create(createListingDto: CreateListingDto) {
    const created = new this.repo(createListingDto);
    return created.save();
  }

  findAll(): Promise<Listing[]> {
    return this.repo
      .find({ isActive: true, isCensored: false })
      .populate(['event', 'venue'])
      .exec();
  }

  findAllBySeriesIds(seriesIds: string[]): Promise<Listing[]> {
    return this.repo
      .find({
        isActive: true,
        isCensored: false,
        tokenSeriesId: { $in: seriesIds },
      })
      .populate(['event', 'venue'])
      .exec();
  }

  findBySlug(slug: string): Promise<Listing> {
    return this.repo
      .findOne({ slug, isActive: true, isCensored: false })
      .populate(['event', 'venue'])
      .exec();
  }

  findByVenueId(id: string): Promise<Listing[]> {
    return this.repo
      .find({ venue: id, isActive: true, isCensored: false })
      .populate(['event', 'venue'])
      .exec();
  }

  findByEventId(id: string): Promise<Listing[]> {
    return this.repo
      .find({ event: id, isActive: true, isCensored: false })
      .populate(['event', 'venue'])
      .exec();
  }

  findByTokenSeriesId(id: string): Promise<Listing> {
    return this.repo
      .findOne({ tokenSeriesId: id, isActive: true, isCensored: false })
      .populate(['event', 'venue'])
      .exec();
  }

  async findNftByListingSlug(slug: string): Promise<any> {
    const listing = await this.findBySlug(slug);
    return listing.nft;
  }

  findOne(id: string): Promise<Listing> {
    return this.repo
      .findOne({ _id: id as unknown as ObjectId })
      .populate(['event', 'venue'])
      .exec();
  }

  update(id: string, updateListingDto: UpdateListingDto) {
    return this.repo.findByIdAndUpdate(id, updateListingDto).exec();
  }

  remove(id: string): Promise<Listing> {
    return this.repo.findByIdAndDelete(id).exec();
  }
}
