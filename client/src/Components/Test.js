import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Table } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendarBG.css';
import { Tooltip } from 'react-tooltip';

const DynamicForm = () => {
  const [data, setData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [workingDays, setWorkingDays] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [courseDays, setCourseDays] = useState({});

  useEffect(() => {
    const fetchDataAndAssign = async () => {
      try {
        const response = await fetch('/JSON/alpha_data.json');
        const jsonData = await response.json();
        setData(jsonData);
        const courseNames = [...new Set(jsonData.map(item => item['Course Name']))];
        setCourses(courseNames);

        const datesResponse = await fetch('http://localhost:5000/getDate');
        const datesData = await datesResponse.json();
        setStartDate(datesData.startDate);
        setEndDate(datesData.endDate);
        const workingDaysList = calculateWorkingDays(datesData.startDate, datesData.endDate);

        const holidaysResponse = await fetch('http://localhost:5000/checkDates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ dates: workingDaysList })
        });

        if (!holidaysResponse.ok) {
          throw new Error('Failed to fetch holidays and events');
        }

        const holidaysData = await holidaysResponse.json();
        const finalWorkingDaysList = holidaysData.workingDaysList;
        setWorkingDays(finalWorkingDaysList);
        setEvents(holidaysData.events);

        // Initialize courseDays state
        const initialCourseDays = courseNames.reduce((acc, course) => {
          acc[course] = { Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false };
          return acc;
        }, {});
        setCourseDays(initialCourseDays);

      } catch (error) {
        console.error('Error fetching data and assigning courses:', error);
      }
    };

    fetchDataAndAssign();
  }, []);

  const calculateWorkingDays = (start, end) => {
    const workingDaysList = [];
    let currentDate = new Date(start);
    const endDateObj = new Date(end);

    while (currentDate <= endDateObj) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const formattedDate = currentDate.toISOString().split('T')[0]; // Exclude weekends (Sunday and Saturday)
        workingDaysList.push({
          date: formattedDate,
          dayOfWeek: getDayOfWeek(currentDate) // Function to get day name
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDaysList;
  };

  const getDayOfWeek = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const handleDayChange = (course, day) => {
    setCourseDays(prevState => ({
      ...prevState,
      [course]: {
        ...prevState[course],
        [day]: !prevState[course][day]
      }
    }));
  };

  const assignCoursesModulesHours = () => {
    const assignments = [];
    const courseModulesMap = new Map();

    // Group modules by course
    courses.forEach(course => {
      const courseModules = data.filter(item => item['Course Name'] === course);
      const modules = [];
      courseModules.forEach(module => {
        const moduleHours = Array.isArray(module['Divided Content']) ? module['Divided Content'] : [module['Divided Content']];
        moduleHours.forEach(hour => {
          modules.push({
            course,
            module: module['Module'],
            hour
          });
        });
      });
      courseModulesMap.set(course, modules);
    });

    // Assign modules to each working day based on selected days
    workingDays.forEach(day => {
      courses.forEach(course => {
        if (courseDays[course][day.dayOfWeek]) {
          const courseModules = courseModulesMap.get(course);
          if (courseModules && courseModules.length > 0) {
            const moduleIndex = assignments.length % courseModules.length;
            const module = courseModules[moduleIndex];
            assignments.push({
              date: day.date,
              dayOfWeek: day.dayOfWeek,
              course: module.course,
              module: module.module,
              hour: module.hour
            });
          }
        }
      });
    });

    setAssignments(assignments);
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = date.toISOString().split('T')[0];
      if (events.includes(formattedDate)) {
        return 'holiday';
      }
      if (assignments.some(assignment => assignment.date === formattedDate)) {
        return 'assigned';
      }
    }
    return null;
  };

  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = date.toISOString().split('T')[0];
      const dayAssignments = assignments.filter(assignment => assignment.date === formattedDate);
      if (dayAssignments.length > 0) {
        return (
          <div data-tooltip-id={`tooltip-${formattedDate}`} data-tooltip-content={dayAssignments.map(assignment => `${assignment.course}: ${assignment.hour}`).join(', ')}>
            <Tooltip id={`tooltip-${formattedDate}`} />
          </div>
        );
      }
    }
    return null;
  };

  return (
    <Container>
      <h1 className="my-4">Dynamic Form</h1>
      <Calendar
        value={selectedDate}
        tileClassName={getTileClassName}
        tileContent={getTileContent}
      />
      <div>
        <h1>Date Information</h1>
        <p>Start Date: {startDate}</p>
        <p>End Date: {endDate}</p>
      </div>
      <div>
        <h1>Course Day Selection</h1>
        <div className='courses_field'>
        {courses.map((course, index) => (
          <div key={index}>
            <h2>{course}</h2>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
              <Form.Check
                key={day}
                type="checkbox"
                label={day}
                checked={courseDays[course] ? courseDays[course][day] : false}
                onChange={() => handleDayChange(course, day)}
              />
            ))}
          </div>
        ))}
        </div>
      </div>
      <Button className="mb-4" onClick={assignCoursesModulesHours}>Assign Modules</Button>
      <div>
        <h1>Assignments</h1>
        <Table striped bordered hover className="assignment-table">
          <thead>
            <tr>
              <th className="text-center">Date</th>
              <th className="text-center">Day of the Week</th>
              <th className="text-center">Course</th>
              <th className="text-center">Module</th>
              <th className="text-center">Hour</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment, index) => (
              <tr key={index}>
                <td className="text-center">{assignment.date}</td>
                <td className="text-center">{assignment.dayOfWeek}</td>
                <td className="text-center">{assignment.course}</td>
                <td className="text-center">{assignment.module}</td>
                <td className="text-center">{assignment.hour}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default DynamicForm;
