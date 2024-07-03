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
                const currentDate = new Date(event.date);
                currentDate.setDate(currentDate.getDate() + 1);
                const date = new Date(currentDate);
                instituteLevelEvents.push(date.toISOString().split('T')[0]);
            }
            if (event.department_level == 1) {
                const currentDate = new Date(event.date);
                currentDate.setDate(currentDate.getDate() + 1);
                const date = new Date(currentDate);
                departmentEvents.push(date.toISOString().split('T')[0]);
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