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
const mongoClient = await connectToMongoDB();
const db = mongoClient.db("studio-space");
const studiosCollection = db.collection("studios");

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/studios", async (req, res) => {
  const studios = await studiosCollection.find().toArray();
  res.json(studios);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
