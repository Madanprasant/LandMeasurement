import express from 'express';
import LandRecord from '../models/LandRecord.js';

const router = express.Router();

/**
 * GET /api/lands/:userId
 * Fetch all saved land records for a specific Firebase user
 */
router.get('/:userId', async (req, res) => {
  try {
    const records = await LandRecord.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch records", details: err.message });
  }
});

/**
 * POST /api/lands
 * Save a new land record
 */
router.post('/', async (req, res) => {
  try {
    const { userId, title, boundary, area, perimeters, notes } = req.body;
    
    if (!userId || !boundary || boundary.length < 3) {
      return res.status(400).json({ error: "Invalid data. A valid polygon (>= 3 points) and userId are required." });
    }

    const newRecord = new LandRecord({
      userId,
      title,
      boundary,
      area,
      perimeters,
      notes
    });

    const savedRecord = await newRecord.save();
    res.status(201).json(savedRecord);
  } catch (err) {
    res.status(500).json({ error: "Failed to save land record", details: err.message });
  }
});

/**
 * DELETE /api/lands/:id
 * Delete a saved land record
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedRecord = await LandRecord.findByIdAndDelete(req.params.id);
    if (!deletedRecord) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete land record", details: err.message });
  }
});

export default router;
