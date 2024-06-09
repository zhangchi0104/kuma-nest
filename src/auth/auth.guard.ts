import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AppUserToken, UserRoles } from './auth.type';
import { USER_ROLE_KEY } from './decorators/requires-admin.decorator';
@Injectable()
export class AuthGuard implements CanActivate {
  requiresAdmin: boolean;
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = (await this.jwtService.verifyAsync(token, {
        publicKey: process.env.JWT_PUBLIC_KEY,
      })) as AppUserToken;
      const requiredRole = this.reflector.getAllAndOverride<UserRoles>(
        USER_ROLE_KEY,
        [context.getHandler(), context.getClass()],
      );
      console.log({ requiredRole, payloadRole: payload.role });

      if (requiredRole && (!payload.role || requiredRole > payload.role)) {
        throw new ForbiddenException();
      }

      console.log(payload);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException();
    }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
