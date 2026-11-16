const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');

const jwtSecret = defineSecret('JWT_SECRET');
const cloudinaryCloudName = defineSecret('CLOUDINARY_CLOUD_NAME');
const cloudinaryApiKey = defineSecret('CLOUDINARY_API_KEY');
const cloudinaryApiSecret = defineSecret('CLOUDINARY_API_SECRET');
const databaseUrl = defineString('FIREBASE_DATABASE_URL');
process.env.FIREBASE_DATABASE_URL = databaseUrl.value();

const app = require('./app');

exports.api = onRequest(
  {
    region: 'us-central1',
    cors: true,
    secrets: [jwtSecret, cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret]
  },
  app
);
