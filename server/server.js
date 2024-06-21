const express = require('express')
const cors = require('cors')
const db = require('./db')
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(express.json())
app.use(bodyParser.json());

PORT = 5000

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})

app.get('/getDate', (req, res) => {
    const getStartDateQuery = "SELECT date FROM holidaytable WHERE name = 'START'";
    const getEndDateQuery = "SELECT date FROM holidaytable WHERE name = 'END'";

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
                        startDate: startDateResults[0]?.date,
                        endDate: endDateResults[0]?.date
                    });
                }
            });
        }
    });
});


app.get('/holidays', (req, res) => {
    const holidayColQuery = "SELECT holiday,date FROM holidaytable"

    db.query(holidayColQuery, (error, results) => {
        if (error) {
            console.log("Error Fetching Data", error.stack);
            res.status(500).json({ msg: "Error" })
        }
        else {
            res.json(results)
        }
    })
})


app.post('/getHolidays', (req, res) => {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
        return res.status(400).json({ msg: 'Start date and end date are required' });
    }

    const query = `
      SELECT date, holiday 
      FROM holidaytable 
      WHERE date >= ? AND date <= ?
    `;

    db.query(query, [startDate, endDate], (error, results) => {
        if (error) {
            console.log('Error fetching holidays:', error.stack);
            return res.status(500).json({ msg: 'Error fetching holidays' });
        }
        res.json(results);
    });
});


