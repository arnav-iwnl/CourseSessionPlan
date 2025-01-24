import React, { useState, useEffect } from 'react';
import PdfDownloader from './pdf.js'; // Adjust the path as needed
import './styles/CalendarTable.css';
import { getEventData } from '../../supabaseFetcher/fetchData.js';
import { Col, Form, Row } from 'react-bootstrap';





const CalendarTable = () => {
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [instituteLevelEvents, setInstituteLevelEvents] = useState([]);
  const [departmentEvents, setDepartmentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    try {
      const eventsData = await getEventData();
      setEvents(eventsData.events || []);
      setHolidays(eventsData.holidays || []);
      setInstituteLevelEvents(eventsData.instituteLevelEvents || []);
      setDepartmentEvents(eventsData.departmentEvents || []);
      setLoading(false);

    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setRefresh(0);
  }, [startDate || endDate ,refresh]);

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
  const getEventsForType = (date, eventType) => {
    return eventType.filter(eventDate => eventDate === date).length > 0;
  };

  const getEventsForName = (date, eventType) => {
    // console.log(date)
    const matchingEvent = eventType.find(event => {
      const eventDate = new Date(event.date);
      eventDate.setDate(eventDate.getDate() + 1);
      const actualDate = eventDate;
      // console.log(`EVENT : ${actualDate.toISOString().split('T')[0]}`); // Ensure event.date is parsed as a Date object
      return actualDate.toISOString().split('T')[0] === date;
    });

    return matchingEvent ? matchingEvent.name : 'YOLO';
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

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  // onChange handler for End Date
  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };
  return (
    <div className="calendar-container">
       <div>
      <Form>
        <Row className="mb-3">
          <Col>
            <Form.Group controlId="startDate">
              <Form.Label className=''>Start Date for Calendar:</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="endDate">
              <Form.Label>End Date for Calendar:</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </div>
      <div id="pdf-content">
        <table>
          <thead>
            <tr>
              <th className="month">Month</th>
              <th>Week No</th>
              <th>Days of the Week</th>
              <th>Working Days</th>
              <th>Instructional Days</th>
              <th>All Event Particulars</th>
              <th>Institute Level Events</th>
              <th>Department Events</th>
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

                if (dayOfWeek === 0 || dayOfWeek === 7) {
                  className = 'weekend';
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
                            const className = i === 0 || i === 7 ? 'weekend' : '';
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
                        {event.name} {new Date(event.date).toLocaleDateString()}
                      </div>
                    ))}
                  </td>
                  <td>
                    {daysInCurrentMonth && Array.from({ length: daysInCurrentMonth }).map((_, dayIndex) => {
                      const date = new Date(year, monthDate.getMonth(), dayIndex).toISOString().split('T')[0];
                      return getEventsForType(date, instituteLevelEvents) && (
                        <div key={`inst-event-${monthIndex}-${dayIndex-1}`} style={{ marginTop: '5px' }}>
                          ● {getEventsForName(date, events)}
                          <br></br>
                          {new Date(date).toLocaleDateString()}
                        </div>
                      );
                    })}
                  </td>
                  <td>
                    {daysInCurrentMonth && Array.from({ length: daysInCurrentMonth }).map((_, dayIndex) => {
                      const date = new Date(year, monthDate.getMonth(), dayIndex).toISOString().split('T')[0];
                      const name = date;
                      return getEventsForType(date, departmentEvents) && (
                        <div key={`dept-event-${monthIndex}-${dayIndex-1}`} style={{ marginTop: '5px', padding: '20px', }}>
                          ● {getEventsForName(date, events)}
                          <br></br>
                          {new Date(date).toLocaleDateString()}
                        </div>
                      );
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '50px' }}>
        
        <button
          onClick={() => {setStartDate('');setEndDate('')}}
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
          Refresh
        </button>
      </div>
    </div>
  );
};
export default CalendarTable;