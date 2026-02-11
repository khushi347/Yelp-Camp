const mongoose = require('mongoose');
const cities = require('./cities');
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelper');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
  .then(() => console.log("🌱 Database connected"))
  .catch(err => console.error("❌ Connection error:", err));

const sample = array => array[Math.floor(Math.random() * array.length)];

const descriptions = [
  "Nestled among tall pine trees, this campground offers peaceful surroundings, fresh mountain air, and stunning sunrise views. Perfect for hiking, photography, and quiet evenings by the fire.",
  
  "A scenic riverside campground with easy access to fishing spots, nature trails, and open skies for stargazing. Ideal for families and weekend getaways.",
  
  "Located in the heart of the hills, this campsite provides breathtaking valley views, cool weather, and plenty of space for tents and campfires.",
  
  "This serene forest campground is surrounded by lush greenery and wildlife. A great place to disconnect from city life and reconnect with nature.",
  
  "Enjoy panoramic mountain views, clean facilities, and nearby trekking routes. Popular among backpackers and adventure lovers.",
  
  "A cozy campsite near a quiet village, offering a mix of comfort and wilderness. Perfect for campers looking for both nature and local culture.",
  
  "Set beside a calm lake, this campground is known for its beautiful sunsets, birdwatching opportunities, and peaceful atmosphere.",
  
  "An offbeat campsite surrounded by dense forest, ideal for campers seeking solitude, long walks, and campfire cooking under the stars."
];

const images = [
  {
    url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    filename: 'forest-camp'
  },
  {
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    filename: 'mountain-camp'
  },
  {
    url: 'https://images.unsplash.com/photo-1499696010181-8a7b98b2f36f?auto=format&fit=crop&w=1200&q=80',
    filename: 'lake-camp'
  },
  {
    url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    filename: 'valley-camp'
  },
  {
    url: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80',
    filename: 'tent-camp'
  },
  {
    url: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=1200&q=80',
    filename: 'river-camp'
  },
  {
    url: 'https://images.unsplash.com/photo-1519817914152-22f90e7f07d8?auto=format&fit=crop&w=1200&q=80',
    filename: 'hills-camp'
  },
  {
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    filename: 'green-valley'
  },
  {
    url: 'https://images.unsplash.com/photo-1508766206392-8bd5cf550d1b?auto=format&fit=crop&w=1200&q=80',
    filename: 'sunrise-camp'
  },
  {
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    filename: 'deep-forest'
  },
  {
    url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80',
    filename: 'mountain-range'
  },
  {
    url: 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1200&q=80',
    filename: 'night-camp'
  },
  {
    url: 'https://images.unsplash.com/photo-1501876725168-00c445821c9e?auto=format&fit=crop&w=1200&q=80',
    filename: 'roadtrip-camp'
  },
  {
    url: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80',
    filename: 'foggy-mountains'
  }
];

const seeImages = () => {
  const shuffled = images.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};



const seedDB = async () => {
  await Campground.deleteMany({});
  console.log('🧹 Old campgrounds removed');

  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;

    const camp = new Campground({
      author: '698c5e7e32ed5aa5ee86ba1e', // 🔴 REQUIRED
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: sample(descriptions),

      price,
      geometry: {
        type: 'Point',
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude
        ]
      },
      latitude: cities[random1000].latitude,
      longitude: cities[random1000].longitude,
      images: seeImages(),

    });

    await camp.save();
  }
};

seedDB().then(() => {
  console.log('✅ Database seeded');
  mongoose.connection.close();
});
