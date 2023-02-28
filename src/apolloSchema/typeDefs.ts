import { gql } from 'apollo-server';

const typeDefs = gql`
  type User {
    username: String!
    name: String!
    courses: [Course!]!
    id: String!
  }

  type NewUser {
    username: String!
    name: String!
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
    courses(year: String!): [Course!]!
  }

  type Mutation {
    createUser(username: String!, name: String!, password: String!): NewUser

    addCourse(
      name: String!
      code: String!
      ects: Int!
      year: Int!
      startPeriod: Int!
      endPeriod: Int!
    ): Course

    removeCourse(id: String!): User

    authenticate(username: String!, password: String!): Token
  }
`;

export default typeDefs;
