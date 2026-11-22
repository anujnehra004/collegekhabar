require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, isMongoConnected } = require('./config/db');
const Event = require('./models/Event');
const Club = require('./models/Club');
const Registration = require('./models/Registration');
const jsonStorage = require('./services/jsonStorageService');

async function seedDatabase() {
  console.log('🌱 [Seeder] Starting CampusConnect MongoDB Database Seeder...');
  await connectDB();

  if (!isMongoConnected()) {
    console.error('❌ [Seeder] Cannot seed database: MongoDB is not connected.');
    console.log('   Ensure MongoDB is running or specify a valid MONGO_URI in .env.');
    process.exit(1);
  }

  try {
    // 1. Load data from local JSON storage files
    const eventsData = await jsonStorage.read('events');
    const clubsData = await jsonStorage.read('clubs');
    const registrationsData = await jsonStorage.read('registrations');

    console.log(`[Seeder] Loaded ${eventsData.length} events, ${clubsData.length} clubs, and ${registrationsData.length} registrations from JSON files.`);

    // 2. Clear existing collections
    await Event.deleteMany({});
    await Club.deleteMany({});
    await Registration.deleteMany({});
    console.log('🧹 [Seeder] Cleared existing MongoDB collections.');

    // 3. Seed Clubs
    const cleanedClubs = clubsData.map(({ id, _id, ...rest }) => rest);
    const insertedClubs = await Club.insertMany(cleanedClubs);
    console.log(`✅ [Seeder] Inserted ${insertedClubs.length} Clubs into MongoDB.`);

    // 4. Seed Events
    const cleanedEvents = eventsData.map(({ id, _id, ...rest }) => rest);
    const insertedEvents = await Event.insertMany(cleanedEvents);
    console.log(`✅ [Seeder] Inserted ${insertedEvents.length} Events into MongoDB.`);

    // 5. Seed Registrations
    const cleanedRegistrations = registrationsData.map(({ id, _id, ...rest }) => rest);
    const insertedRegistrations = await Registration.insertMany(cleanedRegistrations);
    console.log(`✅ [Seeder] Inserted ${insertedRegistrations.length} Registrations into MongoDB.`);

    console.log('🎉 [Seeder] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seeder] Error during database seeding:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase();
