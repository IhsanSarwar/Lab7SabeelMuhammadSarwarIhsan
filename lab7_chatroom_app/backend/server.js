require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();

// ✅ STEP 1: Middleware first — always before routes
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: "chatroom-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ STEP 2: Database connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB Connected");
});

// ✅ STEP 3: Models — must be required after mongoose connects
const User = require("./models/User");
const Room = require("./models/Room");
const Message = require("./models/Message");

// ✅ STEP 4: Passport config — needs User model to exist
passport.use(
  new LocalStrategy(async function (username, password, done) {
    const user = await User.findOne({ username, password });
    if (!user) return done(null, false);
    return done(null, user);
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  const user = await User.findById(id);
  done(null, user);
});

// ✅ STEP 5: Helper functions
function generateRoomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.json({ success: false });
  }
}

// ✅ STEP 6: Routes — now middleware is ready so these all work
app.post("/signup", async (req, res) => {
  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
  });
  res.json(user);
});

app.post("/login", passport.authenticate("local"), function (req, res) {
  res.json({ success: true });
});

app.post("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) return res.json({ success: false });
    res.json({ success: true });
  });
});

app.get("/me", checkAuth, (req, res) => {
  res.json({ username: req.user.username });
});

app.get("/rooms", checkAuth, async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

app.post("/create-room", checkAuth, async (req, res) => {
  const room = await Room.create({ roomId: generateRoomId() });
  res.json(room);
});

app.get("/messages/:roomId", checkAuth, async (req, res) => {
  const messages = await Message.find({ roomId: req.params.roomId });
  res.json(messages);
});

app.post("/send-message", checkAuth, async (req, res) => {
  const message = await Message.create({
    roomId: req.body.roomId,
    username: req.user.username,
    text: req.body.text,
    replies: [],
  });
  res.json(message);
});

app.post("/reply/:messageId", checkAuth, async (req, res) => {
  const message = await Message.findById(req.params.messageId);
  message.replies.push({ username: req.user.username, text: req.body.text });
  await message.save();
  res.json(message);
});

app.put("/messages/:messageId", checkAuth, async (req, res) => {
  const message = await Message.findById(req.params.messageId);
  if (message.username !== req.user.username) {
    return res.json({ success: false, error: "Not your message" });
  }
  message.text = req.body.text;
  await message.save();
  res.json(message);
});

app.delete("/messages/:messageId", checkAuth, async (req, res) => {
  const message = await Message.findById(req.params.messageId);
  if (message.username !== req.user.username) {
    return res.json({ success: false, error: "Not your message" });
  }
  await Message.findByIdAndDelete(req.params.messageId);
  res.json({ success: true });
});

app.post("/messages/:messageId/thumbsUp", checkAuth, async (req, res) => {
  const message = await Message.findByIdAndUpdate(
    req.params.messageId,
    { $inc: { thumbsUp: 1 } },
    { new: true }
  );
  res.json(message);
});

app.post("/messages/:messageId/thumbsDown", checkAuth, async (req, res) => {
  const message = await Message.findByIdAndUpdate(
    req.params.messageId,
    { $inc: { thumbsDown: 1 } },
    { new: true }
  );
  res.json(message);
});

// ✅ STEP 7: Start the server — always last
app.listen(8080, () => {
  console.log("Server running on port 8080");
});
