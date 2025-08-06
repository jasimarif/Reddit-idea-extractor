const fs = require('fs');
const { importPainPointsFromCsv } = require('../services/admin.service');
const { importBusinessIdeasFromCsv } = require('../services/admin.service');


async function bulkImportPainPointsController(req, res) {
  let filePath = null;
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No CSV file uploaded. Please select a file to upload.' 
      });
    }

    filePath = req.file.path;

    // Check if file exists and is readable
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        success: false,
        message: 'Uploaded file could not be found.'
      });
    }

    console.log(`Processing CSV file: ${req.file.originalname}`);
    
    const result = await importPainPointsFromCsv(filePath);

    // Clean up the uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(200).json({
      success: true,
      message: 'Pain points imported successfully',
      stats: {
        totalProcessed: result.totalProcessed,
        inserted: result.inserted,
        errors: result.errors,
        hasErrors: result.errors && result.errors.length > 0
      }
    });

  } catch (error) {
    // Clean up the uploaded file on error
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }

    console.error('Bulk import error:', error);

    // Handle specific error types
    if (error.message.includes('No valid pain points found')) {
      return res.status(400).json({
        success: false,
        message: 'No valid pain points found in the CSV file. Please check your data format.',
        error: error.message
      });
    }

    if (error.message.includes('CSV parsing error')) {
      return res.status(400).json({
        success: false,
        message: 'Error parsing CSV file. Please check the file format.',
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to import pain points',
      error: error.message
    });
  }
}

async function bulkImportBusinessIdeasController(req, res) {
  let filePath = null;
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No CSV file uploaded. Please select a file to upload.' 
      });
    }

    filePath = req.file.path;

    // Check if file exists and is readable
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        success: false,
        message: 'Uploaded file could not be found.'
      });
    }

    console.log(`Processing Business Ideas CSV file: ${req.file.originalname}`);
    
    const result = await importBusinessIdeasFromCsv(filePath);

    // Clean up the uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(200).json({
      success: true,
      message: 'Business ideas imported successfully',
      stats: {
        totalProcessed: result.totalProcessed,
        inserted: result.inserted,
        errors: result.errors,
        hasErrors: result.errors && result.errors.length > 0
      }
    });

  } catch (error) {
    // Clean up the uploaded file on error
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }

    console.error('Business Ideas bulk import error:', error);

    // Handle specific error types
    if (error.message.includes('No valid business ideas found')) {
      return res.status(400).json({
        success: false,
        message: 'No valid business ideas found in the CSV file. Please check your data format.',
        error: error.message
      });
    }

    if (error.message.includes('CSV parsing error')) {
      return res.status(400).json({
        success: false,
        message: 'Error parsing CSV file. Please check the file format.',
        error: error.message
      });
    }

    if (error.message.includes('validation failed')) {
      return res.status(400).json({
        success: false,
        message: 'Data validation failed. Please check required fields and data types.',
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to import business ideas',
      error: error.message
    });
  }
}


module.exports = { bulkImportPainPointsController, bulkImportBusinessIdeasController };