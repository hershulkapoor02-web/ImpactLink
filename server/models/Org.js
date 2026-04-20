const mongoose = require('mongoose');

const orgSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  logo: { type: String, default: '' },
  website: { type: String, default: '' },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  category: { type: String, enum: ['education', 'health', 'environment', 'poverty', 'disaster_relief', 'other'], default: 'other' },
  adminIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  volunteersCount: { type: Number, default: 0 },
  tasksPosted: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Org', orgSchema);
