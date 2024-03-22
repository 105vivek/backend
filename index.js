const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());

// connect to database
const main = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://105vivek:vivek123@cluster0.ffx238l.mongodb.net/BE"
    );
    console.log("connected to database");
  } catch (error) {
    console.log(error);
  }
};
const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String,
});
const Flight = mongoose.model("Flight", {
  airline: String,
  flightNo: String,
  departure: String,
  arrival: String,
  departureTime: Date,
  arrivalTime: Date,
  seats: Number,
  price: Number,
});
// register a user
app.get("/", (req, res) => {
  res.end("hello");
});
app.post(`/api/register`, async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      return;
    }
    console.log("Hashed password:", hashedPassword);
  });
  const user = new User({ name, email, password: hashedPassword });
  await User.create(user);
  res.status(201).json({ message: "User registered successfully" });
});
// login user and return JWT
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const isPasswordValid = bcrypt.compare(
    password,
    user.password,
    (err, result) => {
      if (err) {
        console.error("Error comparing hashes:", err);
        return;
      }
      if (result) {
        console.log("Passwords match");
      } else {
        res.status(401).json({ error: "Invalid email or password" });
        console.log("Passwords do not match");
      }
    }
  );
  //   if (!isPasswordValid) {
  //     return res.status(401).json({ error: "Invalid email or password" });
  //   }
  const token = jwt.sign({ userId: user._id }, "secret", { expiresIn: "1h" });
  res.status(201).json({ token });
});
console.log("hi");
// get all flights
app.get("/api/flights", async (req, res) => {
  const flights = await Flight.find();
  res.json(flights);
});
// Add a new flight
app.post("/api/flights", async (req, res) => {
  const flight = new Flight(req.body);
  await flight.save();
  res.status(201).json({ message: "Flight added successfully" });
});
main();
const port = 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
