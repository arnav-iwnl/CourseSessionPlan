const db = require('../db')

const getEventController = (req, res) => {
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
}

module.exports = {
    getEventController
}