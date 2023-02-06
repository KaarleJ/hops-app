import Mongoose from 'mongoose';
import { ReturnedUser } from '../types';

const userSchema = new Mongoose.Schema({
  username: { type: String, minlength: 3},
  name: { type: String, minlength: 4},
  courses: [
    {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }
  ],
  passwordHash: String,

});

userSchema.set('toJSON', {
  transform: (_document, returnedObject: ReturnedUser) => {
    returnedObject.id = returnedObject._id?.toString() as string;
    delete returnedObject._id;
    delete returnedObject._v;
    delete returnedObject.passwordHash;
  }
});

export default Mongoose.model('User', userSchema);