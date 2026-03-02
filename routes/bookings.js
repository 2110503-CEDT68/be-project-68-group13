const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBooking,
  updateBooking,
  deleteBooking
} = require('../controllers/bookings');

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', createBooking);
router.get('/me', getMyBookings);

// Admin routes
router.get('/', authorize('admin'), getAllBookings);

router.get('/:id', getBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

module.exports = router;
