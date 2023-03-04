import User from './models/User';
import { EncodedUser } from './types';
import typeDefs from './apolloSchema/typeDefs';
import resolvers from './apolloSchema/resolvers';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import cors from 'cors';
import { makeExecutableSchema } from '@graphql-tools/schema';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import path from 'path';
import * as dotenv from 'dotenv';
import Course from './models/Course';
dotenv.config();

const MONGODB_URI = process.env.TS_NODE_DEV ? process.env.TEST_MONGODB_URI as string : process.env.MONGODB_URI as string;
const JWT_SECRET = process.env.JWT_SECRET as string;
const PORT = process.env.PORT || ('4000' as string);

console.log('connecting to', MONGODB_URI);
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const start = async () => {
  const app = express();
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : '';
      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        try {
          const decodedToken = jwt.verify(
            auth.substring(7),
            JWT_SECRET
          ) as EncodedUser;
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
    },
  });

  await server.start();

  server.applyMiddleware({ app });
  app.use(cors());
  app.use(express.static('build'));
  app.use(express.json());

  app.get('/*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'), (error) => {
      if (error) {
        res.status(500).send(error);
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    });
  });

  app.post('/api/testing/reset', (_req, res) => {
    if (process.env.TS_NODE_DEV) {
      const empty = async () => {
        await Course.deleteMany({});
        await User.deleteMany({});
      };
      empty().then(() => {
        console.log('Emptied database');
      }).catch((e) => {
        console.log(e);
      });
      res.status(204).end();
    } else {
      res.end(404);
    }
  });

  app.listen({ port: PORT }, () => {
    console.log(
      `Apollo server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
};

void start();
