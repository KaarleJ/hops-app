import User from '../models/User';
import Course from '../models/Course';
import bcrypt from 'bcrypt';
import { UserType, Course as CourseType, NewCourse } from '../types';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI as string;

mongoose
  .connect(TEST_MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const initialUsers: Omit<UserType, 'id'>[] = [
  {
    username: 'Tester1',
    name: 'Tester One',
    courses: [],
    passwordHash: 'Tester123',
  },
  {
    username: 'Tester2',
    name: 'Tester Two',
    courses: [],
    passwordHash: 'Tester234',
  },
  {
    username: 'Tester3',
    name: 'Tester Three',
    courses: [],
    passwordHash: 'Tester345',
  },
];

const rawTestCourses: NewCourse[] = [
  {
    name: 'TestCourse1',
    code: 'TEST1',
    ects: 5,
    year: 2023,
    startPeriod: 0,
    endPeriod: 0,
  },
  {
    name: 'TestCourse2',
    code: 'TEST2',
    ects: 5,
    year: 2023,
    startPeriod: 1,
    endPeriod: 1,
  },
  {
    name: 'TestCourse3',
    code: 'TEST3',
    ects: 5,
    year: 2023,
    startPeriod: 2,
    endPeriod: 2,
  },
];

const hashPasswords = async () => {
  for (const user of initialUsers) {
    user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
  }
};

hashPasswords()
  .then(() => {
    console.log('Passwords hashed');
  })
  .catch((error) => {
    console.log('An error occurred while hashing passwords', error);
  });

const usersInDB = async () => {
  const users = (await User.find({}).populate(
    'courses'
  )) as unknown as UserType[];
  return users;
};

const coursesInDB = async () => {
  const courses = (await Course.find({})) as unknown as CourseType[];
  return courses;
};

const empty = async () => {
  await Course.deleteMany({});
  await User.deleteMany({});
};

const populate = async () => {
  await User.insertMany(initialUsers);
};

const populateCourses = async (username: string) => {
  const user = await User.findOne({ username: username });
  if (!user) {
    throw new Error('Error while testing. No user with specified username.');
  }
  const testCourses = rawTestCourses.map((course) => ({
    ...course,
    name: username + course.name,
  }));
  const course1 = new Course(testCourses[0]);
  const course2 = new Course(testCourses[1]);
  const course3 = new Course(testCourses[2]);
  const retCourse1 = (await course1.save()) as unknown as CourseType;
  const retCourse2 = (await course2.save()) as unknown as CourseType;
  const retCourse3 = (await course3.save()) as unknown as CourseType;
  user.courses = user.courses.concat([
    retCourse1.id as unknown as mongoose.Types.ObjectId,
    retCourse2.id as unknown as mongoose.Types.ObjectId,
    retCourse3.id as unknown as mongoose.Types.ObjectId,
  ]);
  await user.save();
};

export default {
  empty,
  populate,
  populateCourses,
  usersInDB,
  coursesInDB,
  initialUsers,
};
