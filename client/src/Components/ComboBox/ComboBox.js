import React, { useState } from "react";
import { Form, Row, Col, Table, Container } from "react-bootstrap";
import jsonData from "./subjects.json"; // Import your JSON data


const ComboBox = ({onSubjectCodeChange }) => {
const data=jsonData.Branch;
const [selectedBranch, setSelectedBranch] = useState('');
const [selectedSemester, setSelectedSemester] = useState('');
const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
const [selectedSubjectTitle, setSelectedSubjectTitle] = useState('');

const fetchDepartmentNames = () => {
  return Object.keys(data[0]);
};

const fetchSemesters = (branch) => {
  if (branch && data[0][branch]) {
    return Object.keys(data[0][branch][0]);
  }
  return [];
};

const fetchSubjectCodes = (branch, semester) => {
  if (branch && semester && data[0][branch]) {
    const semesterData = data[0][branch].find(
      (semesterData) => semesterData[semester]
    );
    return semesterData ? semesterData[semester].courseCode : [];
  }
  return [];
};

function getYearOfStudy(semester) {
  // Define the mapping between semesters and years of study
  const semesterToYear = {
    "Semester 1": " ",   // First year (Freshman Engineering)
    "Semester 2": " ",   // First year (Freshman Engineering)
    "Semester 3": "SE",   // Second year (Sophomore Engineering)
    "Semester 4": "SE",   // Second year (Sophomore Engineering)
    "Semester 5": "TE",   // Third year (Third Year Engineering)
    "Semester 6": "TE",   // Third year (Third Year Engineering)
    "Semester 7": "BE",   // Final year (Bachelor of Engineering)
    "Semester 8": "BE"    // Final year (Bachelor of Engineering)
  };

  // Return the corresponding year or a default message if the semester is not found
  return semesterToYear[semester] || " ";
}
const handleSubjectCodeChange = (e) => {
  const code = e.target.value;
  setSelectedSubjectCode(code);
  const subT = data[0][selectedBranch][0][selectedSemester].courseCode.find(course => Object.keys(course)[0] === code);
  const title = subT ? subT[code] : "Course not found";
  setSelectedSubjectTitle(title);
  console.log(selectedSubjectTitle)
  onSubjectCodeChange(code);  // Pass the selected subject code to the parent
};

return (
  <div>
    <h2>Select your Subject</h2>
    <Form.Group controlId="branchSelect">
      <Form.Label>Select Department</Form.Label>
      <Form.Select
        value={selectedBranch}
        onChange={(e) => {
          setSelectedBranch(e.target.value);
          setSelectedSemester('');
          setSelectedSubjectCode('');
        }}
      >
        <option value="">Select Department</option>
        {fetchDepartmentNames().map((branch, index) => (
          <option key={index} value={branch}>
            {branch}
          </option>
        ))}
      </Form.Select>
    </Form.Group>

    {selectedBranch && (
      <Form.Group controlId="semesterSelect">
        <Form.Label>Select Semester</Form.Label>
        <Form.Select
          value={selectedSemester}
          onChange={(e) => {
            setSelectedSemester(e.target.value);
            setSelectedSubjectCode('');
          }}
        >
          <option value="">Select Semester</option>
          {fetchSemesters(selectedBranch).map((semester, index) => (
            <option key={index} value={semester}>
              {semester}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    )}

    {selectedSemester && selectedBranch && (
      <Form.Group controlId="subjectCodeSelect">
        <Form.Label>Select Subject Code</Form.Label>
        <Form.Select
          value={selectedSubjectCode}
          onChange={handleSubjectCodeChange}  // Call handleSubjectCodeChange
        >
          <option value="">Select Subject Code</option>
          {fetchSubjectCodes(selectedBranch, selectedSemester).map(
            (subject, index) => (
              <option key={index} value={Object.keys(subject)[0]}>
                {Object.keys(subject)[0]} - {Object.values(subject)[0]}
              </option>
            )
          )}
        </Form.Select>
      </Form.Group>
    )}
    <Container >
      <Row className="justify-content-center">
        <Col xs={12} md={8}>
          <h2 className="text-center ">Course Plan</h2>
          <Table striped bordered hover id="coursePlan">
            <tbody>
              <tr>
                <td style={{ border: 'none' }}><b>Semester:</b> {parseInt(selectedSemester.replace(/[^0-9]/g, ""))}</td>
                <td style={{ border: 'none' }}><b>Year:</b> {getYearOfStudy(selectedSemester)} {selectedBranch}</td>
              </tr>
              <tr>
                <td style ={{ border: 'none' }}><b>Course Title:</b> {selectedSubjectTitle}</td>  
                <td style={{ border: 'none' }}><b>Course Code:</b> {selectedSubjectCode}</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}><b>Total Contact Hours:</b> 39</td>
                <td style={{ border: 'none' }}><b>Duration of TEE:</b> 3 hrs.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}><b>TEE Marks:</b> 80</td>
                <td style={{ border: 'none' }}><b>IA Marks:</b> 20</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}><b>Subject In-charge:</b></td>
                <td style={{ border: 'none' }}> </td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}><b>Course Coordinator:</b></td>
                <td style={{ border: 'none' }}></td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  </div>
);
};

export default ComboBox;
