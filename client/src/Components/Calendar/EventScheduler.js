import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import Modal from 'react-modal';
import './styles/EventScheduler.css';

const EventScheduler = ({ onEventCreate }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [otherEventName, setOtherEventName] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('teaching'); // Default to teaching
  const [instituteState, setInstituteState] = useState(true);
  const [holidayState, setHolidayState] = useState(false);
  const [departmentState, setDepartmentState] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [eventId, setEventId] = useState(null);

  // Handle date click and fetch event details if any
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setModalIsOpen(true);

    // Fetch existing event details
    fetch(`http://localhost:5000/getHolidayByDate?date=${date.toISOString().split('T')[0]}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          setIsUpdate(true);
          setEventId(data.id);
          setEventName(data.name);
          setEventType(data.type);
          setInstituteState(data.institute_level);
          setHolidayState(data.holiday);
          setDepartmentState(data.department_level);
        } else {
          setIsUpdate(false);
          setEventId(null);
          resetFormFields();
        }
      })
      .catch(error => console.error('Error:', error));
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalIsOpen(false);
    resetFormFields();
    setIsUpdate(false);
    setEventId(null);
  };

  // Reset form fields
  const resetFormFields = () => {
    setEventName('');
    setEventType('teaching');
    setInstituteState(true);
    setDepartmentState(false);
    setHolidayState(false);
    setOtherEventName('');
  };

  // Handle event creation or update
  const handleEventCreateOrUpdate = () => {
    if (selectedDate && (eventName.trim() !== '' || otherEventName.trim() !== '')) {
      const body = {
        date: selectedDate.toISOString().split('T')[0],
        name: eventName.trim() || otherEventName.trim(),
        type: eventType,
        institute_level: instituteState,
        department_level: departmentState,
        holiday: holidayState
      };

      const url = isUpdate ? `http://localhost:5000/updateHoliday/${eventId}` : 'http://localhost:5000/createHoliday';
      const method = isUpdate ? 'PUT' : 'POST';

      fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        onEventCreate(); // Optional: Trigger callback if needed
        handleModalClose();
      })
      .catch(error => console.error('Error:', error));
    }
  };

  return (
    <div className="event-scheduler">
      <Calendar
        onClickDay={handleDateClick}
        value={selectedDate}
        showNeighboringMonth={false}
      />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleModalClose}
        className="modal"
        overlayClassName="overlay"
      >
        <h2>{isUpdate ? 'Update Event' : 'Create New Event'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleEventCreateOrUpdate(); }}>
          <div>
            <label>Select Your Event:</label>
            <select
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Start_For_SE/TE/BE">Start For SE/TE/BE</option>
              <option value="End_For_SE/TE/BE">End For SE/TE/BE</option>
              <option value="Start_For_FE">Start For FE</option>
              <option value="End_For_FE">End For FE</option>
              <option value="SE/TE/BE_IA1">SE/TE/BE IA 1</option>
              <option value="FR_IA1">FE IA1</option>
              <option value="SE/TE/BE_IA2">SE/TE/BE IA 2</option>
              <option value="FR_IA2">FE IA2</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <label>
              <input
                type="checkbox"
                name="institute"
                checked={instituteState}
                onChange={() => setInstituteState(!instituteState)}
              />
              Institute Level
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                name="Department"
                checked={departmentState}
                onChange={() => setDepartmentState(!departmentState)}
                style={{ marginLeft: '20px' }}
              />
              Department Level
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <label>Other Event:</label>
            <input
              style={{ height: '15px', marginTop: '10px' }}
              type="text"
              value={otherEventName}
              onChange={(e) => setOtherEventName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="eventType">Teaching / Non Teaching Day:</label>
            <select
              id="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="teaching">Teaching</option>
              <option value="non-teaching">Non-Teaching</option>
            </select>
            <label>
              <input
                type="checkbox"
                name="Holiday"
                checked={holidayState}
                onChange={() => setHolidayState(!holidayState)}
                style={{ marginLeft: '20px' }}
              />
              Holiday
            </label>
          </div>
          <div className="button-container">
            <button type="submit">Submit</button>
            <button type="button" onClick={handleModalClose}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventScheduler;
