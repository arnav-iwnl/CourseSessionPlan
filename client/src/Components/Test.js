import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const DynamicForm = () => {
  const [data, setData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [hours, setHours] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [customHour, setCustomHour] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    // Replace with actual data fetching
    const fetchData = async () => {
      const response = await fetch('/JSON/alpha_data.json'); // Update the path if needed
      const jsonData = await response.json();
      setData(jsonData);
      setCourses([...new Set(jsonData.map(item => item['Course Name']))]);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const filteredModules = data
        .filter(item => item['Course Name'] === selectedCourse)
        .map(item => item['Module']);
      setModules([...new Set(filteredModules)]);
      setSelectedModule('');
      setSelectedHour('');
    }
  }, [selectedCourse, data]);

  useEffect(() => {
    if (selectedModule) {
      const filteredHours = data
        .filter(
          item =>
            item['Course Name'] === selectedCourse &&
            item['Module'] === selectedModule
        )
        .map(item => item['Divided Content']);
      setHours(filteredHours);
      setSelectedHour('');
    }
  }, [selectedModule, selectedCourse, data]);

  const handleSubmit = async () => {
    const selectedData = {
      date: selectedDate.toISOString().split('T')[0],
      course: selectedCourse,
      module: selectedModule,
      lesson: selectedHour === 'Custom' ? customHour : selectedHour,
    };
    const jsonBlob = new Blob([JSON.stringify(selectedData)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(jsonBlob);
    link.download = 'selectedData.json';
    link.click();
    // try {
    //   const response = await fetch('/save-form', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(selectedData),
    //   });
      
    //   if (response.ok) {
    //     alert('Data saved successfully');
    //   } else {
    //     alert('Failed to save data');
    //   }
    // } catch (error) {
    //   console.error('Error saving data:', error);
    //   alert('Error saving data');
    // }
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday (0) or Saturday (6)
  };

  const tileDisabled = ({ date }) => isWeekend(date);

  const handleDateChange = (date) => {
    if (!isWeekend(date)) {
      setSelectedDate(date);
    }
  };

  return (
    <Container>
      <h1 className="my-4">Dynamic Form</h1>
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        tileDisabled={tileDisabled}
      />
      <Form>
        <Row className="mb-3">
          <Col>
            <Form.Group controlId="courseSelect">
              <Form.Label>Course Name</Form.Label>
              <Form.Control
                as="select"
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="moduleSelect">
              <Form.Label>Module Name</Form.Label>
              <Form.Control
                as="select"
                value={selectedModule}
                onChange={e => setSelectedModule(e.target.value)}
                disabled={!selectedCourse}
              >
                <option value="">Select Module</option>
                {modules.map(module => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="hourSelect">
              <Form.Label>Hour</Form.Label>
              <Form.Control
                as="select"
                value={selectedHour}
                onChange={e => setSelectedHour(e.target.value)}
                disabled={!selectedModule}
              >
                <option value="">Select Hour</option>
                {hours.map((hour, index) => (
                  <option key={index} value={hour}>
                    {hour}
                  </option>
                ))}
                <option value="Custom">Custom</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        {selectedHour === 'Custom' && (
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="customHour">
                <Form.Label>Custom Hour</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={customHour}
                  onChange={e => setCustomHour(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        )}

        <Button variant="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default DynamicForm;
