const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  costInPoints: { type: Number, required: true },
});

const Reward = mongoose.model('Reward', rewardSchema);
module.exports = Reward;
