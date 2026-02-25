const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const legacyUserFilter = {
  $or: [
    { isEmailVerified: { $exists: false } },
    {
      $and: [
        { isEmailVerified: false },
        {
          $or: [
            { emailVerificationToken: { $exists: false } },
            { emailVerificationToken: null },
            { emailVerificationToken: '' },
          ],
        },
      ],
    },
  ],
};

const parseApplyMode = () => process.argv.includes('--apply');

async function run() {
  const isApplyMode = parseApplyMode();

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Set it in server/.env before running this script.');
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
  });

  const users = mongoose.connection.collection('users');
  const matchCount = await users.countDocuments(legacyUserFilter);

  console.log(`[legacy-verify] Matching users: ${matchCount}`);

  if (!isApplyMode) {
    console.log('[legacy-verify] Dry run complete. No documents were changed.');
    console.log('[legacy-verify] Re-run with --apply to update matching users.');
    return;
  }

  const result = await users.updateMany(legacyUserFilter, {
    $set: { isEmailVerified: true },
    $unset: {
      emailVerificationToken: '',
      emailVerificationExpire: '',
    },
  });

  console.log(`[legacy-verify] Modified users: ${result.modifiedCount}`);
}

run()
  .catch((error) => {
    console.error(`[legacy-verify] Error: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch (error) {
      // no-op
    }
  });
