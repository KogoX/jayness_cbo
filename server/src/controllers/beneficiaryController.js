const Beneficiary = require('../models/Beneficiary');
const Program = require('../models/Program');

// @desc    Get all beneficiaries (Populate program name)
// @route   GET /api/beneficiaries
const getBeneficiaries = async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find({})
      .populate('assignedProgram', 'title') // Fetch the Program Title automatically
      .sort({ createdAt: -1 });
    res.json(beneficiaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new beneficiary
// @route   POST /api/beneficiaries
const createBeneficiary = async (req, res) => {
  const { fullName, idNumber, age, gender, location, assignedProgram, needs } = req.body;

  try {
    const exists = await Beneficiary.findOne({ idNumber });
    if (exists) {
      return res.status(400).json({ message: 'Beneficiary with this ID already exists' });
    }

    const beneficiary = await Beneficiary.create({
      fullName,
      idNumber,
      age,
      gender,
      location,
      assignedProgram,
      needs,
      registeredBy: req.user._id
    });

    // OPTIONAL: Update the Program's beneficiary count automatically
    const program = await Program.findById(assignedProgram);
    if (program) {
      program.beneficiariesCount = (program.beneficiariesCount || 0) + 1;
      await program.save();
    }

    res.status(201).json(beneficiary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete beneficiary
// @route   DELETE /api/beneficiaries/:id
const deleteBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id);

    if (beneficiary) {
      // Optional: Decrease program count
      const program = await Program.findById(beneficiary.assignedProgram);
      if (program && program.beneficiariesCount > 0) {
        program.beneficiariesCount -= 1;
        await program.save();
      }

      await beneficiary.deleteOne();
      res.json({ message: 'Beneficiary removed' });
    } else {
      res.status(404).json({ message: 'Beneficiary not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Public Self-Registration
// @route   POST /api/beneficiaries/public/register
// @access  Public
const publicRegisterBeneficiary = async (req, res) => {
  const { fullName, idNumber, phone, email, age, gender, location, assignedProgram, needs } = req.body;

  try {
    // 1. Check for duplicates
    const exists = await Beneficiary.findOne({ idNumber });
    if (exists) {
      return res.status(400).json({ message: 'A beneficiary with this ID Number is already registered.' });
    }

    // 2. Create with 'Pending' status
    const beneficiary = await Beneficiary.create({
      fullName,
      idNumber,
      phone,
      email,
      age,
      gender,
      location,
      assignedProgram,
      needs,
      status: 'Pending', // <--- Important: Admin must approve later
    });

    res.status(201).json({ message: 'Registration successful! We will contact you soon.', beneficiary });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { 
  getBeneficiaries, 
  createBeneficiary, 
  deleteBeneficiary,
  publicRegisterBeneficiary
};