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
import ComboBox from '../ComboBox/ComboBox.js';
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
  const [bufferDates, setBufferDates] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { name } = location.state || {};
  const childRef = React.useRef();





  const [courseCode,setcourseCode] = useState('Please choose subject first');

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





  const handleLogout = async () => {
    try {

      toast.success(`${name} logged out successfully`)
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
    };
  }



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

  const handleSubjectCode = (code) => {
    setcourseCode(code);
  };
  return (
    
    <Container>
      <div className='d-flex justify-content-between flex-row py-4'>
        {name && <h2>Hello, HOD {name}! </h2>}
        <Button className="px-5 py-2" variant="danger" onClick={handleLogout}>Logout</Button>
      </div>
      <ParentCalendar />


      <div className='py-3'>
        <ComboBox onSubjectCodeChange={handleSubjectCode}/>
      </div>


      <div className='my-2'>
          <MappingCO ref={childRef} courseCode={courseCode} />
        </div>

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