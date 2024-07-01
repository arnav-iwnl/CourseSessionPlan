// ParentComponent.js
import React, { useState } from 'react';
import CalendarTable from './CalendarComponent';
import EventScheduler from './EventScheduler';

const ParentComponent = () => {
  const [events, setEvents] = useState([]);

  const handleEventCreate = (newEvent) => {
    setEvents([...events, newEvent]);
  };

  return (
    <div>
        <CalendarTable events={events} />
        <EventScheduler onEventCreate={handleEventCreate} />

    </div>
  );
};

export default ParentComponent;
