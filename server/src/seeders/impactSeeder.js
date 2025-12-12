const mongoose = require('mongoose');
const dotenv = require('dotenv');

// CORRECT PATHS: Go up one level (..) to find models
const Testimonial = require('../models/Testimonial'); 
const GalleryItem = require('../models/GalleryItem');

// Load env vars from the root server folder
dotenv.config({ path: './.env' }); 

// --- STABLE DATA TO SEED ---

const testimonials = [
  {
    name: "Sarah Wanjiku",
    role: "Beneficiary, Education Program",
    quote: "The scholarship from Jayness CBO didn't just pay my fees; it gave me hope. I am now pursuing my dream of becoming a nurse.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    name: "Chief Musa",
    role: "Community Leader, Westlands",
    quote: "I have worked with many NGOs, but Jayness stands out for their transparency and genuine connection to the grassroots.",
    image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    name: "Grace A.",
    role: "Widow Support Group",
    quote: "Through the table banking initiative, I started a grocery stall. Now I can feed my children without borrowing.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    name: "John Kamau",
    role: "Youth Volunteer",
    quote: "Volunteering here taught me leadership. We are not just waiting for change; we are building it ourselves.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200"
  }
];

const galleryItems = [
  // Images
  {
    src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
    category: "Education",
    type: "image",
    title: "School Supplies Distribution"
  },
  {
    src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
    category: "Health",
    type: "image",
    title: "Community Medical Camp"
  },
  {
    src: "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5fa5?auto=format&fit=crop&q=80&w=800",
    category: "Environment",
    type: "image",
    title: "Tree Planting Day"
  },
  {
    src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800",
    category: "Community",
    type: "image",
    title: "Women's Meeting"
  },
  {
    src: "https://images.unsplash.com/photo-1509099836639-18ba4eb71628?auto=format&fit=crop&q=80&w=800",
    category: "Education",
    type: "image",
    title: "Classroom Renovation"
  },
  // Video (YouTube Embed - Uses a real generic charity video)
  {
    src: "https://www.youtube.com/embed/ScMzIvxBSi4?si=Placeholder", 
    category: "Impact Story",
    type: "video",
    title: "Our Journey: 2024 Recap"
  }
];

// --- SEED FUNCTION ---

const seedImpact = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Connected to MongoDB');

    // 1. Clear existing data
    await Testimonial.deleteMany({});
    await GalleryItem.deleteMany({});
    console.log('🗑️  Cleared existing Impact data');

    // 2. Insert new data
    await Testimonial.insertMany(testimonials);
    await GalleryItem.insertMany(galleryItems);
    console.log('✅ Impact Data Seeded Successfully');

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedImpact();