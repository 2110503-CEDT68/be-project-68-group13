const Booking = require('../models/Booking');
const Company = require('../models/Company');
const asyncHandler = require('express-async-handler');

// Date range for the fair (inclusive)
const FAIR_START = new Date('2022-05-10T00:00:00Z').getTime();
const FAIR_END = new Date('2022-05-13T23:59:59Z').getTime();

// Helper to validate date
function isDateInFair(date) {
  const t = new Date(date).getTime();
  return !isNaN(t) && t >= FAIR_START && t <= FAIR_END;
}

// @desc    Create a booking (user books a session)
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date, companies } = req.body;

    if (!date || !companies || !Array.isArray(companies) || companies.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date and preferred companies (array of company IDs)'
      });
    }

    if (!isDateInFair(date)) {
      return res.status(400).json({
        success: false,
        message: 'Date must be within May 10 - 13, 2022'
      });
    }

    const found = await Company.find({ _id: { $in: companies } });
    if (found.length !== companies.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more company IDs are invalid'
      });
    }

    const count = await Booking.countDocuments({ user: userId });
    if (count >= 3) {
      return res.status(400).json({
        success: false,
        message: 'You already have 3 bookings (maximum allowed)'
      });
    }

    const booking = await Booking.create({
      user: userId,
      date,
      companies
    });

    res.status(201).json({
      success: true,
      data: booking
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get bookings (role-based)
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = asyncHandler(async (req, res) => {

  let query;

  // 👑 ถ้าเป็น admin → เห็นทั้งหมด
  if (req.user.role === 'admin') {
    query = Booking.find();
  } 
  // 👤 ถ้าเป็น user → เห็นเฉพาะของตัวเอง
  else {
    query = Booking.find({ user: req.user.id });
  }

  const bookings = await query
    .populate('user')
    .populate('companies')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private (owner or admin)
exports.getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('user companies');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // allow owner or admin
  if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this booking');
  }

  res.status(200).json({ success: true, data: booking });
});

// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
// @access  Private (owner or admin)
exports.updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // allow owner or admin
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this booking');
  }

  const { date, companies } = req.body;
  if (date && !isDateInFair(date)) {
    res.status(400);
    throw new Error('Date must be within May 10 - 13, 2022');
  }

  if (companies) {
    if (!Array.isArray(companies) || companies.length === 0) {
      res.status(400);
      throw new Error('Companies must be an array of company IDs');
    }
    const found = await Company.find({ _id: { $in: companies } });
    if (found.length !== companies.length) {
      res.status(400);
      throw new Error('One or more company IDs are invalid');
    }
    booking.companies = companies;
  }

  if (date) booking.date = date;

  await booking.save();

  res.status(200).json({ success: true, data: booking });
});

// @desc    Delete booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private (owner or admin)
exports.deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this booking');
  }

  await booking.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
