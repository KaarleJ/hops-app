import user from "../models/user";

const resolvers = {
  Query: {
    userCount: async () => {
      await user.collection.countDocuments();
    }
  }
};

export default resolvers;