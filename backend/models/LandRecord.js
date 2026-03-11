import mongoose from 'mongoose';

const landRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true // index for quick retrieval per user
  },
  title: {
    type: String,
    required: true,
    default: "New Land Survey"
  },
  // the ordered array of lat,lng points forming the polygon
  boundary: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }],
  area: {
    sqMeters: { type: Number, required: true },
    sqFt: { type: Number, required: true },
    cents: { type: Number, required: true },
    acres: { type: Number, required: true }
  },
  perimeters: [{
    segment: String,
    meters: Number,
    feet: Number
  }],
  notes: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const LandRecord = mongoose.model('LandRecord', landRecordSchema);

export default LandRecord;
