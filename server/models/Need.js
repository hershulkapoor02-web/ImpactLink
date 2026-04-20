const mongoose = require('mongoose');

const needSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['education', 'health', 'environment', 'poverty', 'disaster_relief', 'other'], default: 'other' },
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    coordinates: { lat: { type: Number, default: 0 }, lng: { type: Number, default: 0 } }
  },
  priorityScore: { type: Number, default: 0, min: 0, max: 100 },
  affectedPeople: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'in_progress', 'resolved'], default: 'active' },
  reportSource: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null },
  resolvedAt: { type: Date }
}, { timestamps: true });

needSchema.index({ priorityScore: -1, status: 1 });

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, default: 'csv' },
  status: { type: String, enum: ['pending', 'processing', 'processed', 'failed'], default: 'pending' },
  needsExtracted: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, { timestamps: true });

const Need = mongoose.model('Need', needSchema);
const Report = mongoose.model('Report', reportSchema);

module.exports = { Need, Report };
