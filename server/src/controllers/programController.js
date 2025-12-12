const Program = require('../models/Program');

// @desc    Get all programs
// @route   GET /api/programs
// @access  Public
const getPrograms = async (req, res) => {
  try {
    const programs = await Program.find({});
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single program by ID
// @route   GET /api/programs/:id
// @access  Public
const getProgramById = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (program) {
      res.json(program);
    } else {
      res.status(404).json({ message: 'Program not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new program
// @route   POST /api/programs
// @access  Private (Admin only)
const createProgram = async (req, res) => {
  const { title, description, targetBudget, image } = req.body;

  try {
    const program = new Program({
      title,
      description,
      targetBudget,
      image,
      createdBy: req.user._id, // Tracks which admin created it
    });

    const createdProgram = await program.save();
    res.status(201).json(createdProgram);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update program stats (e.g., beneficiary count)
// @route   PUT /api/programs/:id
// @access  Private (Admin only)
const updateProgram = async (req, res) => {
  const { description, targetBudget, beneficiariesCount, status } = req.body;

  try {
    const program = await Program.findById(req.params.id);

    if (program) {
      program.description = description || program.description;
      program.targetBudget = targetBudget || program.targetBudget;
      program.beneficiariesCount = beneficiariesCount || program.beneficiariesCount;
      program.status = status || program.status;

      const updatedProgram = await program.save();
      res.json(updatedProgram);
    } else {
      res.status(404).json({ message: 'Program not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// @desc    Delete a program
// @route   DELETE /api/programs/:id
// @access  Private (Admin)
const deleteProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (program) {
      await program.deleteOne();
      res.json({ message: 'Program removed' });
    } else {
      res.status(404).json({ message: 'Program not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram
};