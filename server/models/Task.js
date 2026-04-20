const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillsRequired: [{ type: String }],
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' }
  },
  urgencyLevel: { type: Number, min: 1, max: 5, default: 3 },
  status: { type: String, enum: ['open', 'in_progress', 'completed', 'cancelled'], default: 'open' },
  category: { type: String, enum: ['education', 'health', 'environment', 'poverty', 'disaster_relief', 'other'], default: 'other' },
  deadline: { type: Date },
  maxVolunteers: { type: Number, default: 1 },
  assignedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  applicants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now }
  }],
  hoursEstimated: { type: Number, default: 0 },
  completedAt: { type: Date }
}, { timestamps: true });

taskSchema.index({ status: 1, urgencyLevel: -1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
