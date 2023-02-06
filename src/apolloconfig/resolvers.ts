import User from "../models/user";
import { UserInputError } from 'apollo-server';
import { toUser, toCredentials } from "../utils";
import { UserType, EncodedUser } from "../types";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

const resolvers = {
  Query: {
    userCount: async () => {
      await User.collection.countDocuments();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Me: async (_root: unknown, _args: unknown, context: any ) => {
      const id = context.currentUser ? context.currentUser.id as string: null;
      console.log(context);
      
      if (!id) {
        throw new UserInputError('No authentication');
      }
      const user = await User.findById(id);
      return user;
    }
  },
  Mutation: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createUser: async (_root: unknown, args: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const newUser = await toUser(args);
      const user = new User(newUser);
      try {
        await user.save();
      } catch(error: unknown) {
        if (error instanceof Error) {
          throw new UserInputError(error.message, {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            invalidArgs: args
          });
        }
      }
      return user;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authenticate: async (_root: unknown, args: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const credentials = toCredentials(args);
      const user = await User.findOne<UserType>({ username: credentials.username});
      if (!user) {
        throw new UserInputError('No user with specified username');
      }
      if (! await bcrypt.compare(credentials.password, user.passwordHash)) {
        throw new UserInputError('Password is incorrect');
      }
      const userForToken: EncodedUser = {
        username: user.username,
        id: user.id
      };

      return { value: jwt.sign(userForToken, JWT_SECRET)};
    }
  }
};

export default resolvers;