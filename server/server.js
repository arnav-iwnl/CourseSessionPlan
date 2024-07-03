const express = require('express')
const cors = require('cors')
const db = require('./db')
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { loginController, signUpController } = require('./Controller/login_signup');
const { updateHolidayController, createHolidayController, getHolidayController } = require('./Controller/holidayController');
const { getDateController, checkDateController, updateDateController } = require('./Controller/dateController');
const { getEventController } = require('./Controller/eventController');

const app = express();

app.use(bodyParser.json());
PORT = 5000

const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from React development server
  methods: ['POST', 'GET', 'PUT'], // Allow only POST requests
  allowedHeaders: ['Content-Type'], // Allow only Content-Type header
};

app.use(cors(corsOptions));
app.options('/checkDates', cors(corsOptions)); // Enable preflight request handling
app.options('/updateData', cors(corsOptions)); // Enable preflight request handling
app.options('/getEvents', cors(corsOptions)); // Enable preflight request handling
app.options('/clearUpdatedJson', cors(corsOptions)); // Enable preflight request handling
app.options('/signup', cors(corsOptions)); // Enable preflight request handling
app.options('/signin', cors(corsOptions)); // Enable preflight request handling
app.options('/updateHoliday:id', cors(corsOptions)); // Enable preflight request handling


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
})


//Sign Up Credentials
app.post('/SignUp', cors(corsOptions), signUpController);

// Sign-in route
app.post('/SignIn', cors(corsOptions), loginController);


// Fetching Start Date and End Date
app.get('/getDate', cors(corsOptions), getDateController);


// Checking Working Dates
app.post('/checkDates', cors(corsOptions), checkDateController);


// Custom Data updating in json
app.post('/updateData', cors(corsOptions), updateDateController);

//Update Existing Holiday or Event
app.put('/updateHoliday/:id', cors(corsOptions), updateHolidayController);

//Creation of Holiday
app.post('/createHoliday', cors(corsOptions), createHolidayController);


app.get('/getHolidayByDate', cors(corsOptions), getHolidayController);


//Fetching
app.get('/getEvents', cors(corsOptions),getEventController);




//Clearing Updated.json after logout.
app.post('/clearUpdatedJson', cors(corsOptions), (req, res) => {
  const filePath = path.join(__dirname, '..', 'client', 'public', 'JSON', 'updated.json');
  fs.writeFile(filePath, JSON.stringify(['']), (err) => {
    if (err) {
      return res.status(500).send('Error clearing updated.json');
    }
    res.sendStatus(200);
  });
});