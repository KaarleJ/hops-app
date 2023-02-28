export interface ReturnedUser {
  username: string;
  name: string;
  passwordHash?: string;
  courses: Course[];
  id: string;
  _id?: string;
  _v?: string;
}

export interface UserType {
  username: string;
  name: string;
  passwordHash: string;
  courses: Course[];
  id: string;
}

export type NewUser = Omit<UserType, 'id' | 'courses'>;

export type EncodedUser = Omit<UserType, 'passwordHash' | 'name' | 'courses'>;

export type SentUser = Omit<UserType, 'passwordHash' | 'courses'>;

export interface Credentials {
  username: string;
  password: string;
}

export type Period = 0 | 1 | 2 | 3 | 4 | 5;

export interface ReturnedCourse {
  name: string;
  code: string;
  id: string;
  ects: number;
  year: number;
  startPeriod: Period;
  endPeriod: Period;
  _id?: string;
  _v?: string;
}

export type Course = Omit<ReturnedCourse, '_v' | '_id'>;

export type NewCourse = Omit<Course, 'id'>;
