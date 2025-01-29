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
import { fetchJsonData, updateData, filterWorkingDays } from '../../supabaseFetcher/fetchData.js';
import { generateTopicForEachLecture } from "./geminiApi.js";
import MappingCO from '../MappingCO/MappingCO.js';
import { exportToExcel } from '../ExportExcel/exportToExcel.js';
import PdfDownloader from '../Calendar/pdf.js';
import { formatDate } from '../../supabaseFetcher/formatDate.js';





const FacultyPage = () => {

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

  const [courseCode, setcourseCode] = useState('Please choose subject first');
  const [checker, setchecker] = useState(0);
  const [DepartmentName, setDepartmentName] = useState('');


  useEffect(() => {
    // console.log('Updated supabaseData:', supaBaseData);
    // console.log('Updated checker:', checker);
  }, [supaBaseData, checker]);
  useEffect(() => {
    //  const fetchJsonData =  fetchJsonData();

    const fetchDataAndAssign = async () => {
      try {
        const response = await fetchJsonData(courseCode); // Fetch course data
        // console.log(jsonData['Course Name']);
        const jsonData = response.fetchJson;
        setchecker(response.checker)
        const courseName = jsonData['Course Name']; // Extract course name
        setSupaBaseData(jsonData);
        // console.log(supaBaseData);
        // console.log(supaBaseData);
        // Set course name (assuming you're storing it in a state variable)
        setCourses([courseName]); // Wrap courseName in an array to match the courses variable structure

        // Calculate working days between start and end date
        const workingDaysList = calculateWorkingDays(startDate, endDate);
        // console.log(workingDaysList)

        const holidaysData = await filterWorkingDays(workingDaysList);
        // console.log(holidaysData)
        const finalWorkingDaysList = holidaysData;
        setWorkingDays(finalWorkingDaysList);

        // Initialize the course days state (Assuming default value is all false)
        const initialCourseDays = { [courseName]: { Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false } };
        setCourseDays(initialCourseDays);

      } catch (error) {
        // console.error('Error fetching data and assigning courses:', error);
      }
    }
    fetchDataAndAssign();
  }, [courseCode, startDate, endDate]);


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



  const assignCoursesModulesHours = async () => {
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
      let promptResult;
      if (checker === 0) {
        let promptData = Object.values(jsonData?.Modules).map((mod) => {
          // console.log("module", module); // Correct placement of console.log
          return {
            moduleName: mod["Module Name"],
            totalHours: mod["Total Hours"],
            hour1Content: mod?.["Hour Distribution"]?.["Hour 1"]?.Content,
          };
        });

        // console.log("prompt data : ", promptData);
        if (!Array.isArray(promptData)) {
          // If obj is not an array, wrap it in an array
          promptData = [promptData];
        }

        // console.log(typeof promptData); // Log the type of obj, it should be 'object', but obj will be an array now
        promptResult = await generateTopicForEachLecture(promptData);
        // promptResult = await promptResult.json;
        // console.log("typeof prompt data", typeof promptData);
        // if (promptResult) console.log("promptresult : ", promptResult);
        promptResult = JSON.parse(promptResult);
        // console.log(promptData);
      }


      // Validate modules data
      const modules = jsonData.Modules;
      if (!modules || !Array.isArray(modules) || modules.length === 0) {
        throw new Error('No modules available in the data');
      }

      const assignments = [];
      const courseModulesMap = new Map();


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
            hourNumber: hour?.['Hour Number'] || 0,
            totalHours: module['Total Hours'] || 0
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
      let indexlist = 1;
      workingDays.forEach((day) => {
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
                  index: indexlist++,
                  date: day.date,
                  course: module.course,
                  module: module.module,
                  hour: (checker === 1) ?
                    module.hour : JSON.stringify(
                      promptResult[`${module.module}`]?.[
                        "topic_distribution"
                      ].find((item) => item.hour == module.hourNumber)?.topics,
                    ) ||
                    "bruh",
                  hourNumber: module.hourNumber,
                  totalHours: module.totalHours,
                  courseCode: courseCode
                });

                assignedDates.add(day.date);
                // console.log(assignments.hour);
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

      setBufferDates(bufferDates);
      setAssignments(assignments);
      // console.log(assignments);

    } catch (error) {
      // console.error('Error in assignCoursesModulesHours:', error);
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
      toast.error(error.message || 'An error occurred');
    };
  }


  //
  const handleEXCEL = async () => {

    const tableData = assignments.map((assignment) => ({

      "Expected Date": assignment.date,
      "Actual Date": "", // Placeholder
      // "Course Code": courseCode,
      // Course: assignment.course,
      Module: assignment.module,
      'Lectures': handleArrayContent(assignment.hour),
      "Total Hours": assignment.totalHours

    }));
    // console.log(tableData);
    return tableData;
  };



  const handleExport = async () => {
    const childData = childRef.current?.getMappingData();
    // const transformedChildData = [];

    // // Transform child data
    // if (childData?.cos && Array.isArray(childData.cos)) {
    //   transformedChildData.push(
    //     { section: "COS", id: "ID", description: "Description", bloomTaxonomy: "Bloom Taxonomy" },
    //     ...childData.cos.map(({ id, description, bloomTaxonomy }) => ({
    //       section: "COS",
    //       id,
    //       description,
    //       bloomTaxonomy,
    //     }))
    //   );
    // }

    // Add dynamic key-value pairs
    // Object.entries(childData || {}).forEach(([key, value]) => {
    //   if (key !== "cos" && typeof value === "object") {
    //     transformedChildData.push({
    //       section: key,
    //       id: "",
    //       description: `Marks: ${value.marks}`,
    //       bloomTaxonomy: `Justification: ${value.justification}`,
    //     });
    //   }
    // });

    const parentData = await handleEXCEL();

    if (!Array.isArray(parentData)) {
      toast.error("Please choose assign lectures", parentData);
      return;
    }

    // if (!transformedChildData.length) {
    //   toast.error("No CO/PO data to export");
    //   return
    // }
    // console.log(transformedChildData)
    const datasets = [
      { data: parentData, sheetName: `${courseCode} - ${DepartmentName}` },
      // { data: transformedChildData, sheetName: 'Mapping Data' }
    ];
    if(courseCode==='Please choose subject first'){
      toast.error(`Please choose subject first`);
      return
    }
    updateData(courseCode, courseCode);
    exportToExcel(datasets, `Schedule for ${courseCode}`);
    setchecker(0);
    setAssignments([]); // Clear the assignments
    // console.log(`YEEEEEEEEE: ${assignments}`)
    setcourseCode('Please choose subject first'); // Reset the course code
  };


  const handleSubjectCode = (code) => {
    setcourseCode(code);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };
  const handleArrayContent = (content) => {
    if (checker === 0) {
      return JSON.parse(content)[0];
    }
    else {
      return content;
    }
  };

  const handleDepartment = (code) => {
    // console.log(code);
    setDepartmentName(code);
  }

  const handleUpload = () => {
    updateData(courseCode, assignments); // Update the data
    setchecker(0);
    setAssignments([]); // Clear the assignments
    // console.log(`YEEEEEEEEE: ${assignments}`)
    setcourseCode('Please choose subject first'); // Reset the course code
    // console.log(`YEEEEEEEEE: ${courseCode}`)
  };
  return (

    <Container>

      <div id='logo' >
        <img src={sieslogo} style={{ maxWidth: "200px", width: "100%" }} />
      </div>
      <h1 className='text-center'>Course Plan </h1>

      <div className='d-flex justify-content-between flex-row py-4'>
        {name && <h2>Hello, Facutly {name}! </h2>}
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
      <div id='lectureTable'>
        <h2>Schdeule Course</h2>
        <Table striped bordered hover className="assignment-table" >
          <thead>
            <tr>
              <th className="text-center">Date</th>
              <th className="text-center">Actual Date</th>
              <th className="text-center">Course</th>
              <th className="text-center">Module</th>
              <th className="text-center">Hour</th>
            </tr>
          </thead>
          <tbody>
            {assignments && assignments.length > 0 ? (
              assignments.map((assignment, index) => (
                <tr key={index}>
                  <td className="text-center">{formatDate(assignment.date)}</td>
                  <td className="text-center">{assignment.dayOfWeek}</td>
                  <td className="text-center">{assignment.course}</td>
                  <td className="text-center">{assignment.module}</td>
                  <td className="text-center">{assignment.hour ? handleArrayContent(assignment.hour) : ''}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="text-center" colSpan="5">
                  No data available. Please update the course code.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      <div className='d-flex justify-content-evenly'>
        <div>
        <Button variant="success" className='p-4' onClick={handleExport}>
          Download EXCEL
        </Button>
        </div>
        <div>
        <Button variant="secondary" className='p-4' onClick={handleUpload}>
          Upload to Database
        </Button>
        </div>
        <div>
        <PdfDownloader formContentIds={['logo', 'coursePlan', 'co-content', 'lectureTable']} />
        </div>
      </div>

    </Container>
  );
};

export default FacultyPage;
