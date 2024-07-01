const express = require('express')
const cors = require('cors')
const db = require('./db')
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(bodyParser.json());

PORT = 5000

const corsOptions = {
    origin: 'http://localhost:3000', // Allow requests from React development server
    methods: ['POST', 'GET'], // Allow only POST requests
    allowedHeaders: ['Content-Type'], // Allow only Content-Type header
  };

app.use(cors(corsOptions));
app.options('/checkDates', cors(corsOptions)); // Enable preflight request handling
app.options('/getEvents', cors(corsOptions)); // Enable preflight request handling
app.options('/clearUpdatedJson', cors(corsOptions)); // Enable preflight request handling
app.options('/signup', cors(corsOptions)); // Enable preflight request handling
app.options('/signin', cors(corsOptions)); // Enable preflight request handling


app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})



//Sign Up Credentials
app.post('/SignUp', cors(corsOptions) ,(req, res) => {
  const { name, email, password } = req.body;
  
  // Check if user already exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Insert new user
    db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
      [name, email, password], 
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Server error' });
        }
        res.status(201).json({ message: 'User created successfully', name: name });
      }
    );
  });
});

// Sign-in route
app.post('/SignIn', cors(corsOptions) ,(req, res) => {
  const { email, password } = req.body;
  
  // Find user and check password
  db.query('SELECT id,name FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = results[0];
    // console.log(user)
    res.json({
      message: 'Signed in successfully',
      userId: user.id,
      name: user.name
    });
  });
});


// Fetching Start Date and End Date
app.get('/getDate',cors(corsOptions) ,(req, res) => {
    const getStartDateQuery = "SELECT date FROM holidaytable WHERE name = 'Start_Session_SE/TE/BE'";
    const getEndDateQuery = "SELECT date FROM holidaytable WHERE name = 'End_Session_SE/TE/BE'";

    db.query(getStartDateQuery, (error, startDateResults) => {
        if (error) {
            console.log("Error Fetching Start Date", error.stack);
            return res.status(500).json({ msg: "Error fetching start date" });
        } else {
            db.query(getEndDateQuery, (error, endDateResults) => {
                if (error) {
                    console.log("Error Fetching End Date", error.stack);
                    return res.status(500).json({ msg: "Error fetching end date" });
                } else {
                    res.json({
                        startDate: startDateResults[0]?.date.toISOString().split('T')[0],
                        endDate: endDateResults[0]?.date.toISOString().split('T')[0]
                    });
                }
            });
        }
    });
});


// Checking Working Dates
app.post('/checkDates', cors(corsOptions),(req, res) => {
    const { dates } = req.body;
  
    if (!dates || !Array.isArray(dates)) {
      return res.status(400).json({ msg: 'Invalid dates array' });
    }
  
    const query = `
      SELECT date,holiday
      FROM holidaytable
      WHERE date IN (?)`
    ;
  
    db.query(query, [dates], (err, results) => {
      if (err) {
        console.error('Error fetching holidays and events:', err);
        return res.status(500).json({ error: 'Error fetching holidays and events' });
      }
  
      const events = results;
      const holidays = [];
  
      events.forEach(event => {
        if (event.holiday == 1) {
          holidays.push(event.date);
        }
      });
  
      // Filter out holidays from dates array
      const filteredDates = dates.filter(date => !holidays.includes(date));
  
      res.json({ workingDaysList: filteredDates});
    });
  });


// Custom Data updating in json
app.post('/updateData', cors(corsOptions), (req, res) => {
  const updatedData = req.body; // Assuming req.body contains updated data
  const clientJsonFilePath = path.join(__dirname, '..', 'client', 'public', 'JSON', 'updated.json');
  // Write updated data to a new file
  fs.writeFile(clientJsonFilePath, JSON.stringify(updatedData, null, 2), (err) => {
    if (err) {
      console.error('Error writing updated data:', err);
      return res.status(500).json({ error: 'Error writing updated data' });
    }
    console.log('Data updated successfully in JSON/updated.json');
    res.json({ msg: 'Data updated successfully' });
  });
});

//Update Existing Holiday or Event
app.put('/updateHoliday/:id', cors(corsOptions), (req, res) => {
  const { id } = req.params;
  const { date, name, type, institute_level, department_level, holiday } = req.body;

  // SQL query to update the holiday entry
  const query = `
    UPDATE holidaytable 
    SET 
      date = ?, 
      name = ?, 
      type = ?, 
      institute_level = ?, 
      department_level = ?, 
      holiday = ?
    WHERE 
      id = ?`;

  db.query(query, [date, name, type, institute_level, department_level, holiday, id], (err, result) => {
    if (err) {
      console.error('Error updating holiday:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    res.json({ message: 'Holiday updated successfully' });
  });
});

//Creation of Holiday
app.post('/createHoliday', cors(corsOptions), (req, res) => {
  const { date, name, type, institute_level, department_level, holiday } = req.body;

  const query = 'INSERT INTO holidaytable (date, name, type, institute_level, department_level, holiday) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [date, name, type, institute_level, department_level, holiday];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error creating holiday:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.status(201).json({ message: 'Holiday created successfully', id: result.insertId });
  });
});


app.get('/getHolidayByDate', cors(corsOptions), (req, res) => {
  const { date } = req.query;

  const query = 'SELECT * FROM holidaytable WHERE date = ?';
  db.query(query, [date], (err, results) => {
    if (err) {
      console.error('Error fetching holiday:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json(null); // No holiday found
    }

    res.json(results[0]); // Return the first matching holiday
  });
});


//Fetching
app.get('/getEvents', (req, res) => {
  const sql = 'SELECT name, date, holiday, institute_level, department_level FROM holidaytable';
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Query failed: ' + err });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ error: 'No events found' });
      return;
    }

    const events = result;
    const holidays = [];
    const instituteLevelEvents = [];
    const departmentEvents = [];

    events.forEach(event => {
      if (event.holiday == 1) {
        holidays.push(event.date);
      }
      if (event.institute_level == 1) {
        instituteLevelEvents.push(event.date);
      }
      if (event.department_level == 1) {
        departmentEvents.push(event.date);
      }
    });

    res.json({
      events,
      holidays,
      instituteLevelEvents,
      departmentEvents
    });
  });
});




//Clearing Updated.json after logout.
app.post('/clearUpdatedJson',cors(corsOptions), (req, res) => {
  const filePath = path.join(__dirname, '..', 'client', 'public', 'JSON', 'updated.json');
  fs.writeFile(filePath, JSON.stringify(['{}']), (err) => {
    if (err) {
      return res.status(500).send('Error clearing updated.json');
    }
    res.sendStatus(200);
  });
});