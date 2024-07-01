import React, { useState, useEffect } from 'react';
import PdfDownloader from './pdf'; // Adjust the path as needed
import './styles/CalendarTable.css';

const CalendarTable = () => {
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [instituteLevelEvents, setInstituteLevelEvents] = useState([]);
  const [departmentEvents, setDepartmentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsResponse = await fetch('http://localhost:5000/getEvents');
        if (!eventsResponse.ok) {
          throw new Error(`Failed to fetch events: ${eventsResponse.statusText}`);
        }
  
        const eventsContentType = eventsResponse.headers.get("content-type");
        if (!eventsContentType || eventsContentType.indexOf("application/json") === -1) {
          const text = await eventsResponse.text();
          throw new Error(`Unexpected response: ${text}`);
        }
        const eventsData = await eventsResponse.json();
        if (eventsData.error) {
          throw new Error(eventsData.error);
        }
  
        const datesResponse = await fetch('http://localhost:5000/getDate');
        if (!datesResponse.ok) {
          throw new Error(`Failed to fetch dates: ${datesResponse.statusText}`);
        }
  
        const datesContentType = datesResponse.headers.get("content-type");
        if (!datesContentType || datesContentType.indexOf("application/json") === -1) {
          const text = await datesResponse.text();
          throw new Error(`Unexpected response: ${text}`);
        }
        const datesData = await datesResponse.json();
  
        setStartDate(datesData.startDate);
        setEndDate(datesData.endDate);
        setEvents(eventsData.events || []);
        setHolidays(eventsData.holidays || []);
        setInstituteLevelEvents(eventsData.instituteLevelEvents || []);
        setDepartmentEvents(eventsData.departmentEvents || []);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
        console.error('Fetch error:', error);
      }
    };
  
    fetchData(); // Initial fetch
  }, []);

  const getWeekdayName = (weekdayIndex) => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return weekdays[weekdayIndex];
  };

  const getEventsForMonth = (year, month) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  };

  const getColorClass = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const prevDate = new Date(dateString);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateString = prevDate.toISOString().split('T')[0];
    
    if (holidays.includes(prevDateString)) {
      return 'red';
    }
    if (instituteLevelEvents.includes(prevDateString)) {
      return 'green';
    }
    if (departmentEvents.includes(prevDateString)) {
      return 'blue';
    }
    return '';
  };

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const months = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let currentDate = new Date(start.getFullYear(), start.getMonth(), 1);

  while (currentDate <= end) {
    months.push(new Date(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="calendar-container">
      <div className="date-selector">
        <label htmlFor="startDate">Start Date:</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          // onChange={handleStartDateChange}
          readOnly
        />
        <label htmlFor="endDate">End Date:</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          // onChange={handleEndDateChange}
          readOnly
        />
      </div>
      <div id="pdf-content">
  <table>
    <thead>
      <tr>
        <th className="month">Month</th>
        <th style={{ paddingLeft: '5px', paddingRight: '5px' }}>Week No</th>
        <th>Days of the Week</th>
        <th style={{ paddingLeft: '5px', paddingRight: '5px' }}>Working Days</th>
        <th style={{ paddingLeft: '5px', paddingRight: '5px' }}>Instructional Days</th>
        <th style={{ width: '400px' }}>Event Particulars</th>
      </tr>
    </thead>
    <tbody>
      {months.map((monthDate, monthIndex) => {
        const month = monthDate.toLocaleString('default', { month: 'long' });
        const year = monthDate.getFullYear();
        const firstDayOfMonth = new Date(year, monthDate.getMonth(), 1).getDay();
        const daysInCurrentMonth = daysInMonth(new Date(year, monthDate.getMonth()));
        const monthEvents = getEventsForMonth(year, monthDate.getMonth());

        let rows = [];
        let cells = [];
        let workingDaysPerWeek = [];
        let weekdaysPerWeek = [];
        let weekWorkingDays = 0;
        let weekWeekdays = 0;

        for (let i = 0; i < firstDayOfMonth; i++) {
          cells.push(<td key={`empty-${monthIndex}-${i}`}></td>);
        }

        for (let day = 1; day <= daysInCurrentMonth; day++) {
          const currentDate = new Date(year, monthDate.getMonth(), day);
          const dayOfWeek = currentDate.getDay();
          let className = '';

          if (dayOfWeek === 0 || dayOfWeek === 6) {
            className = 'weekend';
          }

          const eventClass = getColorClass(currentDate);
          if (eventClass) {
            className += ` ${eventClass}`;
          }

          if (!className.includes('red') && dayOfWeek !== 0 && dayOfWeek !== 6) {
            weekWorkingDays++;
          }

          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            weekWeekdays++;
          }

          cells.push(
            <td
              key={`day-${monthIndex}-${day}`}
              className={`calendar-day ${className}`}
            >
              <div className="day-number">{day}</div>
            </td>
          );

          if (dayOfWeek === 6 || day === daysInCurrentMonth) {
            rows.push(
              <tr key={`row-${monthIndex}-${day}`}>
                {cells}
              </tr>
            );
            workingDaysPerWeek.push(weekWorkingDays);
            weekdaysPerWeek.push(weekWeekdays);
            weekWorkingDays = 0;
            weekWeekdays = 0;
            cells = [];
          }
        }

        return (
          <tr key={`month-${monthIndex}`} className="month">
            <td className="month">{`${month} ${year}`}</td>
            <td>
              {workingDaysPerWeek.map((days, weekIndex) => (
                <div key={`week-${monthIndex}-${weekIndex}`} style={{ marginTop: '18px' }}>
                  {weekIndex + 1}
                </div>
              ))}
            </td>
            <td>
              <table>
                <thead>
                  <tr>
                    {Array.from({ length: 7 }).map((_, i) => {
                      const weekdayName = getWeekdayName(i);
                      const className = i === 0 || i === 6 ? 'weekend' : '';
                      return (
                        <th key={`weekday-inner-${i}`} className={className}>
                          {weekdayName}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </table>
            </td>
            <td>
              {workingDaysPerWeek.map((days, weekIndex) => (
                <div key={`working-days-${monthIndex}-${weekIndex}`} style={{ marginTop: '18px' }}>
                  {days}
                </div>
              ))}
            </td>
            <td>
              {weekdaysPerWeek.map((weekdays, weekIndex) => (
                <div key={`weekdays-${monthIndex}-${weekIndex}`} style={{ marginTop: '18px' }}>
                  {weekdays}
                </div>
              ))}
            </td>
            <td>
              {monthEvents.map((event, eventIndex) => (
                <div key={`event-${monthIndex}-${eventIndex}`} style={{ marginTop: '5px' }}>
                  {event.name} ({new Date(event.date).toLocaleDateString()})
                </div>
              ))}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '50px' }}>
    <PdfDownloader
      formContent="pdf-content"
      style={{
        background: '#ff8800',
        border: 'none',
        borderRadius: '5px',
        color: 'white',
        fontSize: '16px',
        marginTop: '20px',
        width: '200px',
      }}
    />
    <button
      onClick={() => window.history.back()}
      style={{
        background: '#ff8800',
        border: 'none',
        borderRadius: '5px',
        color: 'white',
        fontSize: '16px',
        marginTop: '20px',
        width: '200px',
      }}
    >
      Back
    </button>
  </div>
</div>
</div>
  );
};
export default CalendarTable;