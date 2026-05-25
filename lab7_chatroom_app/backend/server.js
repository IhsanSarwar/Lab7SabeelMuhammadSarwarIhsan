require('dotenv').config(); // so we can use .env to store settings
const express = require('express');
const mongoose = require('mongoose'); // for mongodb
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;
const app = express();

app.use(cors({ // browsers block requests from different origins unless the server explicitly allows it
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use(session({
    secret: 'chatroom-secret',
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());

app.use(passport.session());

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB Connected');
});

const User = require('./models/User');
const Room = require('./models/Room');
const Message = require('./models/Message');

passport.use(
  new LocalStrategy(
    async function(username, password, done) {
      const user = await User.findOne({
        username: username,
        password: password
      });

      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(
  async function(id, done) {
    const user = await User.findById(id);
    done(null, user);
  }
);

function generateRoomId() {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[
      Math.floor(Math.random() * chars.length)
    ];
  }
  return id;
}

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.json({
      success: false
    });
  }
}

app.post('/signup', async (req, res) => {
  const user = await User.create({
    username: req.body.username,
    password: req.body.password
  });
  res.json(user);
});

app.post(
  '/login',
  passport.authenticate('local'),
  function(req, res) {
    res.json({
      success: true
    });
  }
);

app.get('/rooms', checkAuth, async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

app.post('/create-room', checkAuth, async (req, res) => {
  const room = await Room.create({
    roomId: generateRoomId()
  });

  res.json(room);
});

app.get('/messages/:roomId', checkAuth, async (req, res) => {
  const messages = await Message.find({
    roomId: req.params.roomId
  });
  res.json(messages);
});

app.post('/send-message', checkAuth, async (req, res) => {
  const message = await Message.create({
    roomId: req.body.roomId,
    username: req.user.username,
    text: req.body.text,
    replies: []
  });
  res.json(message);
});

app.post('/reply/:messageId', checkAuth, async (req, res) => {
  const message = await Message.findById(
    req.params.messageId
  );

  message.replies.push({
    username: req.user.username,
    text: req.body.text
  });
  await message.save();
  res.json(message);
});

app.listen(8080, () => {
  console.log('Server running on port 8080');
});
