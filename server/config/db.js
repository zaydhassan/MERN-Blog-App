const mongoose = require("mongoose");
<<<<<<< HEAD

// Connect to MongoDB using MONGO_URL. A missing/invalid URL or an unreachable
// server is a fatal, start-of-run condition — if we swallowed it (as the old
// code did) the server would stay up DB-less and every query would buffer to a
// 10s timeout, surfacing as confusing 500s like
// "buffering timed out after 10000ms". Fail fast instead.
const connectDB = async () => {
  const url = process.env.MONGO_URL;
  if (!url) {
    console.error("FATAL: MONGO_URL is not set. Copy .env.example to .env and provide a connection string.");
    process.exit(1);
  }

  try {
    await mongoose.connect(url);
    console.log("Mongodb Connected");
  } catch (error) {
    console.error(`MONGO Connect Error: ${error.message}`);
    process.exit(1);
=======
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(
      `Mongodb Connected`  
    );
  } catch (error) {
    console.log(`MONGO Connect Error ${error}`);
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
  }
};

module.exports = connectDB;