const { MongoClient } = require('mongodb');

let client = null;
let db = null;

/**
 * Connect to MongoDB and ensure essential collections & indexes exist for Phase 1.
 */
async function connectToDatabase() {
  if (db) return db;

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ascendix_db';
  console.log(`[Gateway DB] Connecting to MongoDB at: ${uri}`);

  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    db = client.db();
    console.log(`[Gateway DB] Successfully connected to database: ${db.databaseName}`);

    // Create unique index on users.email
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log('[Gateway DB] Verified unique index on users.email');

    // Create unique index on student_profiles.user_id
    const profilesCollection = db.collection('student_profiles');
    await profilesCollection.createIndex({ user_id: 1 }, { unique: true });
    console.log('[Gateway DB] Verified unique index on student_profiles.user_id');

    // Ensure default Admin/Faculty account exists for Placement Cell management
    const bcrypt = require('bcryptjs');
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@ascendix.edu').toLowerCase();
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const now = new Date();
      await usersCollection.insertOne({
        name: 'Placement Cell Admin',
        email: adminEmail,
        password_hash: passwordHash,
        role: 'ADMIN',
        college: 'Ascendix Institute of Technology',
        degree: 'Faculty / Placement Cell',
        branch: 'Placement Administration',
        graduation_year: null,
        created_at: now,
        updated_at: now,
      });
      console.log(`[Gateway DB] Seeded default Admin account: ${adminEmail}`);
    } else if (!existingAdmin.role || existingAdmin.role === 'STUDENT') {
      await usersCollection.updateOne(
        { email: adminEmail },
        { $set: { role: 'ADMIN' } }
      );
    }

    return db;
  } catch (error) {
    console.error('[Gateway DB] Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase() first.');
  }
  return db;
}

function getUsersCollection() {
  return getDb().collection('users');
}

function getProfilesCollection() {
  return getDb().collection('student_profiles');
}

module.exports = {
  connectToDatabase,
  getDb,
  getUsersCollection,
  getProfilesCollection,
};
