const admin = require('firebase-admin');

const firebaseConfig = process.env.FIREBASE_CONFIG
  ? JSON.parse(process.env.FIREBASE_CONFIG)
  : {};
const emulatorHost = process.env.FIREBASE_DATABASE_EMULATOR_HOST;
const projectId = process.env.GCLOUD_PROJECT || firebaseConfig.projectId || 'demo-campus-marketplace';
const databaseURL =
  (emulatorHost ? `http://${emulatorHost}?ns=${projectId}` : null) ||
  process.env.FIREBASE_DATABASE_URL ||
  firebaseConfig.databaseURL;

if (!databaseURL) {
  throw new Error(
    'Firebase Realtime Database is not configured. Set FIREBASE_DATABASE_URL or configure it in Firebase.'
  );
}

if (!admin.apps.length) {
  admin.initializeApp({ databaseURL, projectId });
}

const database = admin.database();

const cleanValue = (value) => {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((entry) => cleanValue(entry) ?? null);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, cleanValue(entry)])
    );
  }
  return value;
};

const withId = (id, value) => (value ? { ...value, _id: id } : null);

const getRecord = async (collection, id) => {
  const snapshot = await database.ref(`${collection}/${id}`).get();
  return withId(snapshot.key, snapshot.val());
};

const listRecords = async (collection) => {
  const snapshot = await database.ref(collection).get();
  const records = snapshot.val() || {};
  return Object.entries(records).map(([id, value]) => withId(id, value));
};

const findRecordByField = async (collection, field, value) => {
  const snapshot = await database
    .ref(collection)
    .orderByChild(field)
    .equalTo(value)
    .limitToFirst(1)
    .get();
  const records = snapshot.val() || {};
  const [id, record] = Object.entries(records)[0] || [];
  return id ? withId(id, record) : null;
};

const createRecord = async (collection, data) => {
  const ref = database.ref(collection).push();
  const now = new Date().toISOString();
  const record = cleanValue({
    ...data,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now
  });

  await ref.set(record);
  return withId(ref.key, record);
};

const updateRecord = async (collection, id, updates) => {
  const ref = database.ref(`${collection}/${id}`);
  const snapshot = await ref.transaction((current) => {
    if (!current) return;
    return cleanValue({
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    });
  });

  return snapshot.committed ? withId(snapshot.key, snapshot.val()) : null;
};

const deleteRecord = async (collection, id) => {
  const ref = database.ref(`${collection}/${id}`);
  const snapshot = await ref.get();
  if (!snapshot.exists()) return false;
  await ref.remove();
  return true;
};

module.exports = {
  admin,
  database,
  getRecord,
  listRecords,
  findRecordByField,
  createRecord,
  updateRecord,
  deleteRecord,
  cleanValue
};
