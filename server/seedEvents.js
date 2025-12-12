const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./src/models/Event');

dotenv.config();

const events = [
  {
    title: 'Annual Medical Camp',
    date: new Date('2025-12-12'),
    location: 'Jayness Community Hall',
    category: 'Health',
    description: 'Free checkups, immunizations, deworming, and nutrition education for all community members. We are partnering with local hospitals to bring specialists to the village.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Monthly Clean-up & Tree Planting',
    date: new Date('2025-11-30'),
    location: 'Market Center & River Bank',
    category: 'Environment',
    description: 'Join us to clean the market area and plant 500 indigenous trees to restore our green cover. Gloves and seedlings will be provided.',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Annual General Meeting (AGM)',
    date: new Date('2026-01-15'),
    location: 'Main Hall',
    category: 'Governance',
    description: 'All members are required to attend. Agenda: Financial Report, Election of new officials, and review of the 2026 Strategic Plan.',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Youth Talent Showcase',
    date: new Date('2025-12-24'),
    location: 'City Sports Ground',
    category: 'Social',
    description: 'A day of dance, music, and art to celebrate the creativity of our youth. Winners will receive mentorship opportunities.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop'
  }
];

const seedDB = async () => {
  try {
    console.log("⏳ Connecting...");
    await mongoose.connect(process.env.MONGO_URI);
    
    await Event.deleteMany();
    await Event.insertMany(events);
    
    console.log('✅ Events Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();