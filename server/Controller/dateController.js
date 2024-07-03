const db = require('../db')
const path = require('path');
const fs = require('fs');



const getDateController = (req, res) => {
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
}

const checkDateController = (req, res) => {
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

        res.json({ workingDaysList: filteredDates });
    });
}

const updateDateController = (req, res) => {
    const updatedData = req.body; // Assuming req.body contains updated data

    const clientJsonFilePath = path.join(__dirname,'..','..', 'client', 'public', 'JSON', 'updated.json');
    console.log(clientJsonFilePath)

    // Write updated data to a new file
    fs.writeFile(clientJsonFilePath, JSON.stringify(updatedData, null, 2), (err) => {
        if (err) {
            console.error('Error writing updated data:', err);
            return res.status(500).json({ error: 'Error writing updated data' });
        }
        console.log('Data updated successfully in JSON/updated.json');
        res.json({ msg: 'Data updated successfully' });
    });
}

module.exports = {
    getDateController,
    checkDateController,
    updateDateController,
}