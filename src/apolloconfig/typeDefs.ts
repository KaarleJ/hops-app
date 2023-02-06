import { gql } from 'apollo-server';

const typeDefs = gql`
  type User {
    username: String!
    name: String!
    courses: [Course!]!
    id: String!
  }

  type Token {
    value: String
  }

  type Course {
    name: String!
    code: String!
    id: String
    ects: Int
    year: Int
    startPeriod: Int
    endPeriod: Int
  }

  type Query {
    userCount: Int!
    Me: User!
  }

  type Mutation {
    createUser(
      username: String!
      name: String!
      password: String!
    ): User

    addCourse(
      name: String!
      code: String!
      ects: Int
      year: Int
      startPeriod: Int
      endPeriod: Int
    ): Course

    authenticate(
      username: String!
      password: String!
    ): Token
  }
`;

export default typeDefs;