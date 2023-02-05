import { gql } from 'apollo-server';

const typeDefs = gql`
  type User {
    username: String!
    name: String!
  }

  type Token {
    value: String
  }

  type Query {
    userCount: Int!
    me: User
  }

  type Mutation {
    createUser(
      username: String!
      name: String!
      password: String!
    ): User

    authenticate(
      username: String!
      password: String!
    ): Token
  }
`;

export default typeDefs;