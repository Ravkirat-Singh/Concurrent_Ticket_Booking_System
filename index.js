const express = require('express');
const router = express.Router();

const NUM_SEATS = 12;
let seats = Array.from({length: NUM_SEATS}, (_, i) => ({
  id: i + 1,
  status: "available",
  lockedBy: null,
  lockExpiry: null
}));

function updateLocks() {
  const now = Date.now();
  for (let seat of seats) {
    if (seat.status === "locked" && seat.lockExpiry && seat.lockExpiry < now) {
      seat.status = "available";
      seat.lockedBy = null;
      seat.lockExpiry = null;
    }
  }
}

// List all seats & status
router.get('/seats', (req, res) => {
  updateLocks();
  res.json(seats);
});

// Lock a seat for a user, expires after one minute
router.post('/seats/:id/lock', (req, res) => {
  updateLocks();
  const seat = seats.find(s => s.id == req.params.id);
  const user = req.body.user;
  if (!seat) return res.status(404).json({error: "Seat not found"});
  if (!user) return res.status(400).json({error: "User is required"});
  if (seat.status === "booked")
    return res.status(400).json({error: "Seat already booked"});
  if (seat.status === "locked")
    return res.status(400).json({error: "Seat already locked"});
  seat.status = "locked";
  seat.lockedBy = user;
  seat.lockExpiry = Date.now() + 60*1000; // 1 min
  res.json({success: true, seat, message: "Seat locked for 1 minute"});
});

// Confirm seat booking (must be locked by same user)
router.post('/seats/:id/confirm', (req, res) => {
  updateLocks();
  const seat = seats.find(s => s.id == req.params.id);
  const user = req.body.user;
  if (!seat) return res.status(404).json({error: "Seat not found"});
  if (!user) return res.status(400).json({error: "User is required"});
  if (seat.status !== "locked")
    return res.status(400).json({error: "Seat is not locked"});
  if (seat.lockedBy !== user)
    return res.status(403).json({error: "You did not lock this seat"});
  seat.status = "booked";
  seat.lockedBy = user;
  seat.lockExpiry = null;
  res.json({success: true, seat, message: "Seat booked successfully"});
});

module.exports = router;
