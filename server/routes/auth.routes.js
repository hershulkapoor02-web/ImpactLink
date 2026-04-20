const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Org = require('../models/Org');
const { protect } = require('../middleware/auth');
const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, orgName, orgEmail } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: role || 'volunteer' });

    if (role === 'ngo_admin' && orgName) {
      const org = await Org.create({ name: orgName, email: orgEmail || email, adminIds: [user._id] });
      user.orgId = org._id;
      await user.save();
    }

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: user.toPublic() });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = generateToken(user._id);
    res.json({ success: true, token, user: user.toPublic() });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('orgId', 'name logo isApproved');
  res.json({ success: true, user: user.toPublic() });
});

// PUT /api/auth/updateprofile
router.put('/updateprofile', protect, async (req, res, next) => {
  try {
    const fields = ['name', 'bio', 'skills', 'availability', 'location', 'avatar'];
    const updates = {};
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user: user.toPublic() });
  } catch (err) { next(err); }
});

module.exports = router;
