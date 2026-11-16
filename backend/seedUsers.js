require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createRecord, findRecordByField } = require('./config/database');

const seedUser = async ({ email, password, ...details }) => {
  const universityEmail = email.toLowerCase();
  const existing = await findRecordByField('users', 'universityEmail', universityEmail);
  if (existing) {
    console.log(`ℹ️ ${universityEmail} already exists; leaving it unchanged.`);
    return;
  }
  if (!password) throw new Error(`Set a password for ${email} using the documented SEED_*_PASSWORD variable.`);

  await createRecord('users', {
    ...details,
    universityEmail,
    passwordHash: await bcrypt.hash(password, 10),
    sessionVersion: 0
  });
  console.log(`✅ Created ${universityEmail}`);
};

const seedUsers = async () => {
  await seedUser({
    firstName: 'System',
    lastName: 'Admin',
    faculty: 'Administration',
    email: 'admin@my.sliit.lk',
    password: process.env.SEED_ADMIN_PASSWORD,
    role: 'admin'
  });
  await seedUser({
    firstName: 'Nethmi',
    lastName: 'Perera',
    faculty: 'Computing',
    email: 'student@my.sliit.lk',
    password: process.env.SEED_STUDENT_PASSWORD,
    role: 'user'
  });
  console.log('--- Firebase user seeding completed ---');
};

seedUsers().catch((error) => {
  console.error('❌ Error seeding users:', error);
  process.exitCode = 1;
});
