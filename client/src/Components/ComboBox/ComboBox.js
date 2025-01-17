import React, { useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import jsonData from "./subjects.json"; // Import your JSON data


const ComboBox = ({onSubjectCodeChange }) => {
const data=jsonData.Branch;
const [selectedBranch, setSelectedBranch] = useState('');
const [selectedSemester, setSelectedSemester] = useState('');
const [selectedSubjectCode, setSelectedSubjectCode] = useState('');

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

const handleSubjectCodeChange = (e) => {
  const code = e.target.value;
  setSelectedSubjectCode(code);
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
  </div>
);
};

export default ComboBox;
