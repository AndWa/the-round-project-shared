import AdminJSMongoose from '@adminjs/mongoose';
import { AdminModule } from '@adminjs/nestjs';
import { Module, Scope } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import AdminJS from 'adminjs';
import { Model } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Event } from './event/entities/event.entity';
import { EventModule } from './event/event.module';
import { Listing } from './listing/entities/listing.entity';
import { ListingModule } from './listing/listing.module';
import { PassportJwtDuplicationFixInterceptor } from './passport-fix.interceptor';
import { MongooseSchemasModule } from './schemas.module';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { Venue } from './venue/entities/venue.entity';
import { VenueModule } from './venue/venue.module';

AdminJS.registerAdapter(AdminJSMongoose);

@Module({
  imports: [
    MongooseModule.forRoot(''),
    VenueModule,
    EventModule,
    ListingModule,
    AuthModule,
    UserModule,
    AdminModule.createAdminAsync({
      imports: [MongooseSchemasModule],
      inject: [
        getModelToken('Venue'),
        getModelToken('User'),
        getModelToken('Event'),
        getModelToken('Listing'),
      ],
      useFactory: (
        venueModel: Model<Venue>,
        userModel: Model<User>,
        eventModel: Model<Event>,
        listingModel: Model<Listing>,
      ) => ({
        adminJsOptions: {
          rootPath: '/admin',
          resources: [
            {
              resource: venueModel,
              options: {
                properties: {
                  createdAt: {
                    isVisible: {
                      edit: false,
                      new: false,
                    },
                  },
                  updatedAt: {
                    isVisible: {
                      edit: false,
                      new: false,
                    },
                  },
                  slug: {
                    isVisible: {
                      edit: false,
                      new: false,
                    },
                  },
                },
                parent: { name: 'Content', icon: 'Home' },
              },
            },
            {
              resource: userModel,
              options: {
                properties: {
                  username: {
                    isTitle: true,
                  },
                  createdAt: {
                    isVisible: {
                      edit: false,
                      new: false,
                    },
                  },
                  updatedAt: {
                    isVisible: {
                      edit: false,
                      new: false,
                    },
                  },
                },
                parent: { name: 'Content', icon: 'Home' },
              },
            },
            {
              resource: eventModel,
              options: {
                properties: {
                  createdAt: {
                    isVisible: {
                      edit: false,
                      new: false,
                    },
                  },
                  updatedAt: {
                    isVisible: {
                      edit: false,
                      new: false,
                    },
                  },
                  slug: {
                    isVisible: {
                      edit: false,
                      new: false,
                    },
                  },
                },
                parent: { name: 'Content', icon: 'Home' },
              },
            },
            {
              resource: listingModel,
              options: {
                properties: {
                  createdAt: {
                    isVisible: {
                      edit: false,
                      new: false,
                    },
                  },
                  updatedAt: {
                    isVisible: {
                      edit: false,
                      new: false,
                    },
                  },
                  slug: {
                    isVisible: {
                      edit: false,
                      new: false,
                    },
                  },
                },
                parent: { name: 'Content', icon: 'Home' },
              },
            },
          ],
          branding: {
            logo: 'https://theround.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ftr-logo.754a0f70.png&w=96&q=75',
            companyName: 'The Round',
            withMadeWithLove: false,
          },
        },
        auth: {
          authenticate: async (email, password) =>
            Promise.resolve({ email: '' }),
          cookieName: '',
          cookiePassword: '',
        },
      }),
    }),
    MongooseSchemasModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      scope: Scope.REQUEST,
      useClass: PassportJwtDuplicationFixInterceptor,
    },
  ],
})
export class AppModule {}
