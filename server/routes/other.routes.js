const express = require('express');
const { Need, Report } = require('../models/Need');
const Org = require('../models/Org');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/auth');

const needRouter = express.Router();
const orgRouter = express.Router();
const userRouter = express.Router();
const notifRouter = express.Router();

// ===== NEEDS =====
needRouter.get('/', protect, async (req, res, next) => {
  try {
    const { category, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    const needs = await Need.find(query)
      .populate('orgId', 'name logo')
      .sort({ priorityScore: -1, createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await Need.countDocuments(query);
    res.json({ success: true, needs, total });
  } catch (err) { next(err); }
});

needRouter.post('/', protect, authorize('ngo_admin', 'super_admin'), async (req, res, next) => {
  try {
    const need = await Need.create({ ...req.body, orgId: req.user.orgId, createdBy: req.user._id });
    res.status(201).json({ success: true, need });
  } catch (err) { next(err); }
});

needRouter.put('/:id', protect, authorize('ngo_admin', 'super_admin'), async (req, res, next) => {
  try {
    const need = await Need.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, need });
  } catch (err) { next(err); }
});

needRouter.delete('/:id', protect, authorize('ngo_admin', 'super_admin'), async (req, res, next) => {
  try {
    await Need.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Need deleted' });
  } catch (err) { next(err); }
});

// ===== ORGS =====
orgRouter.get('/', protect, async (req, res, next) => {
  try {
    const orgs = await Org.find({ isApproved: true, isActive: true }).select('-adminIds');
    res.json({ success: true, orgs });
  } catch (err) { next(err); }
});

orgRouter.get('/mine', protect, authorize('ngo_admin'), async (req, res, next) => {
  try {
    const org = await Org.findById(req.user.orgId).populate('adminIds', 'name email avatar');
    res.json({ success: true, org });
  } catch (err) { next(err); }
});

orgRouter.get('/:id', protect, async (req, res, next) => {
  try {
    const org = await Org.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, message: 'Org not found' });
    res.json({ success: true, org });
  } catch (err) { next(err); }
});

orgRouter.put('/:id', protect, authorize('ngo_admin', 'super_admin'), async (req, res, next) => {
  try {
    const org = await Org.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, org });
  } catch (err) { next(err); }
});

orgRouter.put('/:id/approve', protect, authorize('super_admin'), async (req, res, next) => {
  try {
    const org = await Org.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    const admins = await User.find({ orgId: org._id });
    for (const admin of admins) {
      await Notification.create({ userId: admin._id, type: 'org_approved', title: 'Organization Approved', message: `${org.name} has been approved!` });
    }
    res.json({ success: true, org });
  } catch (err) { next(err); }
});

// ===== USERS =====
userRouter.get('/volunteers', protect, async (req, res, next) => {
  try {
    const { skills, availability, page = 1, limit = 20 } = req.query;
    const query = { role: 'volunteer', isActive: true };
    if (skills) query.skills = { $in: skills.split(',') };
    if (availability) query.availability = availability;
    const users = await User.find(query).select('-password').skip((page-1)*limit).limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total });
  } catch (err) { next(err); }
});

userRouter.get('/leaderboard', protect, async (req, res, next) => {
  try {
    const users = await User.find({ role: 'volunteer' }).select('name avatar tasksCompleted hoursContributed skills').sort({ tasksCompleted: -1, hoursContributed: -1 }).limit(20);
    res.json({ success: true, users });
  } catch (err) { next(err); }
});

userRouter.get('/stats', protect, authorize('super_admin'), async (req, res, next) => {
  try {
    const [totalUsers, totalVolunteers, totalNGOs, totalTasks] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'volunteer' }),
      Org.countDocuments(),
      Task.countDocuments()
    ]);
    const tasksByStatus = await Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const needsByCategory = await Need.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    res.json({ success: true, stats: { totalUsers, totalVolunteers, totalNGOs, totalTasks, tasksByStatus, needsByCategory } });
  } catch (err) { next(err); }
});

// ===== NOTIFICATIONS =====
notifRouter.get('/', protect, async (req, res, next) => {
  try {
    const notifs = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.json({ success: true, notifications: notifs, unreadCount });
  } catch (err) { next(err); }
});

notifRouter.put('/read-all', protect, async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) { next(err); }
});

notifRouter.put('/:id/read', protect, async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = { needRouter, orgRouter, userRouter, notifRouter };
