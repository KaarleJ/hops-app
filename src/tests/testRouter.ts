import { Router } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import Course from '../models/Course';
import User from '../models/User';
import { Course as course } from '../types';

const testingRouter = Router();

testingRouter.post('/reset', (_req, res) => {
  if (process.env.TS_NODE_DEV) {
    const empty = async () => {
      await Course.deleteMany({});
      await User.deleteMany({});
    };
    empty()
      .then(() => {
        console.log('Emptied database');
      })
      .catch((e) => {
        console.log(e);
      });
    res.status(204).end();
  } else {
    res.end(404);
  }
});

testingRouter.post('/seed', (_req, res) => {
  if (process.env.TS_NODE_DEV) {
    const seed = async () => {
      const user = new User({
        username: 'HopTester',
        name: 'Hop Tester',
        passwordHash: await bcrypt.hash('TesterPassword123!', 10),
      });
      const returnedUser = await user.save();
      const course1 = new Course({
        name: 'TestCourse1',
        code: 'Test1',
        ects: 5,
        year: 2023,
        startPeriod: 1,
        endPeriod: 1,
      });
      const course2 = new Course({
        name: 'TestCourse2',
        code: 'Test2',
        ects: 5,
        year: 2023,
        startPeriod: 2,
        endPeriod: 3,
      });
      const course3 = new Course({
        name: 'TestCourse3',
        code: 'Test3',
        ects: 5,
        year: 2024,
        startPeriod: 1,
        endPeriod: 1,
      });
      const course4 = new Course({
        name: 'TestCourse4',
        code: 'Test4',
        ects: 5,
        year: 2024,
        startPeriod: 0,
        endPeriod: 5,
      });

      const retCourse1 = await course1.save() as course;
      const retCourse2 = await course2.save() as course;
      const retCourse3 = await course3.save() as course;
      const retCourse4 = await course4.save() as course;

      returnedUser.courses = returnedUser.courses.concat([
        retCourse1.id as unknown as mongoose.Types.ObjectId,
        retCourse2.id as unknown as mongoose.Types.ObjectId,
        retCourse3.id as unknown as mongoose.Types.ObjectId,
        retCourse4.id as unknown as mongoose.Types.ObjectId
      ]);
      await returnedUser.save();
    };
    seed()
      .then(() => {
        console.log('Seeded database');
      })
      .catch((e) => {
        console.log(e);
      });
    res.status(204).end();
  } else {
    res.end(404);
  }
});

export default testingRouter;
