import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { ProtectedModule } from './protected/protected.module';

import { BlogMetadataModule } from './blog-metadata/blog-metadata.module';
import { BlogsModule } from './blogs/blogs.module';
import { BlogContentModule } from './blog-content/blog-content.module';
import { APP_FILTER } from '@nestjs/core';
import { CatchEverythingFilter } from './filters/all-exceptions.filter';

@Module({
  imports: [
    AuthModule,
    ProtectedModule,
    BlogMetadataModule,
    BlogsModule,
    BlogContentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
  ],
})
export class AppModule {}
