import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import AWS from 'aws-sdk';
import { Model, ObjectId } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventDocument } from './entities/event.entity';

@Injectable()
export class EventService {
  constructor(@InjectModel(Event.name) private repo: Model<EventDocument>) {}

  s3 = new AWS.S3({
    accessKeyId: '',
    secretAccessKey: '',
    s3ForcePathStyle: true,
    region: 'eu-west-2',
  });

  async create(createEventDto: CreateEventDto) {
    const created = new this.repo(createEventDto);
    const saved = await created.save();

    const mainFolder = await this.s3
      .putObject({
        Bucket: 'eventperformance',
        Key: `${saved.slug}/`,
      })
      .promise();

    const subFolderAssets = await this.s3
      .putObject({
        Bucket: 'eventperformance',
        Key: `${saved.slug}/Assets`,
      })
      .promise();

    const subFolderStream = await this.s3
      .putObject({
        Bucket: 'eventperformance',
        Key: `${saved.slug}/Stream`,
      })
      .promise();

    return saved;
  }

  findAll(isAdmin = false): Promise<Event[]> {
    return this.repo
      .find(isAdmin ? {} : { isActive: true, isCensored: false })
      .populate('venue')
      .exec();
  }

  findAllForOwner(venueId: ObjectId): Promise<Event[]> {
    return this.repo.find({ venue: venueId }).populate('venue').exec();
  }

  async findByVenue(id: string): Promise<Event[]> {
    return this.repo
      .find({ venue: id, isActive: true, isCensored: false })
      .populate('venue')
      .exec();
  }

  findBySlug(slug: string): Promise<Event> {
    return this.repo
      .findOne({ slug, isActive: true, isCensored: false })
      .populate('venue')
      .exec();
  }

  findOne(id: string): Promise<Event> {
    return this.repo
      .findOne({ _id: id })
      .populate('venue')
      .populate('venue.owner')
      .exec();
  }

  update(id: string, updateVenueDto: UpdateEventDto): Promise<Event> {
    return this.repo.findByIdAndUpdate(id, updateVenueDto).exec();
  }

  remove(id: string): Promise<Event> {
    return this.repo.findByIdAndDelete(id).exec();
  }
}
