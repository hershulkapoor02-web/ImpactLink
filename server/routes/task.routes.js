const express = require('express');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/tasks — all open tasks (volunteers browse)
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, category, urgency, search, page = 1, limit = 12 } = req.query;
    const query = {};
    if (status) query.status = status; else query.status = { $ne: 'cancelled' };
    if (category) query.category = category;
    if (urgency) query.urgencyLevel = { $gte: Number(urgency) };
    if (search) query.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(query)
      .populate('orgId', 'name logo category')
      .populate('createdBy', 'name')
      .sort({ urgencyLevel: -1, createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));

    const total = await Task.countDocuments(query);
    res.json({ success: true, tasks, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// GET /api/tasks/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('orgId', 'name logo description email')
      .populate('createdBy', 'name avatar')
      .populate('assignedVolunteers', 'name avatar skills');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) { next(err); }
});

// POST /api/tasks — NGO admin creates task
router.post('/', protect, authorize('ngo_admin', 'super_admin'), async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, orgId: req.user.orgId, createdBy: req.user._id });
    res.status(201).json({ success: true, task });
  } catch (err) { next(err); }
});

// PUT /api/tasks/:id
router.put('/:id', protect, authorize('ngo_admin', 'super_admin'), async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) { next(err); }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, authorize('ngo_admin', 'super_admin'), async (req, res, next) => {
  try {
    await Task.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ success: true, message: 'Task cancelled' });
  } catch (err) { next(err); }
});

// POST /api/tasks/:id/apply — volunteer applies
router.post('/:id/apply', protect, authorize('volunteer'), async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (task.status !== 'open') return res.status(400).json({ success: false, message: 'Task is not open' });

    const alreadyApplied = task.applicants.find(a => a.user.toString() === req.user._id.toString());
    if (alreadyApplied) return res.status(400).json({ success: false, message: 'Already applied' });

    task.applicants.push({ user: req.user._id });
    await task.save();
    res.json({ success: true, message: 'Application submitted' });
  } catch (err) { next(err); }
});

// PUT /api/tasks/:id/applicants/:userId — NGO accepts/rejects
router.put('/:id/applicants/:userId', protect, authorize('ngo_admin', 'super_admin'), async (req, res, next) => {
  try {
    const { status } = req.body; // 'accepted' | 'rejected'
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const applicant = task.applicants.find(a => a.user.toString() === req.params.userId);
    if (!applicant) return res.status(404).json({ success: false, message: 'Applicant not found' });

    applicant.status = status;
    if (status === 'accepted') {
      if (!task.assignedVolunteers.includes(req.params.userId)) {
        task.assignedVolunteers.push(req.params.userId);
      }
      if (task.assignedVolunteers.length >= task.maxVolunteers) task.status = 'in_progress';

      await Notification.create({
        userId: req.params.userId, type: 'task_assigned',
        title: 'Task Assignment', message: `You have been assigned to: ${task.title}`,
        link: `/volunteer/tasks/${task._id}`, relatedId: task._id
      });
    } else {
      await Notification.create({
        userId: req.params.userId, type: 'application_update',
        title: 'Application Update', message: `Your application for "${task.title}" was not accepted.`,
        relatedId: task._id
      });
    }
    await task.save();
    res.json({ success: true, task });
  } catch (err) { next(err); }
});

// GET /api/tasks/org/mine — NGO's own tasks
router.get('/org/mine', protect, authorize('ngo_admin', 'super_admin'), async (req, res, next) => {
  try {
    const tasks = await Task.find({ orgId: req.user.orgId })
      .populate('assignedVolunteers', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) { next(err); }
});

// GET /api/tasks/volunteer/mine — volunteer's applied/assigned tasks
router.get('/volunteer/mine', protect, authorize('volunteer'), async (req, res, next) => {
  try {
    const tasks = await Task.find({
      $or: [
        { assignedVolunteers: req.user._id },
        { 'applicants.user': req.user._id }
      ]
    }).populate('orgId', 'name logo').sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) { next(err); }
});

module.exports = router;
