const { z } = require("zod");
const db = require('../db')

const updateHolidayController = (req, res) => {
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
}

const createHolidayController = (req, res) => {
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
}

const getHolidayController = (req, res) => {
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
}

module.exports = {
    updateHolidayController,
    createHolidayController,
    getHolidayController
}