
import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Table, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import ParentCalendar from '../Calendar/ParentCalendar.js';
import 'react-calendar/dist/Calendar.css';
import '../calendarBG.css';
import 'react-tooltip/dist/react-tooltip.css';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { fetchJsonData, fetchSessionDates, filterWorkingDays } from '../../supabaseFetcher/fetchData.js';
import MappingCO from '../MappingCO/MappingCO.js';
import { exportToExcel } from '../ExportExcel/exportToExcel.js';


const HodPage = () => {
  // const [data, setData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [supaBaseData, setSupaBaseData] = useState([]);
  const [workingDays, setWorkingDays] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [courseDays, setCourseDays] = useState({});
  const [newContent, setNewContent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [bufferDates, setBufferDates] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { name } = location.state || {};
  const childRef = React.useRef();





  const [courseCode,setcourseCode] = useState('ECC401');

  useEffect(() => {
  //  const fetchJsonData =  fetchJsonData();

    const fetchDataAndAssign = async () => {
      try {
        const jsonData = await fetchJsonData(courseCode); // Fetch course data
        // console.log(jsonData['Course Name']);
        const courseName = jsonData['Course Name']; // Extract course name
        setSupaBaseData(jsonData);
        // Set course name (assuming you're storing it in a state variable)
        setCourses([courseName]); // Wrap courseName in an array to match the courses variable structure

          /// Fetch date range
        const datesData = await fetchSessionDates(); 

        setStartDate(datesData.startDate);
        setEndDate(datesData.endDate);

        // Calculate working days between start and end date
        const workingDaysList = calculateWorkingDays(datesData.startDate, datesData.endDate);
        // console.log(workingDaysList)

        const holidaysData = await filterWorkingDays(workingDaysList);
        // console.log(holidaysData)
        const finalWorkingDaysList = holidaysData;
        setWorkingDays(finalWorkingDaysList);

        // Initialize the course days state (Assuming default value is all false)
        const initialCourseDays = { [courseName]: { Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false } };
        setCourseDays(initialCourseDays);

      } catch (error) {
        console.error('Error fetching data and assigning courses:', error);
      }
    };

    fetchDataAndAssign();
  }, [courseCode]);


  const calculateWorkingDays = (start, end) => {
    const workingDaysList = [];
    let currentDate = new Date(start);
    const endDateObj = new Date(end);

    while (currentDate <= endDateObj) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const formattedDate = currentDate.toISOString().split('T')[0];
        workingDaysList.push({
          date: formattedDate,
          dayOfWeek: getDayOfWeek(currentDate)
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
    try {
      
      // Validate required data
      if (!supaBaseData) {
        throw new Error('No Supabase data available');
      }
  
      if (!courses || !Array.isArray(courses) || courses.length === 0) {
        throw new Error('Courses array is missing or empty');
      }
  
      if (!workingDays || !Array.isArray(workingDays) || workingDays.length === 0) {
        throw new Error('Working days array is missing or empty');
      }
  
      if (!courseDays || Object.keys(courseDays).length === 0) {
        throw new Error('Course days mapping is missing or empty');
      }
  
      const jsonData = supaBaseData;
  
      // Validate modules data
      const modules = jsonData.Modules;
      if (!modules || !Array.isArray(modules) || modules.length === 0) {
        throw new Error('No modules available in the data');
      }
  
      const assignments = [];
      const courseModulesMap = new Map();
  
      // Log data for debugging
      console.log('Input validation passed with:', {
        coursesCount: courses.length,
        workingDaysCount: workingDays.length,
        modulesCount: modules.length,
        courseDaysKeys: Object.keys(courseDays)
      });
  
      // Map the course to its respective modules and hours
      courses.forEach(course => {
        if (!course) {
          console.warn('Encountered null or undefined course in courses array');
          return; // Skip this iteration
        }
  
        const courseModules = modules.flatMap(module => {
          if (!module || !module['Hour Distribution']) {
            console.warn(`Missing module or hour distribution for course: ${course}`);
            return [];
          }
  
          return Object.entries(module['Hour Distribution']).map(([key, hour]) => ({
            course,
            module: module['Module Name'] || 'Unnamed Module',
            hour: hour?.Content || "",
            hourNumber: hour?.['Hour Number'] || 0
          }));
        });
  
        if (courseModules.length > 0) {
          courseModulesMap.set(course, courseModules);
        } else {
          console.warn(`No valid modules mapped for course: ${course}`);
        }
      });
  
      // Validate if we have any valid mappings
      if (courseModulesMap.size === 0) {
        throw new Error('No valid course-module mappings could be created');
      }
  
      const usedModulesIndices = new Map();
      const assignedDates = new Set();
  
      // Assign modules to working days
      workingDays.forEach(day => {
        if (!day || !day.date || !day.dayOfWeek) {
          console.warn('Invalid day object encountered:', day);
          return;
        }
  
        courses.forEach(course => {
          // Check if this course should be scheduled on this day
          if (courseDays[course]?.[day.dayOfWeek]) {
            const courseModules = courseModulesMap.get(course);
  
            if (courseModules?.length > 0) {
              const moduleIndex = usedModulesIndices.get(course) || 0;
  
              if (moduleIndex < courseModules.length) {
                const module = courseModules[moduleIndex];
  
                assignments.push({
                  date: day.date,
                  dayOfWeek: day.dayOfWeek,
                  course: module.course,
                  module: module.module,
                  hour: module.hour,
                  hourNumber: module.hourNumber
                });
  
                assignedDates.add(day.date);
                usedModulesIndices.set(course, moduleIndex + 1);
              }
            }
          }
        });
      });
  
      // Calculate buffer dates
      const bufferDates = workingDays
        .filter(day => !assignedDates.has(day.date))
        .map(day => day.date);
  
      console.log('Assignment Results:', {
        totalAssignments: assignments.length,
        assignedDatesCount: assignedDates.size,
        bufferDatesCount: bufferDates.length
      });
  
      setBufferDates(bufferDates);
      setAssignments(assignments);
  
    } catch (error) {
      console.error('Error in assignCoursesModulesHours:', error);
      // You might want to set some error state here
      setAssignments([]);
      setBufferDates([]);
    }
  };



  const handleAddContent = async (event) => {
    event.preventDefault();
  
    // Ensure all required fields are provided
    if (!selectedCourse || !selectedModule || !newContent) {
      alert('Please fill all fields');
      return;
    }
  
    try {
      // Get course data
      const courseData = supaBaseData;
  
      // Find the selected module
      const selectedModuleData = courseData.Modules.find(
        (module) => module['Module Name'] === selectedModule
      );
  
      if (!selectedModuleData) {
        alert('Module not found in the course.');
        return;
      }
  
      // Calculate the next hour number
      const nextHourNumber = Object.keys(selectedModuleData['Hour Distribution']).length + 1;
  
      // Create the new hour entry
      const newEntry = {
        [`Hour ${nextHourNumber}`]: {
          "Content": newContent,
          "Hour Number": nextHourNumber,
        },
      };
  
      // Update the hour distribution in the selected module
      selectedModuleData['Hour Distribution'] = {
        ...selectedModuleData['Hour Distribution'],
        ...newEntry,
      };
  
      // Update the entire course data with the new entry
      const { data, error } = await supabase
        .from('coursesessionplan') // Replace with your table name
        .update({ Updated: courseData }) // Update the 'Updated' column with the full JSON
        .eq('Course Code', courseCode); // Match the specific course using 'Course Code'
  
      if (error) {
        throw new Error('Failed to update course data in Supabase');
      }
  
      // Notify the user of success
      toast.success(`Content added to ${selectedModule} successfully`);
    } catch (error) {
      // Log and notify the user of errors
      console.error('Error adding content to Supabase:', error);
      toast.error('Failed to add content. Please try again.');
    }
  };
  

  const handleLogout = async () => {
    try {

      toast.success(`${name} logged out successfully`)
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
    };
  }

const handleDownloadPdf = async () => {
  const parentData = await handleEXCEL(); // Ensure parentData is generated correctly
  const childData = childRef.current?.getMappingData(); // Retrieve childData

  if (!parentData || !Array.isArray(parentData)) {
    console.error("Parent Data is invalid or not an array:", parentData);
    return;
  }

  if (!childData || !Array.isArray(childData)) {
    console.error("Child Data is invalid or not an array:", childData);
    return;
  }

  await generatePdf(parentData, childData); // Pass both datasets to the PDF generator
};

const generatePdf = async (parentData, childData) => {
  const doc = new jsPDF();
  console.log(parentData);


  const parentTableData = parentData.map(item => [
    item["Expected Date"],
    item["Actual Date"],
    item["Day of the Week"],
    item["Course"],
    item["Module"],
    item["Hour"]
  ]);

  // Generate Parent Data Table
  doc.text(`Schdeule of ${courseCode}: ${courses}`, 10, 10);
  doc.autoTable({
    head: [['Expected Date', '  Actual Date  ', 'Day of the Week', 'Course', 'Module', 'Hour']], // First row as header
    body: parentTableData, // Rest of the rows as body
    startY: 20,
  });

  // Generate Child Data Table
  const startY = doc.autoTable.previous.finalY + 10; // Position below Parent Table
  doc.text(`CO PO Mapping of ${courseCode}: ${courses}`, 10, startY);
  doc.autoTable({
    head: [childData[0]], // First row as header
    body: childData.slice(1), // Rest of the rows as body
    startY: startY + 10,
  });

  // Save the PDF
  doc.save("CombinedData.pdf");
};


  const handleEXCEL = async () => {
    const tableData = assignments.map((assignment) => ({
      "Expected Date": assignment.date,
      "Actual Date": "", // Placeholder
      "Day of the Week": assignment.dayOfWeek,
      Course: assignment.course,
      Module: assignment.module,
      Hour: assignment.hour,
    }));
    return tableData;
  };

  const handleExport = async() => {
    const childData = childRef.current?.getMappingData();
    const parentData = await handleEXCEL();

    if (!Array.isArray(parentData)) {
      console.error("Parent Data is not an array:", parentData);
      return;
    }

    if (!Array.isArray(childData)) {
      console.error("Child Data is not an array:", childData);
      return;
    }

    const datasets = [
      {
        data: parentData,
        sheetName: 'Parent Data',
      },
      {
        data: childData,
        sheetName: 'Mapping Data',
      },
    ];

    exportToExcel(datasets, 'CombinedData');
  };


  return (
    
    <Container>
      <div className='d-flex justify-content-between flex-row my-2'>
        {name && <h1>Hello, HOD {name}! </h1>}
        <h2>Subject Code:{courseCode}</h2>
        <Button className="px-5 py-2" variant="danger" onClick={handleLogout}>Logout</Button>
      </div>
      <div className='m-2'>
        {/* <input type="textarea"  placeholder={"Enter course code"} onChange={(e) => setcourseCode(tempCourseSetter)}></input> */}
        </div>

      <ParentCalendar />

      <div className="mt-2">

        <h2>Session Date Information</h2>
        <p>Start Date: {startDate}</p>
        <p>End Date: {endDate}</p>
      </div>


      <div>
        <div>
          <h2 className="my-2">Add Custom Lecture</h2>
          <Form className="mb-2" onSubmit={handleAddContent}>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">Select Course</Form.Label>
              <Col sm="9">
                <Form.Control as="select" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                  <option value="">Select Course</option>
                  {courses.map((course, index) => (
                    <option key={index} value={course}>{course}</option>
                  ))}
                </Form.Control>
              </Col>
            </Form.Group >
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">Select Module</Form.Label>
              <Col sm="9">
                <Form.Control as="select" value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
                  <option value="">Select Module</option>
                  {
                    // Filter by selected course, then extract module names
                    [...new Set(
                      [supaBaseData]
                        .filter(item => item['Course Name'] === selectedCourse) // Filter by selected course
                        .flatMap(item => item['Modules']) // Extract Modules array
                        .map(module => module['Module Name']) // Map to module names
                    )].map((module, index) => (
                      <option key={index} value={module}>
                        {module}
                      </option>
                    ))
                  }
                </Form.Control>
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">New Divided Content</Form.Label>
              <Col sm="9">
                <Form.Control type="text" value={newContent} onChange={(e) => setNewContent(e.target.value)} />
              </Col>

            </Form.Group>
            <div className="d-flex justify-content-end mt-2">
              <Button variant='primary' type="submit">Add Content</Button>
            </div>

          </Form>
        </div>
      </div>
      {/* <div className='my-2'>
          <MappingCO ref={childRef} courseCode={courseCode} />
        </div> */}

      <div>
        <h2>Course Day Selection</h2>
        <div className='courses_field'>
          {courses.map((course, index) => (
            <div key={index}>
              <h4 className='mx-2'>{course}</h4>
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
      <Button className="my-4" onClick={assignCoursesModulesHours}>Assign Modules</Button>
      <div>
        <h2>Schdeule Course</h2>
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

        {/* <Button variant="primary" className='m-2' onClick={handleDownloadPdf}>
          Download PDF
        </Button> */}
        <Button variant="success" onClick={handleExport}>
          Download EXCEL
        </Button>

        <h2> Buffer Dates </h2>
        <div className='d-flex flex-row'>
          <ul>
            {bufferDates.map((date, index) => (
              <li key={index}>{date}</li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  );
};

export default HodPage;