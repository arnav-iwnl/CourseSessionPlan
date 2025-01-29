import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Table, Row, Col, Image } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import ParentCalendar from '../Calendar/ParentCalendar.js';
import 'react-calendar/dist/Calendar.css';
import '../calendarBG.css';
import 'react-tooltip/dist/react-tooltip.css';
import sieslogo from './siesgst.png';
import toast from 'react-hot-toast';
import ComboBox from '../ComboBox/ComboBox.js';
import MappingCO from '../MappingCO/MappingCO.js';


const HODPage = () => {




  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { name } = location.state || {};
  const childRef = React.useRef();

  const [courseCode, setcourseCode] = useState('Please choose subject first');

  const [DepartmentName, setDepartmentName] = useState('');

  useEffect(() => {
    //  const fetchJsonData =  fetchJsonData();
  }, [courseCode, startDate, endDate]);

  const handleLogout = async () => {
    try {

      toast.success(`${name} logged out successfully`)
      navigate('/auth');
    } catch (error) {
      toast.error(error.message || 'An error occurred');

    };
  }

  const handleSubjectCode = (code) => {
    setcourseCode(code);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };
  const handleDepartment = (code) => {
    // console.log(code);
    setDepartmentName(code);
  }

  return (

    <Container>

      <div id='logo' >
        <img src={sieslogo} style={{ maxWidth: "200px", width: "100%" }} />
      </div>
      <h1 className='text-center'>Course Plan </h1>

      <div className='d-flex justify-content-between flex-row py-4'>
        {name && <h2>Hello, HOD {name}! </h2>}
        <Button className="px-5 py-2" variant="danger" onClick={handleLogout}>Logout</Button>
      </div>
      <ParentCalendar />
      <div>
        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="startDate">
                <Form.Label><h2>Start Date for Schedule:</h2></Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="endDate">
                <Form.Label><h2>End Date for Schedule:</h2></Form.Label>
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

      <div className='py-3'>
        <ComboBox onSubjectCodeChange={handleSubjectCode} onDepartmentNameChange={handleDepartment} />
      </div>


      <div className='my-2'>
        <MappingCO ref={childRef} courseCode={courseCode} DepartmentName={DepartmentName} />
      </div>
    
    </Container>
  );
};

export default HODPage;
