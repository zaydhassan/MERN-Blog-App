<<<<<<< HEAD
const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  costInPoints: { type: Number, required: true },
});

const Reward = mongoose.model('Reward', rewardSchema);
module.exports = Reward;
=======
const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  costInPoints: { type: Number, required: true },
});

const Reward = mongoose.model('Reward', rewardSchema);
module.exports = Reward;
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
