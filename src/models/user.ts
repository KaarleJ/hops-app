import Mongoose from 'mongoose';
import { ReturnedUser } from '../types';

const userSchema = new Mongoose.Schema({
  username: { type: String, minlength: 3},
  name: { type: String, minlength: 4},
  password: { type: String, minlength: 8},
});

userSchema.set('toJSON', {
  transform: (_document, returnedObject: ReturnedUser) => {
    returnedObject.id = returnedObject._id?.toString() as string;
    delete returnedObject._id;
    delete returnedObject._v;
    delete returnedObject.password;
  }
});

export default Mongoose.model('User', userSchema);