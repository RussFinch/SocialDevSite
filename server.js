// bring express framework into server
const express = require('express');
// bring mongoose frmework into server for connecting to mongDB.
const mongoose = require('mongoose');
// bring bodyParser into server so messages can be parsed for res contents
const bodyParser = require('body-parser');
// bring routes files into server
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

// initialise express as variable app
const app = express();

// Body parser required middleware
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

//DB Config
const db = require('./config/keys').mongoURI;

// connect to mongoDB using mongoose.
mongoose
  .connect(db, {
    useNewUrlParser: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err))

// route to route of localhost on port 5000.
// send text to browser.
app.get('/', (req, res) => res.send('Hello World'));

// Add routes to server.
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

// variable port set to 5000.  Set in this fashion for Heroku or run on 5000 local.
const port = process.env.PORT || 5000;

// set variable app to listen on port 5000.
// return server running on variable port to console.
app.listen(port, () => console.log(`Server running on port ${port}`));