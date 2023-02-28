import bcrypt from 'bcrypt';
import { NewUser, Credentials, NewCourse, Period } from './types';

const isString = (text: unknown): text is string => {
  return typeof text === 'string' || text instanceof String;
};

export const parseString = (string: unknown, field: string): string => {
  if (!string || !isString(string)) {
    throw new Error(`Incorrect or missing ${field}`);
  }
  return string;
};

const isNumber = (number: unknown): number is number => {
  return typeof number === 'number';
};

const parseNumber = (number: unknown, field: string): number => {
  if (!isNumber(number)) {
    throw new Error(`Incorrect or missing ${field}`);
  }
  return number;
};

type UserFields = { username: unknown; name: unknown; password: unknown };

export const toUser = async ({
  username,
  name,
  password,
}: UserFields): Promise<NewUser> => {
  const newUser: NewUser = {
    username: parseString(username, 'username'),
    name: parseString(name, 'name'),
    passwordHash: await bcrypt.hash(parseString(password, 'password'), 10),
  };
  return newUser;
};

type CredentialFields = { username: unknown; password: unknown };

export const toCredentials = ({
  username,
  password,
}: CredentialFields): Credentials => {
  const credentials: Credentials = {
    username: parseString(username, 'password'),
    password: parseString(password, 'password'),
  };
  return credentials;
};

const parsePeriod = (period: unknown): Period => {
  switch (parseNumber(period, 'period')) {
    case 0:
      return 0;
    case 1:
      return 1;
    case 2:
      return 2;
    case 3:
      return 3;
    case 4:
      return 4;
    case 5:
      return 5;
    default:
      throw new Error('Incorrect period. Must be 0, 1, 2, 3,4  or 5.');
  }
};

type CourseFields = {
  name: unknown;
  code: unknown;
  ects: unknown;
  year: unknown;
  startPeriod: unknown;
  endPeriod: unknown;
};

export const toCourse = ({
  name,
  code,
  ects,
  year,
  startPeriod,
  endPeriod,
}: CourseFields): NewCourse => {
  const course: NewCourse = {
    name: parseString(name, 'name'),
    code: parseString(code, 'code'),
    ects: parseNumber(ects, 'ects'),
    year: parseNumber(year, 'year'),
    startPeriod: parsePeriod(startPeriod),
    endPeriod: parsePeriod(endPeriod),
  };
  return course;
};
