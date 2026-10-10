const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

async function startMongo() {
  const dbPath = path.resolve(__dirname, '../../.mongo_data');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  console.log('[Ascendix Local Mongo] Starting standalone local MongoDB engine on port 27017...');
  console.log(`[Ascendix Local Mongo] Persistent storage directory: ${dbPath}`);

  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'ascendix_db',
      dbPath: dbPath,
      storageEngine: 'wiredTiger',
    },
  });

  const uri = mongod.getUri();
  console.log('========================================================');
  console.log(`[Ascendix Local Mongo] MongoDB is READY and listening!`);
  console.log(`Connection URI: mongodb://127.0.0.1:27017/ascendix_db`);
  console.log('Press Ctrl+C to terminate MongoDB.');
  console.log('========================================================');

  process.on('SIGINT', async () => {
    console.log('\nShutting down MongoDB server...');
    await mongod.stop();
    process.exit(0);
  });
}

startMongo().catch((err) => {
  console.error('[Ascendix Local Mongo] Failed to start:', err);
  process.exit(1);
});
