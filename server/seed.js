require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Inline models to avoid dependency issues
const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: { type: String, default: 'volunteer' }, skills: [String],
  location: { city: String, state: String },
  availability: String, bio: String, orgId: mongoose.Schema.Types.ObjectId,
  isActive: { type: Boolean, default: true }, isVerified: { type: Boolean, default: true },
  tasksCompleted: { type: Number, default: 0 }, hoursContributed: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true })

const orgSchema = new mongoose.Schema({
  name: String, email: String, description: String, category: String,
  location: { city: String, state: String }, adminIds: [mongoose.Schema.Types.ObjectId],
  isApproved: { type: Boolean, default: false }, isActive: { type: Boolean, default: true },
  volunteersCount: { type: Number, default: 0 }, tasksPosted: { type: Number, default: 0 }
}, { timestamps: true })

const taskSchema = new mongoose.Schema({
  title: String, description: String, orgId: mongoose.Schema.Types.ObjectId,
  createdBy: mongoose.Schema.Types.ObjectId, skillsRequired: [String],
  location: { city: String, state: String }, urgencyLevel: Number,
  status: { type: String, default: 'open' }, category: String,
  deadline: Date, maxVolunteers: Number, assignedVolunteers: [],
  applicants: [], hoursEstimated: Number
}, { timestamps: true })

const needSchema = new mongoose.Schema({
  title: String, description: String, orgId: mongoose.Schema.Types.ObjectId,
  createdBy: mongoose.Schema.Types.ObjectId, category: String,
  location: { city: String, state: String }, priorityScore: Number,
  affectedPeople: Number, status: { type: String, default: 'active' }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)
const Org = mongoose.model('Org', orgSchema)
const Task = mongoose.model('Task', taskSchema)
const Need = mongoose.model('Need', needSchema)

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  // Clear existing data
  await Promise.all([User.deleteMany(), Org.deleteMany(), Task.deleteMany(), Need.deleteMany()])
  console.log('Cleared existing data')

  const hash = await bcrypt.hash('demo1234', 12)

  // Super admin
  const admin = await User.create({
    name: 'Platform Admin', email: 'admin@demo.com', password: hash,
    role: 'super_admin', isVerified: true,
    location: { city: 'Kolkata', state: 'West Bengal' }
  })

  // NGO + admin
  const ngoAdmin = await User.create({
    name: 'Priya Sharma', email: 'ngo@demo.com', password: hash,
    role: 'ngo_admin', isVerified: true,
    location: { city: 'Kolkata', state: 'West Bengal' }
  })

  const org = await Org.create({
    name: 'Kolkata Community Foundation', email: 'ngo@demo.com',
    description: 'Empowering underserved communities in West Bengal through education, health, and sustainable livelihoods.',
    category: 'education', isApproved: true,
    location: { city: 'Kolkata', state: 'West Bengal' },
    adminIds: [ngoAdmin._id], volunteersCount: 12, tasksPosted: 8
  })
  ngoAdmin.orgId = org._id
  await ngoAdmin.save()

  // Second org (pending)
  const ngoAdmin2 = await User.create({
    name: 'Rahul Bose', email: 'ngo2@demo.com', password: hash,
    role: 'ngo_admin', isVerified: true,
    location: { city: 'Howrah', state: 'West Bengal' }
  })
  const org2 = await Org.create({
    name: 'Howrah Health Initiative', email: 'ngo2@demo.com',
    description: 'Providing free healthcare services and medical camps to rural areas near Howrah.',
    category: 'health', isApproved: false,
    location: { city: 'Howrah', state: 'West Bengal' },
    adminIds: [ngoAdmin2._id]
  })
  ngoAdmin2.orgId = org2._id
  await ngoAdmin2.save()

  // Volunteers
  const volunteerData = [
    { name: 'Anika Das', email: 'volunteer@demo.com', skills: ['Teaching', 'Counseling'], availability: 'part_time', location: { city: 'Kolkata', state: 'West Bengal' }, tasksCompleted: 7, hoursContributed: 34, bio: 'Passionate about education and community upliftment.' },
    { name: 'Sourav Ghosh', email: 'v2@demo.com', skills: ['Healthcare', 'First Aid', 'Driving'], availability: 'weekends', location: { city: 'Kolkata', state: 'West Bengal' }, tasksCompleted: 12, hoursContributed: 56 },
    { name: 'Meera Patel', email: 'v3@demo.com', skills: ['IT/Tech', 'Media', 'Social Work'], availability: 'on_demand', location: { city: 'Kolkata', state: 'West Bengal' }, tasksCompleted: 4, hoursContributed: 18 },
    { name: 'Arjun Mehta', email: 'v4@demo.com', skills: ['Construction', 'Logistics'], availability: 'full_time', location: { city: 'Howrah', state: 'West Bengal' }, tasksCompleted: 19, hoursContributed: 98 },
    { name: 'Tanisha Roy', email: 'v5@demo.com', skills: ['Legal', 'Finance', 'Teaching'], availability: 'part_time', location: { city: 'Kolkata', state: 'West Bengal' }, tasksCompleted: 8, hoursContributed: 41 },
  ]

  const volunteers = []
  for (const v of volunteerData) {
    volunteers.push(await User.create({ ...v, password: hash, role: 'volunteer', isVerified: true }))
  }

  // Tasks
  const tasksData = [
    {
      title: 'Teach basic numeracy to 15 children in Sundarbans',
      description: 'Volunteer teachers needed to deliver 2-week foundational numeracy curriculum to primary school children. Materials provided.',
      category: 'education', urgencyLevel: 5, skillsRequired: ['Teaching'],
      location: { city: 'Sundarbans', state: 'West Bengal' }, maxVolunteers: 3,
      hoursEstimated: 40, deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Run free health camp at Baruipur block',
      description: 'Assist in organizing a one-day health camp offering basic checkups, BP monitoring, and medicine distribution to 200+ villagers.',
      category: 'health', urgencyLevel: 4, skillsRequired: ['Healthcare', 'First Aid'],
      location: { city: 'Baruipur', state: 'West Bengal' }, maxVolunteers: 5,
      hoursEstimated: 8, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Set up IT lab at community center',
      description: 'Help install and configure 10 donated computers, basic networking, and train a local coordinator to maintain the lab.',
      category: 'education', urgencyLevel: 3, skillsRequired: ['IT/Tech'],
      location: { city: 'Kolkata', state: 'West Bengal' }, maxVolunteers: 2,
      hoursEstimated: 12
    },
    {
      title: 'Distribute relief supplies after flooding in North Bengal',
      description: 'Assist ground team in sorting, packing, and distributing flood relief kits to 500 affected families in Jalpaiguri district.',
      category: 'disaster_relief', urgencyLevel: 5, skillsRequired: ['Logistics', 'Driving'],
      location: { city: 'Jalpaiguri', state: 'West Bengal' }, maxVolunteers: 8,
      hoursEstimated: 24, deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Document and photograph community kitchen operations',
      description: 'Create a photo and video documentary of our community kitchen serving 300 meals/day. Content for annual report and donor outreach.',
      category: 'poverty', urgencyLevel: 2, skillsRequired: ['Media'],
      location: { city: 'Kolkata', state: 'West Bengal' }, maxVolunteers: 1,
      hoursEstimated: 6
    },
    {
      title: 'Legal aid clinic for migrant workers',
      description: 'Assist lawyers in conducting a 2-day free legal aid camp for migrant workers seeking documentation and employment rights guidance.',
      category: 'other', urgencyLevel: 4, skillsRequired: ['Legal'],
      location: { city: 'Kolkata', state: 'West Bengal' }, maxVolunteers: 4,
      hoursEstimated: 16, deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    },
  ]

  for (const t of tasksData) {
    await Task.create({ ...t, orgId: org._id, createdBy: ngoAdmin._id })
  }

  // Needs
  const needsData = [
    { title: 'Clean drinking water shortage', description: 'Over 400 households in Block 7 have no access to safe drinking water. Borewells contaminated.', category: 'health', priorityScore: 95, affectedPeople: 1800, location: { city: 'Basirhat', state: 'West Bengal' } },
    { title: 'No schoolteachers for Grades 4-7', description: 'Local government school has been without qualified teachers for Grades 4-7 for 8 months due to transfers.', category: 'education', priorityScore: 82, affectedPeople: 280, location: { city: 'Namkhana', state: 'West Bengal' } },
    { title: 'Malnutrition in tribal belt', description: 'Survey of 60 tribal households revealed 43% of children under 5 showing signs of moderate malnutrition.', category: 'health', priorityScore: 88, affectedPeople: 340, location: { city: 'Purulia', state: 'West Bengal' } },
    { title: 'Unemployment among youth post-flood', description: '200+ young adults lost livelihoods in October flooding. Need vocational training and employment linkage.', category: 'poverty', priorityScore: 70, affectedPeople: 210, location: { city: 'Cooch Behar', state: 'West Bengal' } },
    { title: 'Sanitation facilities at transit camp', description: '800 displaced persons at the transit camp have only 3 working toilets. Severe sanitation crisis developing.', category: 'health', priorityScore: 91, affectedPeople: 800, location: { city: 'Murshidabad', state: 'West Bengal' } },
  ]

  for (const n of needsData) {
    await Need.create({ ...n, orgId: org._id, createdBy: ngoAdmin._id })
  }

  console.log('\n✅ Seed complete!')
  console.log('─────────────────────────────────')
  console.log('Demo accounts (password: demo1234)')
  console.log('  volunteer@demo.com  → Volunteer dashboard')
  console.log('  ngo@demo.com        → NGO admin dashboard')
  console.log('  admin@demo.com      → Super admin panel')
  console.log('─────────────────────────────────')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
