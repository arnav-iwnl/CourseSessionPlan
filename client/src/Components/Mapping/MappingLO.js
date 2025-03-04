import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";

import { Table, Modal, Form, Button, Card, Badge, Tooltip, OverlayTrigger } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { createClient } from "@supabase/supabase-js";
import toast from "react-hot-toast";

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL,  process.env.REACT_APP_SUPABASE_KEY);


const MappingLO = forwardRef(({ courseCode, DepartmentName }, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [showCOForm, setShowCOForm] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [marks, setMarks] = useState("");
  const [reason, setReason] = useState("");
  const [mappingData, setMappingData] = useState({});
  const [cos, setCos] = useState([]); // Defaulting to an empty array
  const [newCODescription, setNewCODescription] = useState("");
  const [newBloomTaxonomy, setNewBloomTaxonomy] = useState("");
  const cardRef = useRef();
  const pos = Array.from({ length: 15 }, (_, i) => {

    if (i < 12) {
      return `PO${i + 1}`
    }
    else {
      return `PSO${i - 11}`
    }
  });

  const poDescriptions = {
    PO1: "Engineering Knowledge: Apply knowledge of mathematics, science, engineering fundamentals, and an engineering specialization to solve complex engineering problems.",
    PO2: "Problem Analysis: Identify, formulate, research literature, and analyze complex engineering problems to reach substantiated conclusions using principles of mathematics, natural sciences, and engineering sciences.",
    PO3: "Design and Development of Solutions: Design solutions for complex engineering problems and design system components or processes that meet specified needs, considering public health, safety, and cultural, societal, and environmental considerations.",
    PO4: "Conduct Investigations of Complex Problems: Use research-based knowledge and research methods, including the design of experiments, analysis, and interpretation of data, and synthesis of information to provide valid conclusions.",
    PO5: "Modern Tool Usage: Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools, including prediction and modeling, to complex engineering activities, understanding their limitations.",
    PO6: "The Engineer and Society: Apply reasoning informed by contextual knowledge to assess societal, health, safety, legal, and cultural issues and the consequent responsibilities relevant to professional engineering practice.",
    PO7: "Environment and Sustainability: Understand the impact of professional engineering solutions in societal and environmental contexts and demonstrate knowledge of and the need for sustainable development.",
    PO8: "Ethics: Apply ethical principles and commit to professional ethics, responsibilities, and norms of engineering practice.",
    PO9: "Individual and Teamwork: Function effectively as an individual and as a member or leader in diverse teams and in multidisciplinary settings.",
    PO10: "Communication: Communicate effectively on complex engineering activities with the engineering community and society at large, such as writing effective reports and design documentation, making effective presentations, and giving and receiving clear instructions.",
    PO11: "Project Management and Finance: Demonstrate knowledge and understanding of engineering and management principles and apply them to manage projects in multidisciplinary environments.",
    PO12: "Life-long Learning: Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change.",
    IT: {
      PSO1: 'Please Check your Department PSO1 for that',
      PSO2: 'Please Check your Department PSO2 for that',
      PSO3: 'Please Check your Department PSO3 for that'
    },
    CE: {
      PSO1: 'Please Check your Department PSO1 for that',
      PSO2: 'Please Check your Department PSO2 for that',
      PSO3: 'Please Check your Department PSO3 for that'
    },
    AIDS: {
      PSO1: 'Please Check your Department PSO1 for that',
      PSO2: 'Please Check your Department PSO2 for that',
      PSO3: 'Please Check your Department PSO3 for that'
    },
    AIML: {
      PSO1: 'Please Check your Department PSO1 for that',
      PSO2: 'Please Check your Department PSO2 for that',
      PSO3: 'Please Check your Department PSO3 for that'
    },
    EXTC: {
      PSO1: 'Please Check your Department PSO1 for that',
      PSO2: 'Please Check your Department PSO2 for that',
      PSO3: 'Please Check your Department PSO3 for that'
    },
    ECS: {
      PSO1: 'Please Check your Department PSO1 for that',
      PSO2: 'Please Check your Department PSO2 for that',
      PSO3: 'Please Check your Department PSO3 for that'
    },
    MECH: {
      PSO1: 'Please Check your Department PSO1 for that',
      PSO2: 'Please Check your Department PSO2 for that',
      PSO3: 'Please Check your Department PSO3 for that'
    },
    IOT: {
      PSO1: 'Please Check your Department PSO1 for that',
      PSO2: 'Please Check your Department PSO2 for that',
      PSO3: 'Please Check your Department PSO3 for that'
    },
    FE: {
      PSO1: 'Please Check your Department PSO1 for that',
      PSO2: 'Please Check your Department PSO2 for that',
      PSO3: 'Please Check your Department PSO3 for that'
    },

  };


  useEffect(() => {
    setCos([])
    fetchMappingData();
    // console.log(DepartmentName);
    // console.log(poDescriptions)
  }, [courseCode]);

  const fetchMappingData = async () => {
    try {
      const { data, error } = await supabase
        .from("coursesessionplan")
        .select("Updated_COPO")
        .eq("Course Code", courseCode)
        .single();

      if (error) throw error;

      if (data?.Updated_COPO) {
        const parsedData = JSON.parse(data.Updated_COPO);
        setMappingData(parsedData);
        setCos(parsedData.cos || []); // Default to empty array if not present
      }
    } catch (error) {
      // console.error("Error fetching data:", error);
      
    }
  };

  const addCO = () => {
    const newCO = {
      id: `LO${cos.length + 1}`,
      description: newCODescription,
      bloomTaxonomy: newBloomTaxonomy,
    };
    setCos([...cos, newCO]);
    setMappingData({
      ...mappingData,
      cos: [...cos, newCO],
    });
    // console.log(mappingData);
    setNewCODescription("");
    setNewBloomTaxonomy("");
    setShowCOForm(false);
  };

  const handleCellClick = (co, po) => {
    // console.log(co);
    // console.log(po);
    const cellData = mappingData[`${co}-${po}`] || {};
    setSelectedCell({ co, po });
    // console.log(selectedCell)
    setMarks(cellData.marks || "");
    setReason(cellData.justification || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedCell.co || !selectedCell.po) {
      // console.log(selectedCell.co);
      // console.log(selectedCell.po);
      // console.error("Invalid CO or PO selected:", selectedCell);
      return; // Stop execution if CO or PO is undefined
    }

    const updatedMapping = {
      ...mappingData,
      [`${selectedCell.co}-${selectedCell.po}`]: {
        marks: marks,
        justification: reason
      }
    };

    try {
      const { data, error } = await supabase
        .from('coursesessionplan')
        .select('Course Code')
        .eq('Course Code', courseCode)
        .single();

      if (error && error.code === 'PGRST116') {
        // Record doesn't exist, create new
        await supabase
          .from('coursesessionplan')
          .insert([{
            'Course Code': courseCode,
            Original_COPO: JSON.stringify(updatedMapping),
            Updated_COPO: JSON.stringify(updatedMapping),
            index: new Date().getTime() // Unique index
          }]);
      } else {
        // Record exists, update
        await supabase
          .from('coursesessionplan')
          .update({
            Updated_COPO: JSON.stringify(updatedMapping)
          })
          .eq('Course Code', courseCode);
      }

      setMappingData(updatedMapping);
      setShowModal(false);
    } catch (error) {
      toast.error(error.message || 'An error occurred during save');
    }
  };

  useImperativeHandle(ref, () => ({
    getMappingData: () => {
      return mappingData;
    },
  }));

  return (
    <>
      <Card>

        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">LO-PO Mapping</h4>
            <Badge bg="primary" className="fs-6">
              Course Code: {courseCode}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body id="co-content">
          <div className="container mt-4">
            <h2>Lab Objectives (LOs)</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Description</th>
                  <th>Bloom Taxonomy</th>
                </tr>
              </thead>
              <tbody>
                {cos && cos.length === 0 ? (
                  <tr>
                    <td colSpan="3">No Lab objectives available</td>
                  </tr>
                ) : (
                  cos.map((course, index) => (
                    <tr key={index}>
                      <td>{course.id}</td>
                      <td>{course.description}</td>
                      <td>{course.bloomTaxonomy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>


          <Table bordered hover>
            <thead className="bg-light">
              <tr>
                <th>LO / PO</th>
                {pos.map((po) => (
                  <th key={po} className="text-center">
                    {po}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cos.map((co) => (
                <tr key={co.id}>
                  <td className="fw-medium bg-light">{co.id}</td>
                  {pos.map((po) => (
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id={`${co.id}-${po}-tooltip`}> {

                        // poDescriptions[po]
                        po.startsWith('PO') && poDescriptions[po] ? (
                          // Show PO description if it's PO1 to PO12
                          `${po} : ${poDescriptions[po]}`

                        ) : (
                          // If the PO is beyond PO12, check for the department and show PSOs
                          <>
                            {poDescriptions[DepartmentName] && poDescriptions[DepartmentName][po]
                              ? `${po}: ${poDescriptions[DepartmentName][po]}`
                              : `PO Description not available for this department`}
                          </>
                        )

                      }</Tooltip>}
                    >

                      <td
                        key={`${co.id}-${po}`}
                        className="text-center"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleCellClick(co.id, po)}
                      >

                        <span>{mappingData[`${co.id}-${po}`]?.marks || ""}</span>
                        {/* {mappingData[`${co.id}-${po}`]?.marks || ""} */}
                      </td>
                    </OverlayTrigger>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>

          {showCOForm && (
            <div className="mb-4 border p-3">
              <Form.Group className="mb-3">
                <Form.Label>LO Description</Form.Label>
                <Form.Control
                  type="text"
                  value={newCODescription}
                  onChange={(e) => setNewCODescription(e.target.value)}
                  placeholder="Enter CO Description"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Bloom Taxonomy Level</Form.Label>
                <Form.Control
                  type="text"
                  value={newBloomTaxonomy}
                  onChange={(e) => setNewBloomTaxonomy(e.target.value)}
                  placeholder="Enter Bloom Taxonomy Level"
                />
              </Form.Group>
              <Button variant="success" onClick={addCO}>Add LO</Button>
            </div>
          )}

          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>
                {selectedCell ? `${selectedCell.co} - ${selectedCell.po}` : ""}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">{selectedCell ? `${selectedCell.po} Description` : ''}</Form.Label>
                  <p className="text-muted">
                    {selectedCell ? (
                      // Check if the PO is within PO1 to PO12 and is a string
                      typeof poDescriptions[selectedCell.po] === 'string' ? (
                        poDescriptions[selectedCell.po]
                      ) : (
                        // For PO greater than PO12, check the DepartmentName and show PSO descriptions
                        DepartmentName && poDescriptions[DepartmentName] && typeof poDescriptions[DepartmentName][selectedCell.po] === 'string'
                          ? poDescriptions[DepartmentName][selectedCell.po]
                          : `PO Description not available for this department`
                      )
                    ) : ''}
                  </p>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Marks (out of 4)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="4"
                    value={marks}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value > 4) {
                        toast.error(`The marks cannot exceed 4, Please add marks out`)
                      }
                      setMarks(Math.min(4, Math.max(0, value))); // Enforce the range
                    }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Justification</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for marks..."
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save
              </Button>
            </Modal.Footer>
          </Modal>

        </Card.Body>
        <Card.Footer className="d-flex justify-content-between">
          <Button onClick={() => setShowCOForm(true)}>Add New LO</Button>
        </Card.Footer>
      </Card>
      <div>

      </div>
    </>
  );
});

export default MappingLO;
