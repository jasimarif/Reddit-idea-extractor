const express = require('express');
const router = express.Router();
const {
  generateIdeas,
  getBusinessIdeas,
  getBusinessIdea,
} = require('../controllers/marketGap.controller');


router.post('/generate-ideas', generateIdeas);

router.get('/ideas', getBusinessIdeas);

router.get('/ideas/:id', getBusinessIdea);

module.exports = router;
