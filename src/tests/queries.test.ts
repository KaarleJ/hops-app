import typeDefs from '../apolloSchema/typeDefs';
import resolvers from '../apolloSchema/resolvers';
import User from '../models/User';
import { ApolloServer } from '@apollo/server';
import assert from 'assert';
import helper from './test_helper';
import { ME, USER_COUNT } from './testSchema';
import { ReturnedCourse, UserType } from '../types';
import mongoose from 'mongoose';

describe('Queries:', () => {
  beforeAll(async () => {
    await helper.empty();
    await helper.populate();
  });

  const testServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  it('Usercount is correct', async () => {
    const response = await testServer.executeOperation({
      query: USER_COUNT,
    });

    assert(response.body.kind === 'single');
    const data = response.body.singleResult.data?.userCount as number;
    const dbData = await User.collection.countDocuments();
    expect(data).toBe(3);
    expect(data).toBe(dbData);
  });
});

describe('Queries with seed data:', () => {
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

  it('Me query returns the right values', async () => {
    const user = (await User.findOne({
      username: 'Tester1',
    })) as unknown as UserType;
    const response = await testServer.executeOperation(
      {
        query: ME,
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

    const data = response.body.singleResult.data?.Me as Omit<
      UserType,
      'passwordHash'
    >;

    expect(data.name).toBe('Tester One');
    expect(data.username).toBe('Tester1');
    expect(data.id).toBe(user.id);
    expect(data.courses).toHaveLength(3);
    expect(data.courses[0].name).toBe('Tester1TestCourse1');
  });
  it('Courses query returns the right courses', async () => {
    const user = (await User.findOne({
      username: 'Tester1',
    })) as unknown as UserType;
    const response = await testServer.executeOperation(
      {
        query:
          'query Courses($year: String!) {courses(year: $year) { code ects endPeriod id name startPeriod year} }',
        variables: { year: '2023' },
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

    const data = response.body.singleResult.data?.courses as ReturnedCourse[];

    expect(data).toHaveLength(3);
    expect(data[0].name).toBe('Tester1TestCourse1');
    expect(data[1].name).toBe('Tester1TestCourse2');
    expect(data[2].name).toBe('Tester1TestCourse3');
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });
});
