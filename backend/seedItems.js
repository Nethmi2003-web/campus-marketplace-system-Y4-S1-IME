require('dotenv').config();
const { createRecord, findRecordByField, listRecords } = require('./config/database');

const mockItems = [
  {
    title: 'Thermodynamics 8th Edition',
    description: 'Standard engineering textbook, essential for ME students. Good condition with some highlights.',
    price: 3500,
    category: 'Books',
    condition: 'Used',
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=500&auto=format&fit=crop',
    stockQuantity: 10,
    status: 'available'
  },
  {
    title: 'Logitech G502 Hero Mouse',
    description: 'High performance wired gaming mouse. 25K DPI sensor, RGB lighting. Barely used.',
    price: 12000,
    category: 'Electronics',
    condition: 'Like New',
    imageUrl: 'https://images.unsplash.com/photo-1527443195645-1133e7d2bb81?q=80&w=500&auto=format&fit=crop',
    stockQuantity: 2,
    status: 'available'
  },
  {
    title: 'SLIIT Lab Coat (Size M)',
    description: 'Official white lab coat required for chemistry and physics labs. Clean and ironed.',
    price: 1500,
    category: 'Lab Equipment',
    condition: 'Used',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=500&auto=format&fit=crop',
    stockQuantity: 10,
    status: 'available'
  }
];

const seedItems = async () => {
  const student = await findRecordByField('users', 'universityEmail', 'student@my.sliit.lk');
  if (!student) throw new Error('Student account not found. Run seedUsers.js first.');

  const existing = await listRecords('items');
  if (existing.length) {
    console.log('ℹ️ Items already exist; leaving the collection unchanged.');
    return;
  }

  for (const item of mockItems) {
    await createRecord('items', {
      ...item,
      seller: student._id,
      sellerName: `${student.firstName} ${student.lastName}`
    });
  }
  console.log('✅ Sample items seeded successfully.');
};

seedItems().catch((error) => {
  console.error('❌ Error seeding items:', error);
  process.exitCode = 1;
});
