export interface ReturnedUser {
  username: string,
  name: string,
  passwordHash?: string,
  id: string,
  _id?: string,
  _v?: string,
}

export interface UserType {
  username: string,
  name: string,
  passwordHash: string,
  id: string,
}

export type NewUser = Omit<UserType, 'id'>;

export type EncodedUser = Omit<UserType, 'passwordHash' | 'name'>;

export interface Credentials {
  username: string,
  password: string,
}