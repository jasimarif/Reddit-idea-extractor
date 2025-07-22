const { generateLandingPage } = require("../services/landingPage.service");
const {
  getLandingPageByBusinessIdeaId,
} = require("../services/landingPage.service");

async function generateLandingPageHandler(req, res) {
  try {
    const { businessIdeaId } = req.body;
    if (!businessIdeaId) {
      return res.status(400).json({ error: "businessIdeaId is required" });
    }
    const landingPage = await generateLandingPage(businessIdeaId);
    res.status(201).json({ landingPage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getLandingPageByBusinessIdeaIdHandler(req, res) {
  try {
    const { businessIdeaId } = req.params;
    if (!businessIdeaId) {
      return res.status(400).json({ error: "businessIdeaId is required" });
    }

    const landingPage = await getLandingPageByBusinessIdeaId(businessIdeaId);

    if (!landingPage) {
      return res.status(404).json({ error: "Landing page not found" });
    }

    res.status(200).json({ landingPage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  generateLandingPageHandler,
  getLandingPageByBusinessIdeaIdHandler,
};
