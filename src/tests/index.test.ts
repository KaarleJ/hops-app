import typeDefs from "../apolloSchema/typeDefs";
import resolvers from "../apolloSchema/resolvers";
import User from "../models/user";
import Course from "../models/course";
import { SentUser, ReturnedCourse, UserType } from "../types";
import { ApolloServer } from "@apollo/server";
import mongoose from "mongoose";
import * as dotenv from 'dotenv';
import assert from "assert";
dotenv.config();

const TEST_MONGODB_URI=process.env.TEST_MONGODB_URI as string;

mongoose
  .connect(TEST_MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });


describe('Queries and Mutations:', () => {
  beforeAll(async () => {
    await User.deleteMany({});
    await Course.deleteMany({});
  });
  const testServer = new ApolloServer({
    typeDefs,
    resolvers
  });

  let contextId = "";

  it('User can signup', async () => {
    const response = await testServer.executeOperation({
      query: 'mutation createUser($username: String!, $name: String!, $password: String! ) { createUser(username: $username, name: $name, password: $password) { id name username} }',
      variables: { username: 'HopTester', name: 'Hop Tester', password: 'HopsApp123' }
    });
    
    assert(response.body.kind === 'single')

    const data = response.body.singleResult.data?.createUser as SentUser;

    expect(data).toHaveProperty('username', 'HopTester')
    expect(data).toHaveProperty('name', 'Hop Tester')
    expect(data).toHaveProperty('id')
    expect(data).not.toHaveProperty('password')

    contextId=data.id;
  });

  it('User can login', async () => {
    const response = await testServer.executeOperation({
      query: 'mutation authenticate($username: String!, $password: String! ) { authenticate(username: $username, password: $password) { value } }',
      variables: { username: 'HopTester', password: 'HopsApp123' }
    });

    assert(response.body.kind === 'single')
    expect(response.body.singleResult.data?.authenticate).toHaveProperty('value')
  });

  it('Login will fail with wrong password', async () => {
    const response = await testServer.executeOperation({
      query: 'mutation authenticate($username: String!, $password: String! ) { authenticate(username: $username, password: $password) { value } }',
      variables: { username: 'HopTester', password: 'HopsApp12' }
    });

    assert(response.body.kind === 'single')
    expect(response.body.singleResult.errors).toHaveLength(1);
  });

  it('Signup will fail with duplicate username', async () => {
    const response = await testServer.executeOperation({
      query: 'mutation createUser($username: String!, $name: String!, $password: String! ) { createUser(username: $username, name: $name, password: $password) { id name username} }',
      variables: { username: 'HopTester', name: 'Hop Tester', password: 'HopsApp123' }
    });
    
    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toHaveLength(1);
  });

  it('Signup will fail with wrong variable type', async () => {
    const response = await testServer.executeOperation({
      query: 'mutation createUser($username: String!, $name: String!, $password: String! ) { createUser(username: $username, name: $name, password: $password) { id name username} }',
      variables: { username: 'InvalidUser', name: 2, password: 'Invalid123' }
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toHaveLength(1);
  });

  it('Course can be added', async () => {
    const response = await testServer.executeOperation({
      query: 'mutation addCourse($name: String!, $code: String!, $ects: Int!, $year: Int!, $startPeriod: Int!, $endPeriod: Int!) { addCourse(name: $name, code: $code, ects: $ects, year: $year, startPeriod: $startPeriod, endPeriod: $endPeriod) { id name startPeriod year id endPeriod ects code} }',
      variables: { name: "TestCourse", code: "TC", ects: 3, year: 2023, startPeriod: 3, endPeriod: 4 }
    },
    {
      contextValue: {
        currentUser: {
          id: contextId
        }
      }
    });
    assert(response.body.kind === 'single');

    const data =  response.body.singleResult.data?.addCourse as ReturnedCourse;
    

    expect(data).toHaveProperty('name', 'TestCourse')
    expect(data).toHaveProperty('code', 'TC')
    expect(data).toHaveProperty('ects', 3)
    expect(data).toHaveProperty('year', 2023)
    expect(data).toHaveProperty('startPeriod', 3)
    expect(data).toHaveProperty('endPeriod', 4)
    expect(data).toHaveProperty('id')
  });

  it('Courseaddition will fail with invalid variable type', async () => {
    const response = await testServer.executeOperation({
      query: 'mutation addCourse($name: String!, $code: String!, $ects: Int!, $year: Int!, $startPeriod: Int!, $endPeriod: Int!) { addCourse(name: $name, code: $code, ects: $ects, year: $year, startPeriod: $startPeriod, endPeriod: $endPeriod) { id name startPeriod year id endPeriod ects code} }',
      variables: { name: "TestCourse", code: "TC", ects: "3", year: 2023, startPeriod: 3, endPeriod: 4 }
    },
    {
      contextValue: {
        currentUser: {
          id: contextId
        }
      }
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toHaveLength(1);
  });

  it('Course can be removed', async () => {
    const initialResponse = await testServer.executeOperation({
      query: 'mutation addCourse($name: String!, $code: String!, $ects: Int!, $year: Int!, $startPeriod: Int!, $endPeriod: Int!) { addCourse(name: $name, code: $code, ects: $ects, year: $year, startPeriod: $startPeriod, endPeriod: $endPeriod) { id name startPeriod year id endPeriod ects code} }',
      variables: { name: "TestCourse", code: "TC", ects: 3, year: 2023, startPeriod: 3, endPeriod: 4 }
    },
    {
      contextValue: {
        currentUser: {
          id: contextId
        }
      }
    });

    assert(initialResponse.body.kind === 'single');

    const { id } = initialResponse.body.singleResult.data?.addCourse as ReturnedCourse;

    const response = await testServer.executeOperation({
      query: 'mutation removeCourse($removeCourseId: String!) { removeCourse(id: $removeCourseId) { id name username courses { code ects endPeriod id name startPeriod year} } }',
      variables: { removeCourseId: id }
    },
    {
      contextValue: {
        currentUser: {
          id: contextId
        }
      }
    }
    );
    
    assert(response.body.kind === 'single');

    const data = response.body.singleResult.data?.removeCourse as UserType;

    expect(data.courses).toHaveLength(1);
  })

  it('Me query returns the right values', async () => {
    const response = await testServer.executeOperation({
      query: 'query Me { Me { id name username courses { code ects endPeriod id name startPeriod year} } }',
    },
    {
      contextValue: {
        currentUser: {
          id: contextId
        }
      }
    }
    );
    
    assert(response.body.kind === 'single');

    const data = response.body.singleResult.data?.Me as Omit<UserType, 'passwordHash'>;

    expect(data.name).toBe('Hop Tester');
    expect(data.username).toBe('HopTester');
    expect(data.id).toBe(contextId);
    expect(data.courses).toHaveLength(1);
  });

  it('Courses query returns the right courses', async () => {
    const response = await testServer.executeOperation({
      query: 'query Courses($year: String!) {courses(year: $year) { code ects endPeriod id name startPeriod year} }',
      variables: { year: "2023"}
    },
    {
      contextValue: {
        currentUser: {
          id: contextId
        }
      }
    }
    );
    
    
    assert(response.body.kind === 'single');

    const data = response.body.singleResult.data?.courses as [ReturnedCourse];
    

    expect(data).toHaveLength(1);
    expect(Number(data[0].year)).toBe(2023)
  });
});