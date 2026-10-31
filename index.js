import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";

const app = express();
const PORT = process.env.PORT || 5000;
const mongoDbUri = process.env.MONGO_DB_URI;

const client = new MongoClient(mongoDbUri);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const db = client.db("studioSpaceDB");
if (!db) {
  console.error("Failed to connect to the database.");
  process.exit(1);
} else {
  console.log("Connected to the database successfully.");
}

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
