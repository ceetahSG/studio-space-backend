import "dotenv/config";
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
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
  res.send(studios);
});

app.get("/featured-studios", async (req, res) => {
  const featuredStudios = await studiosCollection.find().limit(6).toArray();
  res.send(featuredStudios);
});

app.get("/studio/id/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid studio ID" });
  }

  const studio = await studiosCollection.findOne({ _id: new ObjectId(id) });
  res.send(studio);
});
app.get("/studio/:category", async (req, res) => {
  const { category } = req.params;
  const studios = await studiosCollection.find({ category }).toArray();
  res.send(studios);
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
