import Mongoose from 'mongoose';
import { ReturnedCourse } from '../types';

const courseSchema = new Mongoose.Schema({
  name: String,
  code: String,
  ects: Number,
  year: Number,
  startPeriod: Number,
  endPeriod: Number,
});

courseSchema.set('toJSON', {
  transform: (_document, returnedObject: ReturnedCourse) => {
    returnedObject.id = returnedObject._id?.toString() as string;
    delete returnedObject._id;
    delete returnedObject._v;
  },
});

export default Mongoose.model('Course', courseSchema);
