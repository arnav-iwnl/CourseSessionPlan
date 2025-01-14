import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Table, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import ParentComponent from '../../Calendar/ParentCalendar';
import 'react-calendar/dist/Calendar.css';
import toast from 'react-hot-toast';
import '../../calendarBG.css';
import 'react-tooltip/dist/react-tooltip.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const FacultyPageLab = () => {
    const [data, setData] = useState([]);
    const [courses, setCourses] = useState([]);
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

    const [isLab, setIsLab] = useState(false);
    const [selectedExperiment, setSelectedExperiment] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");
    const [selectedLab, setSelectedLab] = useState("");
    const [labs, setLabs] = useState([]);
    const [experiments, setExperiments] = useState([]);
    const Batch = ["1", "2", "3", "ALL"];

    useEffect(() => {
        const fetchJsonData = async () => {
            try {
                const updatedResponse = await fetch('JSON/updated.json', { cache: 'no-store' });

                if (!updatedResponse.ok) {
                    throw new Error('updated.json not found');
                }

                const updatedData = await updatedResponse.json();

                const isEmpty = Object.values(updatedData).every(
                    value => Array.isArray(value) ? value.length === 0 : Object.keys(value).length === 0
                );

                if (isEmpty) {

                    throw new Error('updated.json is empty');
                }

                return updatedData;

            } catch (error) {
                const alphaResponse = await fetch('JSON/alpha_data.json', { cache: 'no-store' });
                if (!alphaResponse.ok) {
                    throw new Error('Failed to fetch alpha_data.json');
                }

                const alphaData = await alphaResponse.json();

                return alphaData;
            }
        };

        const fetchLabJson = async () => {
            try {
                const updatedResponse = await fetch('JSON/lab_data', { cache: 'no-store' });
                if (!updatedResponse.ok) {
                    throw new Error('lab_data.json not found');
                }
        
                const updatedData = await updatedResponse.json();
                console.log('Fetched Lab Data:', updatedData); // Debug log
                
                const isEmpty = Object.values(updatedData).every(
                    value => Array.isArray(value) ? value.length === 0 : Object.keys(value).length === 0
                );
        
                if (isEmpty) {
                    throw new Error('lab_data.json is empty');
                }
        
                return updatedData;
        
            } catch (error) {
                console.error('Error fetching lab data:', error);
                const alphaResponse = await fetch('JSON/lab_data.json', { cache: 'no-store' });
                if (!alphaResponse.ok) {
                    throw new Error('Failed to fetch alpha_data.json');
                }
        
                const alphaData = await alphaResponse.json();
                console.log('Fallback Lab Data:', alphaData); // Debug log
                return alphaData;
            }
        };

        const fetchDataAndAssign = async () => {
            try {
                if (isLab) {
                    const labData = await fetchLabJson();
                    setData(labData);

                    // Extract unique lab names
                    const labNames = [...new Set(labData.map(item => item['Lab Name']))];
                    setLabs(labNames);

                    // Extract unique experiment names
                    const expNames = [...new Set(labData.map(item => item['Experiment']))];
                    setExperiments(expNames);
                }

                const jsonData = await fetchJsonData();
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
        const assignments = [];
        const courseModulesMap = new Map();

        courses.forEach(course => {
            const courseModules = data
                .filter(item => item['Course Name'] === course)
                .flatMap(module => {
                    const moduleHours = Array.isArray(module['Divided Content'])
                        ? module['Divided Content']
                        : [module['Divided Content']];
                    return moduleHours.map(hour => ({
                        course,
                        module: module['Module'],
                        hour
                    }));
                });
            courseModulesMap.set(course, courseModules);
        });

        // Track used modules with indices
        const usedModulesIndices = new Map();
        const assignedDates = new Set(); // Track assigned dates

        // Assign modules to each working day based on selected days
        workingDays.forEach(day => {
            courses.forEach(course => {
                if (courseDays[course][day.dayOfWeek]) {
                    const courseModules = courseModulesMap.get(course);

                    if (courseModules && courseModules.length > 0) {
                        if (!usedModulesIndices.has(course)) {
                            usedModulesIndices.set(course, 0); // Initialize index for each course
                        }

                        const moduleIndex = usedModulesIndices.get(course);

                        // Check if all modules are assigned
                        if (moduleIndex < courseModules.length) {
                            const module = courseModules[moduleIndex];

                            assignments.push({
                                date: day.date,
                                dayOfWeek: day.dayOfWeek,
                                course: module.course,
                                module: module.module,
                                hour: module.hour
                            });

                            assignedDates.add(day.date); // Mark the date as assigned

                            // Update the index
                            usedModulesIndices.set(course, moduleIndex + 1);
                        }
                    }
                }
            });
        });

        // Determine buffer dates (dates that were not assigned)
        const bufferDates = workingDays.filter(day => !assignedDates.has(day.date)).map(day => day.date);

        console.log('Assigned Dates:', Array.from(assignedDates));
        console.log('Buffer Dates:', bufferDates);
        setBufferDates(bufferDates);
        setAssignments(assignments);
    };


    const handleAddContent = async (event) => {
        event.preventDefault();

        if (isLab) {
        }

        if (!selectedCourse || !selectedModule || !newContent) {
            alert('Please fill all fields');
            return;
        }

        // Determine the next hour number based on existing entries for the selected course and module
        const existingEntries = data.filter(
            item => item['Course Name'] === selectedCourse && item['Module'] === selectedModule
        );

        const nextHourNumber = existingEntries.length + 1;
        const newEntry = {
            "Course Name": selectedCourse,
            "Module": selectedModule,
            "Divided Content": `Hour ${nextHourNumber}: ${newContent}`
        };

        // Append new entry to data
        const updatedData = [...data, newEntry];
        setData(updatedData);


        try {
            const response = await fetch('http://localhost:5000/updateData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error('Failed to update data');
            }
            toast.success(`Data updated successfully`);
        } catch (error) {
            console.error('Error updating data:', error);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/clearUpdatedJson', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to clear updated.json');
            }
            toast.success(`${name} logged out successfully`)
            navigate('/auth');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };
    const handleMapping = async () => {
        try {
            toast.success(`You have switched to CO-PO Mapping page`)
            navigate('/mapping');
        } catch (error) {
            console.error('Error navigating to Mapping Page:', error);
        }
    }

    const handleDownloadPdf = async () => {
        await generatePdf(assignments, bufferDates);
    };

    const generatePdf = async (assignments, bufferDates) => {
        const doc = new jsPDF();

        const tableData = assignments.map((assignment, index) => [
            assignment.date,
            "",
            assignment.dayOfWeek,
            assignment.course,
            assignment.module,
            assignment.hour,
        ]);

        doc.text("Assignments", 10, 10);
        doc.autoTable({
            head: [['Expected Date', 'Actual Date', 'Day of the Week', 'Course', 'Module', 'Hour']],
            body: tableData,
            startY: 20,
        });
        doc.save('assignments.pdf');
    };


    return (
        <Container>
            <div className='d-flex justify-content-between flex-row my-2'>
                {name && <h1>Hello, Faculty {name}!</h1>}
                <Button className='px-5 py-2' variant='secondary' onClick={handleMapping}>CO and PO Mapping</Button>
                <Button className="px-5 py-2" variant="danger" onClick={handleLogout}>Logout</Button>
            </div>
            <ParentComponent />

            <div className="mt-2">
                <h2>Session Date Information</h2>
                <p>Start Date: {startDate}</p>
                <p>End Date: {endDate}</p>
            </div>


            <div>
                <div>
                    <h2 className="my-2">Add Custom Lecture</h2>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="3">Is Lab</Form.Label>
                        <Col sm="9">
                            <Form.Check
                                type="checkbox"
                                label="Is Lab"
                                checked={isLab}
                                onChange={() => setIsLab(!isLab)}
                            />
                        </Col>
                    </Form.Group>
                    <Form className="mb-2" onSubmit={handleAddContent}>
                        <Form.Group as={Row} className="mb-3">
                        </Form.Group>

                        {isLab ? (
                            <div>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="3">Select Lab</Form.Label>
                                    <Col sm="9">
                                        <Form.Control as="select" value={selectedLab} onChange={(e) => setSelectedLab(e.target.value)}>
                                            <option value="">Select Lab</option>
                                            {labs.map((module, index) => (
                                                <option key={index} value={module}>{module}</option>
                                            ))}
                                        </Form.Control>
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="3">Select Experiment</Form.Label>
                                    <Col sm="9">
                                        <Form.Control as="select" value={selectedExperiment} onChange={(e) => setSelectedExperiment(e.target.value)}>
                                            <option value="">Select Experiment</option>
                                            {experiments.map((experiment, index) => (
                                                <option key={index} value={experiment}>{experiment}</option>
                                            ))}
                                        </Form.Control>
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="3">Select Batch</Form.Label>
                                    <Col sm="9">
                                        <Form.Control as="select" value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
                                            <option value="">Select Batch</option>
                                            {Batch.map((batch, index) => (
                                                <option key={index} value={batch}>{batch}</option>
                                            ))}
                                        </Form.Control>
                                    </Col>
                                </Form.Group>
                            </div>
                        ) : (
                            <div>
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
                                            {[...new Set(data.filter(item => item['Course Name'] === selectedCourse).map(item => item['Module']))].map((module, index) => (
                                                <option key={index} value={module}>{module}</option>
                                            ))}
                                        </Form.Control>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="3">New Divided Content</Form.Label>
                                    <Col sm="9">
                                        <Form.Control type="text" value={newContent} onChange={(e) => setNewContent(e.target.value)} />
                                    </Col>

                                </Form.Group>
                            </div>
                        )}

                        <div className="d-flex justify-content-end mt-2">
                            <Button variant='primary' type="submit">Add Content</Button>
                        </div>

                    </Form>
                </div>
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
                <Button variant="primary" onClick={handleDownloadPdf}>
                    Download PDF
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

export default FacultyPageLab;