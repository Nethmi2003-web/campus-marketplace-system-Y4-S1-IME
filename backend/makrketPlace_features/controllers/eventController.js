const { createRecord, listRecords } = require('../../config/database');

const createEvent = async (req, res) => {
  try {
    const {
      name,
      faculty,
      date,
      time,
      venue,
      organizedTeam,
      category,
      description,
      status
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const imageUrl = req.file.secure_url || req.file.url || req.file.path;
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image upload failed, no URL returned.' });
    }
    if (!name || !faculty || !date || !venue || !organizedTeam) {
      return res.status(400).json({ success: false, message: 'Please provide all required event fields' });
    }
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid event date' });
    }
    const eventStatus = status || 'Upcoming';
    if (!['Upcoming', 'Ongoing', 'Completed', 'Cancelled'].includes(eventStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid event status' });
    }

    const event = await createRecord('events', {
      name,
      faculty,
      date: parsedDate.toISOString(),
      time: time || '',
      venue,
      organizedTeam,
      category: category || 'General',
      description: description || '',
      imageUrl,
      status: eventStatus
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error(`Error in createEvent: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error while creating event' });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = (await listRecords('events'))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error(`Error in getEvents: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error while fetching events' });
  }
};

module.exports = { createEvent, getEvents };
