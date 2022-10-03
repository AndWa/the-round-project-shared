import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Event } from 'src/event/entities/event.entity';
import { Venue } from 'src/venue/entities/venue.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private repo: Model<UserDocument>) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const created = new this.repo(createUserDto);
    return created.save();
  }

  findAll(): Promise<User[]> {
    return this.repo
      .find()
      .populate(['bookmarkedEvents', 'bookmarkedVenues'])
      .exec();
  }

  findOne(uid: string): Promise<User> {
    return this.repo
      .findOne({ $or: [{ uid }, { nearWalletAccountId: uid }] })
      .populate(['bookmarkedEvents', 'bookmarkedVenues'])
      .exec();
  }

  findOneById(id: string): Promise<User> {
    return this.repo
      .findOne({ _id: id })
      .populate(['bookmarkedEvents', 'bookmarkedVenues'])
      .exec();
  }

  findOneByOtp(otp: string): Promise<User> {
    return this.repo
      .findOne({ otp: otp })
      .populate(['bookmarkedEvents', 'bookmarkedVenues'])
      .exec();
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.repo
      .findByIdAndUpdate(id, updateUserDto)
      .populate(['bookmarkedEvents', 'bookmarkedVenues'])
      .exec();
  }

  async whitelist(id: string) {
    const user = await this.findOneById(id);
    if (user.roles.includes('venue')) {
      return;
    }

    return this.repo
      .findByIdAndUpdate(id, {
        $push: { roles: 'venue' },
      })
      .exec();
  }

  removeFromWhitelist(id: string) {
    return this.repo
      .findByIdAndUpdate(id, {
        $pullAll: { roles: ['venue'] },
      })
      .exec();
  }

  remove(id: number) {
    return this.repo.findByIdAndDelete(id).exec();
  }

  async toggleEventBookmark(event: Event, userId: ObjectId) {
    const exists = await this.repo.findOne({
      _id: userId,
      bookmarkedEvents: { $in: [event] },
    });

    if (exists) {
      return this.repo.findByIdAndUpdate(userId, {
        $pull: { bookmarkedEvents: event._id },
      });
    }

    return this.repo
      .findByIdAndUpdate(userId, {
        $addToSet: { bookmarkedEvents: event },
      })
      .exec();
  }

  async toggleVenueBookmark(venue: Venue, userId: ObjectId) {
    const exists = await this.repo.findOne({
      _id: userId,
      bookmarkedVenues: { $in: [venue] },
    });

    if (exists) {
      return this.repo
        .findByIdAndUpdate(userId, {
          $pull: { bookmarkedVenues: venue._id },
        })
        .exec();
    }

    return this.repo
      .findByIdAndUpdate(userId, {
        $addToSet: { bookmarkedVenues: venue },
      })
      .exec();
  }
}
