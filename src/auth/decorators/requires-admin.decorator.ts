import { SetMetadata } from '@nestjs/common';
import { UserRoles } from '../auth.type';

export const USER_ROLE_KEY = 'userRole';
export const UserRole = (role: UserRoles) => SetMetadata(USER_ROLE_KEY, role);
