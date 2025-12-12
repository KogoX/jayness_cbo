const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Program = require('./src/models/Program');
const User = require('./src/models/User'); 

dotenv.config();

console.log("🚀 Script Starting...");

// REAL DATA with Unsplash Image Links
const programs = [
  {
    title: 'Child and Orphan Support',
    description: 'Providing safe shelter, food, school uniforms, and tuition support for street children and orphans.',
    targetBudget: 500000,
    beneficiariesCount: 120,
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Women Empowerment Hub',
    description: 'Business vocational training, legal clinics, and cooperative savings groups for women.',
    targetBudget: 300000,
    beneficiariesCount: 45,
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Community Health Initiative',
    description: 'Annual medical camps, mobile clinics, and water sanitation projects.',
    targetBudget: 750000,
    beneficiariesCount: 500,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Education and Literacy Drive',
    description: 'Scholarships for high-performing students and adult education classes.',
    targetBudget: 400000,
    beneficiariesCount: 80,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Youth Empowerment and Innovation',
    description: 'ICT training, coding bootcamps, and talent showcases for unemployed youth.',
    targetBudget: 250000,
    beneficiariesCount: 60,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Environmental and Civic Engagement',
    description: 'Monthly clean-up campaigns, tree planting, and civic rights awareness.',
    targetBudget: 100000,
    beneficiariesCount: 1000,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop'
  }
];

const seedDB = async () => {
  try {
    console.log("⏳ Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected...');

    const adminUser = await User.findOne();
    if (!adminUser) {
      console.log('❌ No users found. Please Register a user on the website first!');
      process.exit();
    }

    const programsWithUser = programs.map((p) => ({ ...p, createdBy: adminUser._id }));

    // DELETE OLD DATA
    await Program.deleteMany();
    console.log('🗑️  Old programs deleted...');

    // INSERT NEW DATA
    await Program.insertMany(programsWithUser);
    console.log('✅ 6 New Programs with IMAGES Imported!');
    
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seedDB();