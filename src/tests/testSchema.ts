import { gql } from 'apollo-server-express';

export const USER_COUNT = gql`
  query UserCount {
    userCount
  }
`;

export const SIGNUP = gql`
  mutation CreateUser($username: String!, $name: String!, $password: String!) {
    createUser(username: $username, name: $name, password: $password) {
      id
      name
      username
    }
  }
`;

export const AUTHENTICATE = gql`
  mutation Authenticate($username: String!, $password: String!) {
    authenticate(username: $username, password: $password) {
      value
    }
  }
`;

export const ADD_COURSE = gql`
  mutation AddCourse(
    $name: String!
    $code: String!
    $ects: Int!
    $year: Int!
    $startPeriod: Int!
    $endPeriod: Int!
  ) {
    addCourse(
      name: $name
      code: $code
      ects: $ects
      year: $year
      startPeriod: $startPeriod
      endPeriod: $endPeriod
    ) {
      code
      ects
      endPeriod
      id
      name
      startPeriod
      year
    }
  }
`;

export const REMOVE_COURSE = gql`
  mutation RemoveCourse($removeCourseId: String!) {
    removeCourse(id: $removeCourseId) {
      id
      name
      username
      courses {
        code
        ects
        endPeriod
        id
        name
        startPeriod
        year
      }
    }
  }
`;

export const EDIT_COURSE = gql`
  mutation EditCourse(
    $editCourseId: String!
    $name: String
    $code: String
    $ects: Int
    $year: Int
    $startPeriod: Int
    $endPeriod: Int
  ) {
    editCourse(
      id: $editCourseId
      name: $name
      code: $code
      ects: $ects
      year: $year
      startPeriod: $startPeriod
      endPeriod: $endPeriod
    ) {
      name
      code
      id
      ects
      year
      startPeriod
      endPeriod
    }
  }
`;

export const ME = gql`
  query Me {
    Me {
      courses {
        name
      }
      name
      id
      username
    }
  }
`;
