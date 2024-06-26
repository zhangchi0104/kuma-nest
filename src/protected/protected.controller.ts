import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserRoles } from 'src/auth/auth.type';
import { UserRole } from 'src/auth/decorators/requires-admin.decorator';

@Controller('protected')
@UseGuards(AuthGuard)
export class ProtectedController {
  @Get('/')
  getProtected() {
    return { message: 'This is a protected route' };
  }

  // @Get('/admin')
  // @UserRole(UserRoles.ADMIN)
  // getAdminProtected() {
  //   return { message: 'This is an admin protected route' };
  // }
}
