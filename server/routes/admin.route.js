const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { bulkImportPainPointsController, bulkImportBusinessIdeasController } = require('../controllers/admin.controller');
// const requireAdmin = require('../middlewares/requireAdmin'); // Add this if using role-based auth

const router = express.Router();

// Configure storage
const storagePainPoints = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/painpoints/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Add timestamp and sanitize filename
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `painpoints-${Date.now()}-${sanitizedName}`);
  }
});

const storageBusinessIdeas = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/business-ideas/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Add timestamp and sanitize filename
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `business-ideas-${Date.now()}-${sanitizedName}`);
  }
});

// Configure multer with better error handling
const uploadPainPoints = multer({
  storage: storagePainPoints,
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype === 'text/csv' || 
        file.originalname.toLowerCase().endsWith('.csv') ||
        file.mimetype === 'application/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed. Please upload a .csv file.'), false);
    }
  },
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1 // Only allow 1 file
  }
});

const uploadBusinessIdeas = multer({
  storage: storageBusinessIdeas,
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype === 'text/csv' || 
        file.originalname.toLowerCase().endsWith('.csv') ||
        file.mimetype === 'application/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed. Please upload a .csv file.'), false);
    }
  },
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1 // Only allow 1 file
  }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Please upload only one CSV file.'
      });
    }
  }
  
  if (error.message.includes('Only CSV files are allowed')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  return res.status(400).json({
    success: false,
    message: 'File upload error',
    error: error.message
  });
};

// Admin route to import CSV
router.post(
  '/painpoints/import',
  // requireAdmin, // Uncomment to protect with admin middleware
  (req, res, next) => {
    uploadPainPoints.single('file')(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  bulkImportPainPointsController
);

router.post(
  '/business-ideas/import',
  // requireAdmin, // Uncomment to protect with admin middleware
  (req, res, next) => {
    uploadBusinessIdeas.single('file')(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  bulkImportBusinessIdeasController
);


module.exports = router;