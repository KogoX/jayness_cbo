const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');

// Get All
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Event
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin)
const createEvent = async (req, res) => {
  const { title, date, location, category, description, image } = req.body;

  try {
    const event = new Event({
      title,
      date,
      location,
      category,
      description,
      image,
      createdBy: req.user._id
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      await event.deleteOne();
      res.json({ message: 'Event removed' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      // Update fields if they exist in the request, otherwise keep old value
      event.title = req.body.title || event.title;
      event.date = req.body.date || event.date;
      event.location = req.body.location || event.location;
      event.category = req.body.category || event.category;
      event.description = req.body.description || event.description;
      event.image = req.body.image || event.image;

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a user/guest for an event
// @route   POST /api/events/:id/register
// @access  Public
const registerForEvent = async (req, res) => {
  const { fullName, email, phone } = req.body;
  const { id } = req.params; // Event ID

  try {
    // Check if event exists
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already registered (optional duplicate check by phone)
    const existing = await EventRegistration.findOne({ event: id, phone });
    if (existing) {
      return res.status(400).json({ message: 'This phone number is already registered.' });
    }

    const registration = await EventRegistration.create({
      event: id,
      fullName,
      email,
      phone
    });

    res.status(201).json({ message: 'Registration successful', registration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all registrations for an event
// @route   GET /api/events/:id/registrations
// @access  Private (Admin)
const getEventRegistrations = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ event: req.params.id })
      .sort({ registeredAt: -1 }); // Newest first
    
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE EXPORTS
module.exports = { 
  getEvents, 
  getEventById, 
  createEvent, 
  deleteEvent, 
  updateEvent,
  registerForEvent,     
  getEventRegistrations  
};