import bcrypt from 'bcrypt';
import { NewUser, Credentials } from "./types";

const isString = (text: unknown): text is string => {
  return typeof text === 'string' || text instanceof String;
};

const parseUsername = (username: unknown): string => {
  if (!username || !isString(username)) {
    throw new Error('Incorrect or missing username');
  }
  return username;
};

const parseName = (name: unknown): string => {
  if (!name || !isString(name)) {
    throw new Error('Incorrect or missing name');
  }
  return name;
};

const parsePassword = (password: unknown): string => {
  if (!password || !isString(password)) {
    throw new Error('Incorrect or missing password');
  }
  return password;
};

type UserFields = { username: unknown, name: unknown, password: unknown };

export const toUser = async ({ username, name, password} : UserFields) : Promise<NewUser> => {
  const newUser: NewUser = {
    username: parseUsername(username),
    name: parseName(name),
    passwordHash: await bcrypt.hash(parsePassword(password), 10)
  };
  return newUser;
};

type CredentialFields = { username: unknown, password: unknown };

export const toCredentials = ({ username, password} : CredentialFields) : Credentials => {
  const credentials: Credentials = {
    username: parseUsername(username),
    password: parsePassword(password),
  };
  return credentials;
};