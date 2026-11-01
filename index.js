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
const bookingsCollection = db.collection("bookings");

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

app.post("/booking", async (req, res) => {
  const bookingData = req.body;
  const result = await bookingsCollection.insertOne(bookingData);
  res.send(result);
});

app.get("/bookings/:email", async (req, res) => {
  const { email } = req.params;
  const result = await bookingsCollection.find({ userEmail: email }).toArray();
  res.send(result);
});

app.delete("/booking/:id", async (req, res) => {
  const { id } = req.params;
  const result = await bookingsCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

app.post("/studios", async (req, res) => {
  const studioData = req.body;
  const result = await studiosCollection.insertOne(studioData);
  res.send(result);
});

app.put("/studios/:id", async (req, res) => {
  const { id } = req.params;
  const updatedStudioData = req.body;
  const result = await studiosCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedStudioData },
  );
  res.send(result);
});

app.get("/studios/:email", async (req, res) => {
  const { email } = req.params;
  console.log("Received request for studios with email:", email);
  const result = await studiosCollection.find({ hostEmail: email }).toArray();
  res.send(result);
});

app.delete("/studios/:id", async (req, res) => {
  const { id } = req.params;
  const result = await studiosCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

app.patch("/studio/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Received request to update studio with ID:", id);
  const updatedFields = req.body;
  const result = await studiosCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedFields },
  );
  res.send(result);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
