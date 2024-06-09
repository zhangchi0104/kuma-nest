export enum UserRoles {
  ADMIN = 0b1000,
  USER = 0b0001,
}
export interface AppUserToken {
  role: UserRoles;
}
