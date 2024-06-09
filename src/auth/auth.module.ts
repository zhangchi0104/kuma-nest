import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import env from 'src/env';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      publicKey: env.JWT_PUBLIC_KEY,
    }),
  ],
})
export class AuthModule {}
