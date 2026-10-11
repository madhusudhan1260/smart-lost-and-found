// Counter collection: hands out readable, sequential IDs (LF-1013, LF-2014, CL-3008 ...).
// $inc is atomic in MongoDB, so two requests at the same moment never get the same number.
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } }, { versionKey: false });

const Counter = mongoose.model('Counter', counterSchema);

// kind → how the ID is built from the sequence number
const FORMATS = {
  lost: (seq) => `LF-${1000 + seq}`,
  found: (seq) => `LF-${2000 + seq}`,
  claim: (seq) => `CL-${3000 + seq}`,
};

export async function nextId(kind) {
  const counter = await Counter.findOneAndUpdate(
    { _id: kind },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true },
  );
  return FORMATS[kind](counter.seq);
}

export default Counter;
