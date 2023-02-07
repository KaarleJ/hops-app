import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import { EncodedUser } from "./types";
import typeDefs from './apolloSchema/typeDefs';
import resolvers from './apolloSchema/resolvers';
import User from './models/user';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI =process.env.MONGODB_URI as string;
const JWT_SECRET = process.env.JWT_SECRET as string;


console.log('connecting to', MONGODB_URI);
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });


const server = new ApolloServer({
  typeDefs,
  resolvers
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : "";
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      try {
        const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET) as EncodedUser;
        const currentUser = await User.findById(decodedToken.id);
        if (!currentUser) {
          throw new Error('No user found with decoded token');
        }
        return { currentUser };
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
        return { error: 'Invalid token' };
      }
    } else {
      return { undefined };
    }
  }
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
}).catch(e => {
  console.log(e);
});