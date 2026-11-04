import "dotenv/config";
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import { createRemoteJWKSet, jwtVerify } from "jose";

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

const verifyApi = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  // console.log("Authorization header:", authHeader);

  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  console.log("Received token:", token);
  if (!token) {
    return res.status(401).send({ message: "Unauthorized" });
  }
  const JWKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
  );

  try {
    const { payload } = await jwtVerify(token, JWKS);
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(500).send({ message: "Token is invalid" });
  }
};

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

app.post("/booking", verifyApi, async (req, res) => {
  const bookingData = { ...req.body };
  const bookingDate = new Date(bookingData.date);

  if (
    !bookingData.studioId ||
    !bookingData.date ||
    Number.isNaN(bookingDate.getTime())
  ) {
    return res
      .status(400)
      .send({ message: "A valid studio ID and booking date are required" });
  }

  const startOfDay = new Date(bookingDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  console.log("Received booking data:", bookingData);

  const ExistingBooking = await bookingsCollection.findOne({
    studioId: bookingData.studioId,
    $or: [
      { date: { $gte: startOfDay, $lt: endOfDay } },
      { date: bookingData.date },
      { date: bookingDate.toISOString() },
    ],
  });
  console.log("Existing booking check:", ExistingBooking);
  if (ExistingBooking) {
    return res
      .status(400)
      .send({ message: "Booking already exists for this date" });
  }
  const result = await bookingsCollection.insertOne({
    ...bookingData,
    date: bookingDate,
  });
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

app.post("/studios", verifyApi, async (req, res) => {
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

app.get("/studios/:email", verifyApi, async (req, res) => {
  const { email } = req.params;
  console.log("Received request for studios with email:", email);
  const result = await studiosCollection.find({ ownerEmail: email }).toArray();
  res.send(result);
});

app.delete("/studios/:id", verifyApi, async (req, res) => {
  const { id } = req.params;
  const result = await studiosCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

app.patch("/studio/:id", verifyApi, async (req, res) => {
  const { id } = req.params;
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

export default app;
