import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { Venue, VenueDocument } from './entities/venue.entity';

@Injectable()
export class VenueService {
  constructor(@InjectModel(Venue.name) private repo: Model<VenueDocument>) {}

  create(createVenueDto: CreateVenueDto): Promise<Venue> {
    const { latitude, longitude } = createVenueDto;

    if (latitude && longitude) {
      createVenueDto.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }

    const created = new this.repo(createVenueDto);
    return created.save();
  }

  findAll(isAdmin = false): Promise<Venue[]> {
    return this.repo
      .find(isAdmin ? {} : { isActive: true, isCensored: false })
      .populate('owner')
      .exec();
  }

  findAllForOwner(ownerId: ObjectId): Promise<Venue[]> {
    return this.repo.find({ owner: ownerId }).populate('owner').exec();
  }

  findBySlugForOwner(slug: string, ownerId: ObjectId): Promise<Venue> {
    return this.repo.findOne({ slug, owner: ownerId }).populate('owner').exec();
  }

  findBySlug(slug: string): Promise<Venue> {
    return this.repo
      .findOne({ slug, isActive: true, isCensored: false })
      .populate('owner')
      .exec();
  }

  findOne(id: string): Promise<Venue> {
    return this.repo.findOne({ _id: id }).populate('owner').exec();
  }

  update(id: string, updateVenueDto: UpdateVenueDto): Promise<Venue> {
    const { latitude, longitude } = updateVenueDto;

    if (latitude && longitude) {
      updateVenueDto.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }

    return this.repo.findByIdAndUpdate(id, updateVenueDto).exec();
  }

  remove(id: string): Promise<Venue> {
    return this.repo.findByIdAndDelete(id).exec();
  }
}
