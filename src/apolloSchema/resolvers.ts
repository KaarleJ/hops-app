import User from '../models/User';
import Course from '../models/Course';
import { UserInputError } from 'apollo-server';
import { toUser, toCredentials, toCourse, parseString } from '../utils';
import { UserType, EncodedUser } from '../types';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Course as course } from '../types';
import mongoose from 'mongoose';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

const resolvers = {
  Query: {
    userCount: async () => {
      return await User.collection.countDocuments();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Me: async (_root: unknown, _args: unknown, context: any) => {
      const id = context.currentUser
        ? (context.currentUser.id as string)
        : null;
      if (!id) {
        throw new UserInputError('No authentication');
      }
      const user = await User.findById(id).populate('courses');
      return user;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    courses: async (_root: unknown, args: any, context: any) => {
      const id = context.currentUser
        ? (context.currentUser.id as string)
        : null;
      if (!id) {
        throw new UserInputError('No authentication');
      }
      const user = (await User.findById(id).populate('courses')) as UserType;
      if (!user) {
        throw new UserInputError('No user with given token');
      }
      if (!args.year) {
        throw new UserInputError('Year cannot be null');
      }
      const returnedCourses = user.courses as [course];
      const courses = returnedCourses.filter(
        (course) => course.year === Number(args.year)
      );
      return courses;
    },
  },
  Mutation: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createUser: async (_root: unknown, args: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const newUser = await toUser(args);
      const user = new User(newUser);
      try {
        if (await User.findOne({ username: user.username })) {
          throw new UserInputError('Username already taken');
        }
        await user.save();
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new UserInputError(error.message, {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            invalidArgs: args,
          });
        }
      }
      return user;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authenticate: async (_root: unknown, args: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const credentials = toCredentials(args);
      const user = await User.findOne<UserType>({
        username: credentials.username,
      });

      if (!user) {
        throw new UserInputError('No user with specified username');
      }

      if (!(await bcrypt.compare(credentials.password, user.passwordHash))) {
        throw new UserInputError('Password is incorrect');
      }

      const userForToken: EncodedUser = {
        username: user.username,
        id: user.id,
      };

      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addCourse: async (_root: unknown, args: any, context: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const newCourse = toCourse(args);
      const course = new Course(newCourse);
      const returnedCourse = (await course.save()) as course;
      const id = context.currentUser
        ? (context.currentUser.id as string)
        : null;

      if (!id) {
        throw new UserInputError('No authentication');
      }

      const user = await User.findById(id);

      if (!user) {
        throw new UserInputError('No user with specified token');
      }

      user.courses = user.courses.concat(
        returnedCourse.id as unknown as mongoose.Types.ObjectId
      );

      try {
        await user.save();
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new UserInputError(error.message, {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            invalidArgs: args,
          });
        }
      }

      return course;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeCourse: async (_root: unknown, args: any, context: any) => {
      const id = context.currentUser
        ? (context.currentUser.id as string)
        : null;
      const courseId = parseString(args.id, 'courseId');

      if (!id) {
        throw new UserInputError('No authentication');
      }

      const user = await User.findById(id).populate('courses');

      if (!user) {
        throw new UserInputError('No user with specified token');
      }

      user.courses = user.courses.filter(
        (course) => course._id.toString() !== courseId
      );
      await Course.findByIdAndDelete(courseId);

      try {
        await user.save();
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new UserInputError(error.message, {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            invalidArgs: args,
          });
        }
      }

      return user;
    },
  },
};

export default resolvers;
