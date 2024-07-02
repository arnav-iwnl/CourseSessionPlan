import React, { useState } from 'react';
import CalendarTable from './CalendarComponent';
import EventScheduler from './EventScheduler';
import { useAuth } from '../../Context/authContext';



const ParentComponent = () => {
  const [events, setEvents] = useState([]);
  const { user } = useAuth()

  // Function to handle event creation or update
  const handleEventCreate = (newEvent) => {
    // Update the events state with the new or updated event
    const updatedEvents = events.map(event => (event.id === newEvent.id ? newEvent : event));
    setEvents(updatedEvents);
  };

  return (
    <div>
      <CalendarTable events={events} />
      {user?.role === 'hod' && <EventScheduler onEventCreate={handleEventCreate} />}
    </div>
  );
};

export default ParentComponent;
