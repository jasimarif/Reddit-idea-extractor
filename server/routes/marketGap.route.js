const express = require('express');
const router = express.Router();
const {
  generateIdeas,
  getBusinessIdeas,
  getBusinessIdea,
  getBusinessIdeasByPainPointId,
} = require('../controllers/marketGap.controller');


router.post('/generate-ideas', generateIdeas);

router.get('/ideas', getBusinessIdeas);

router.get('/ideas/:id', getBusinessIdea);

router.get('/ideas/by-painpoint/:painPointId', getBusinessIdeasByPainPointId);

module.exports = router;
