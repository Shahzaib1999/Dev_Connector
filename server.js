const express = require('express'),
     mongoose = require('mongoose'),
   bodyParser = require('body-parser'),
     passport = require('passport');
 

const users = require('./routes/api/users');
const posts = require('./routes/api/posts');
const profile = require('./routes/api/profile');

const app = express();

// bodyParser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// DB config
const db = require('./config/keys').mongoURI;

// connect to DB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('DB connected');
}).catch(err => {
    console.log(err);
});

// passport middleware
app.use(passport.initialize());

// passport config
require('./config/passport')(passport);

// Routes
app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/profile', profile);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));