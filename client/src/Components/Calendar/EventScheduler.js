
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { Modal, Button, Form } from 'react-bootstrap';
import { createClient } from '@supabase/supabase-js';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/EventScheduler.css';

// Create Supabase client with proper configuration
const supabase = createClient(
  'https://bogosjbvzcfcldahqzqv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ29zamJ2emNmY2xkYWhxenF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NTg2NjEsImV4cCI6MjA1MjQzNDY2MX0.UlaFnLDqXJgVF9tYCOL0c0hjCAd4__Yq47K5mVYdXcc',
  {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
);

const EVENT_TYPES = {
  TEACHING: 'teaching',
  NON_TEACHING: 'non-teaching'
};

const PREDEFINED_EVENTS = [
  { value: 'Start Session for SE/TE/BE', label: 'Start Session for SE/TE/BE' },
  { value: 'End Session for SE/TE/BE', label: 'End Session for SE/TE/BE' },
  { value: 'Start_For_FE', label: 'Start For FE' },
  { value: 'End_For_FE', label: 'End For FE' },
  { value: 'SE/TE/BE_IA1', label: 'SE/TE/BE IA 1' },
  { value: 'FE_IA1', label: 'FE IA 1' },
  { value: 'SE/TE/BE_IA2', label: 'SE/TE/BE IA 2' },
  { value: 'FE_IA2', label: 'FE IA 2' }
];

const EventScheduler = ({ onEventCreate }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    customEventName: '',
    eventType: EVENT_TYPES.TEACHING,
    instituteLevel: true,
    departmentLevel: false,
    isHoliday: false
  });
  const [isUpdate, setIsUpdate] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!modalIsOpen || !selectedDate) return;

    const fetchHolidayData = async () => {
      setLoading(true);
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        
        // Use proper date format and headers for the query
        const { data, error } = await supabase
          .from('holidaytable')
          .select('*')
          .eq('date', dateStr);

        if (error) throw error;

        if (data && data.length > 0) {
          const eventData = data[0];
          setIsUpdate(true);
          setEventId(eventData.id);
          setFormData({
            eventName: eventData.name,
            customEventName: '',
            eventType: eventData.type,
            instituteLevel: Boolean(eventData.institute_level),
            departmentLevel: Boolean(eventData.department_level),
            isHoliday: Boolean(eventData.holiday)
          });
        } else {
          resetFormFields();
        }
      } catch (err) {
        console.error('Error fetching holiday data:', err);
        setError(err.message);
        resetFormFields();
      } finally {
        setLoading(false);
      }
    };

    fetchHolidayData();
  }, [modalIsOpen, selectedDate]);

  const resetFormFields = () => {
    setFormData({
      eventName: '',
      customEventName: '',
      eventType: EVENT_TYPES.TEACHING,
      instituteLevel: true,
      departmentLevel: false,
      isHoliday: false
    });
    setIsUpdate(false);
    setEventId(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!selectedDate || (!formData.eventName && !formData.customEventName)) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      if(formData.eventType=="End Session for SE/TE/BE" || formData.eventName == "End Session for SE/TE/BE"){
        formData.eventName = "End Session for SE/TE/BE";
        formData.eventType ="End Session for SE/TE/BE"
        formData.instituteLevel=false;
        formData.isHoliday=false;
      }
      if( formData.eventType=="Start Session for SE/TE/BE" || formData.eventName == "Start Session for SE/TE/BE" ){
        formData.eventName = "Start Session for SE/TE/BE";
        formData.eventType ="Start Session for SE/TE/BE"
        formData.departmentLevel=false;
        formData.isHoliday=false;
      }
      const eventData = {
        date: selectedDate.toISOString().split('T')[0],
        name: formData.eventName || formData.customEventName,
        type: formData.eventType,
        institute_level: Number(formData.instituteLevel),
        department_level: Number(formData.departmentLevel),
        holiday: Number(formData.isHoliday)
      };
      if (isUpdate && eventId) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('holidaytable')
          .update(eventData)
          .eq('name', eventData.name);

        if (updateError) throw updateError;
      } else {
        // Insert new record without specifying ID
        const { error: insertError } = await supabase
          .from('holidaytable')
          .insert([eventData]);

        if (insertError) throw insertError;
      }

      onEventCreate?.();
      handleModalClose();
    } catch (err) {
      console.error('Database operation failed:', err);
      setError(err.message || 'An error occurred while saving the event');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalIsOpen(false);
    resetFormFields();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="event-scheduler">
      <h2>Event Scheduler</h2>
      <Calendar
        onClickDay={date => {
          setSelectedDate(date);
          setModalIsOpen(true);
        }}
        value={selectedDate}
        showNeighboringMonth={false}
      />
      
      <Modal show={modalIsOpen} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isUpdate ? 'Update Event' : 'Create New Event'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select Event Type</Form.Label>
              <Form.Control
                as="select"
                value={formData.eventName}
                onChange={e => handleInputChange('eventName', e.target.value)}
                disabled={loading}
              >
                <option value="">Select an event</option>
                {PREDEFINED_EVENTS.map(event => (
                  <option key={event.value} value={event.value}>
                    {event.label}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Custom Event Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.customEventName}
                onChange={e => handleInputChange('customEventName', e.target.value)}
                placeholder="Enter custom event name"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Institute Level"
                checked={formData.instituteLevel}
                onChange={e => handleInputChange('instituteLevel', e.target.checked)}
                disabled={loading}
              />
              <Form.Check
                type="checkbox"
                label="Department Level"
                checked={formData.departmentLevel}
                onChange={e => handleInputChange('departmentLevel', e.target.checked)}
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Event Classification</Form.Label>
              <Form.Control
                as="select"
                value={formData.eventType}
                onChange={e => handleInputChange('eventType', e.target.value)}
                disabled={loading}
              >
                <option value={EVENT_TYPES.TEACHING}>Teaching</option>
                <option value={EVENT_TYPES.NON_TEACHING}>Non-Teaching</option>
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Holiday"
                checked={formData.isHoliday}
                onChange={e => handleInputChange('isHoliday', e.target.checked)}
                disabled={loading}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleModalClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isUpdate ? 'Update' : 'Create')} Event
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EventScheduler;