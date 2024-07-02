import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { Modal, Button, Form } from 'react-bootstrap';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/EventScheduler.css';


const EventScheduler = ({ onEventCreate }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [otherEventName, setOtherEventName] = useState('');
  const [eventType, setEventType] = useState('teaching');
  const [instituteState, setInstituteState] = useState(true);
  const [holidayState, setHolidayState] = useState(false);
  const [departmentState, setDepartmentState] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [eventId, setEventId] = useState(null);

  useEffect(() => {
    console.log('EventScheduler component mounted');
    return () => {
      console.log('EventScheduler component will unmount');
      setModalIsOpen(false);  // Ensure modal is closed when component unmounts
    };
  }, []);

  useEffect(() => {
    if (modalIsOpen && selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      console.log('Fetching holiday data for date:', dateStr);
      fetch(`http://localhost:5000/getHolidayByDate?date=${dateStr}`)
        .then(response => {
          if (!response.ok) {
            if (response.status === 404) {
              console.log('No holiday found for date:', dateStr);
              return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Received data:', data);
          if (data) {
            setIsUpdate(true);
            setEventId(data.id);
            setEventName(data.name);
            setEventType(data.type);
            setInstituteState(data.institute_level);
            setHolidayState(data.holiday);
            setDepartmentState(data.department_level);
          } else {
            resetFormFields();
          }
        })
        .catch(error => {
          console.error('Error fetching event data:', error.message);
          resetFormFields();
        });
    }
  }, [modalIsOpen, selectedDate]);

  const handleDateClick = (date) => {
    console.log('Date clicked:', date);
    setSelectedDate(date);
    setModalIsOpen(true);
  };

  const handleModalClose = () => {
    console.log('Closing modal');
    setModalIsOpen(false);
    resetFormFields();
  };

  const resetFormFields = () => {
    setEventName('');
    setOtherEventName('');
    setEventType('teaching');
    setInstituteState(true);
    setDepartmentState(false);
    setHolidayState(false);
    setIsUpdate(false);
    setEventId(null);
  };

  const handleEventCreateOrUpdate = () => {
    if (selectedDate && (eventName.trim() || otherEventName.trim())) {
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

      console.log(`Sending ${method} request to ${url} with body:`, body);

      fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Event created/updated successfully:', data);
          onEventCreate(); // Trigger callback if needed
          handleModalClose();
        })
        .catch(error => {
          console.error('Error creating/updating event:', error.message);
          // You might want to show an error message to the user here
        });
    }
  };

  console.log('Rendering EventScheduler, modalIsOpen:', modalIsOpen);

  return (
    <div className="event-scheduler">
      <h2>Event Scheduler Component</h2>
      <Calendar
        onClickDay={handleDateClick}
        value={selectedDate}
        showNeighboringMonth={false}
      />
      <Modal show={modalIsOpen} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isUpdate ? 'Update Event' : 'Create New Event'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); handleEventCreateOrUpdate(); }}>
            <Form.Group>
              <Form.Label>Select Your Event:</Form.Label>
              <Form.Control
                as="select"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Start_For_SE/TE/BE">Start For SE/TE/BE</option>
                <option value="End_For_SE/TE/BE">End For SE/TE/BE</option>
                <option value="Start_For_FE">Start For FE</option>
                <option value="End_For_FE">End For FE</option>
                <option value="SE/TE/BE_IA1">SE/TE/BE IA 1</option>
                <option value="FE_IA1">FE IA 1</option>
                <option value="SE/TE/BE_IA2">SE/TE/BE IA 2</option>
                <option value="FE_IA2">FE IA 2</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Check
                type="checkbox"
                label="Institute Level"
                checked={instituteState}
                onChange={() => setInstituteState(!instituteState)}
              />
              <Form.Check
                type="checkbox"
                label="Department Level"
                checked={departmentState}
                onChange={() => setDepartmentState(!departmentState)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Other Event:</Form.Label>
              <Form.Control
                type="text"
                value={otherEventName}
                onChange={(e) => setOtherEventName(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Teaching / Non Teaching Day:</Form.Label>
              <Form.Control
                as="select"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="teaching">Teaching</option>
                <option value="non-teaching">Non-Teaching</option>
              </Form.Control>
              <Form.Check
                type="checkbox"
                label="Holiday"
                checked={holidayState}
                onChange={() => setHolidayState(!holidayState)}
              />
            </Form.Group>
            <Button type="submit">Submit</Button>
            <Button variant="secondary" onClick={handleModalClose}>Close</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EventScheduler;
