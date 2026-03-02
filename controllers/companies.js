const Company = require('../models/Company');
const asyncHandler = require('express-async-handler');

// @desc    Get companies list
// @route   GET /api/v1/companies
// @access  Public
exports.getCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find();
  res.status(200).json({ success: true, count: companies.length, data: companies });
});

// @desc    Create new company
// @route   POST /api/v1/companies
// @access  Public (หรือ Private/Admin ถ้าคุณใช้ middleware)
exports.createCompany = asyncHandler(async (req, res) => {
  const { name, address, website, description, telephone } = req.body;

  if (!name || !address || !website || !description || !telephone) {
    res.status(400);
    throw new Error('Please provide all company fields');
  }

  const company = await Company.create({
    name,
    address,
    website,
    description,
    telephone
  });

  res.status(201).json({
    success: true,
    data: company
  });
});
