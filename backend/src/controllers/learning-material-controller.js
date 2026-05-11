import LearningMaterial from '../models/learning-material.js';

const learningMaterialController = {
  getAllMaterials: async (req, res) => {
    try {
      const materials = await LearningMaterial.find().sort({ createdAt: -1 });
      res.json(materials);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  createMaterial: async (req, res) => {
    try {
      const material = new LearningMaterial({
        subject: req.body.subject,
        topic: req.body.topic,
        content: req.body.content
      });
      await material.save();
      res.status(201).json(material);
    } catch (err) {
      console.error('Error in createMaterial:', err);
      res.status(400).json({ error: err.message });
    }
  }
};

export default learningMaterialController;