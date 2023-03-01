import typeDefs from '../apolloSchema/typeDefs';
import resolvers from '../apolloSchema/resolvers';
import {
  SentUser,
  UserType,
  ReturnedCourse,
  Course as CourseType,
} from '../types';
import { ApolloServer } from '@apollo/server';
import assert from 'assert';
import helper from './test_helper';
import { ADD_COURSE, AUTHENTICATE, REMOVE_COURSE, EDIT_COURSE, SIGNUP } from './testSchema';
import User from '../models/User';
import Course from '../models/Course';

describe('Mutations', () => {
  const testServer = new ApolloServer({
    typeDefs,
    resolvers,
  });
  beforeAll(async () => {
    await helper.empty();
  });

  it('User can signup', async () => {
    const response = await testServer.executeOperation({
      query: SIGNUP,
      variables: {
        username: 'HopTester',
        name: 'Hop Tester',
        password: 'HopsApp123',
      },
    });

    assert(response.body.kind === 'single');

    const data = response.body.singleResult.data?.createUser as SentUser;
    expect(data).toHaveProperty('username', 'HopTester');
    expect(data).toHaveProperty('name', 'Hop Tester');
    expect(data).toHaveProperty('id');
    expect(data).not.toHaveProperty('password');
  });

  it('User can login', async () => {
    const response = await testServer.executeOperation({
      query: AUTHENTICATE,
      variables: { username: 'HopTester', password: 'HopsApp123' },
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.data?.authenticate).toHaveProperty(
      'value'
    );
  });

  it('Login will fail with wrong password', async () => {
    const response = await testServer.executeOperation({
      query: AUTHENTICATE,
      variables: { username: 'HopTester', password: 'HopsApp12' },
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toHaveLength(1);
  });

  it('Signup will fail with duplicate username', async () => {
    const response = await testServer.executeOperation({
      query: SIGNUP,
      variables: {
        username: 'HopTester',
        name: 'Hop Tester',
        password: 'HopsApp123',
      },
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toHaveLength(1);
  });

  it('Signup will fail with wrong variable type', async () => {
    const response = await testServer.executeOperation({
      query: SIGNUP,
      variables: {
        username: 'InvalidUser',
        name: 21415,
        password: 'Invalid123',
      },
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toHaveLength(1);
  });

  it('Course can be added', async () => {
    const user = (await User.findOne({
      username: 'HopTester',
    })) as unknown as UserType;
    const response = await testServer.executeOperation(
      {
        query: ADD_COURSE,
        variables: {
          name: 'TestCourse',
          code: 'TC',
          ects: 3,
          year: 2023,
          startPeriod: 3,
          endPeriod: 4,
        },
      },
      {
        contextValue: {
          currentUser: {
            id: user.id,
          },
        },
      }
    );
    assert(response.body.kind === 'single');

    const data = response.body.singleResult.data?.addCourse as ReturnedCourse;
    const newUser = (await User.findOne({
      username: 'HopTester',
    })) as unknown as UserType;

    expect(data).toHaveProperty('name', 'TestCourse');
    expect(data).toHaveProperty('code', 'TC');
    expect(data).toHaveProperty('ects', 3);
    expect(data).toHaveProperty('year', 2023);
    expect(data).toHaveProperty('startPeriod', 3);
    expect(data).toHaveProperty('endPeriod', 4);
    expect(data).toHaveProperty('id');
    expect(newUser.courses).toHaveLength(1);
  });
});

describe('Mutations with seed data', () => {
  const testServer = new ApolloServer({
    typeDefs,
    resolvers,
  });
  beforeAll(async () => {
    await helper.empty();
    await helper.populate();
    await helper.populateCourses('Tester1');
    await helper.populateCourses('Tester2');
    await helper.populateCourses('Tester3');
  });

  it('Courses can be removed', async () => {
    const course = (await Course.findOne({
      name: 'Tester1TestCourse1',
    })) as unknown as CourseType;
    const user = (await User.findOne({
      username: 'Tester1',
    })) as unknown as UserType;
    const response = await testServer.executeOperation(
      {
        query: REMOVE_COURSE,
        variables: {
          removeCourseId: course.id,
        },
      },
      {
        contextValue: {
          currentUser: {
            id: user.id,
          },
        },
      }
    );

    assert(response.body.kind === 'single');

    const data = response.body.singleResult.data?.removeCourse as UserType;
    const newUser = (await User.findOne({
      username: 'Tester1',
    })) as unknown as UserType;

    expect(data.courses).toHaveLength(2);
    expect(newUser.courses.length).toBe(user.courses.length - 1);
  });

  it('Courses can be edited', async () => {
    const course = (await Course.findOne({
      name: 'Tester2TestCourse1',
    })) as unknown as CourseType;
    const user = (await User.findOne({
      username: 'Tester2',
    })) as unknown as UserType;
    const response = await testServer.executeOperation(
      {
        query: EDIT_COURSE,
        variables: {
          editCourseId: course.id,
          name: 'Tester2TestCourse1',
          code: 'TEST2revised',
          ects: 8,
          year: 2023,
          endPeriod: 2,
          startPeriod: 2
        },
      },
      {
        contextValue: {
          currentUser: {
            id: user.id,
          },
        },
      }
    );

    assert(response.body.kind === 'single');

    const data = response.body.singleResult.data?.editCourse as CourseType;
    const newCourse = await Course.findOne({ name: 'Tester2TestCourse1' }) as unknown as CourseType;

    expect(data.name).toBe(newCourse.name);
    expect(data.code).toBe(newCourse.code);
    expect(data.ects).toBe(newCourse.ects);
    expect(data.year).toBe(2023);
    expect(data.endPeriod).toBe(2);
    expect(data.startPeriod).toBe(2);

  });
});
