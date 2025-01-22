import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";

import { Table, Modal, Form, Button, Card, Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { createClient } from "@supabase/supabase-js";
import toast from "react-hot-toast";

const supabaseUrl = "https://bogosjbvzcfcldahqzqv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ29zamJ2emNmY2xkYWhxenF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NTg2NjEsImV4cCI6MjA1MjQzNDY2MX0.UlaFnLDqXJgVF9tYCOL0c0hjCAd4__Yq47K5mVYdXcc";
const supabase = createClient(supabaseUrl, supabaseKey);

const MappingCO = forwardRef(({ courseCode }, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [showCOForm, setShowCOForm] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [marks, setMarks] = useState("");
  const [reason, setReason] = useState("");
  const [mappingData, setMappingData] = useState({});
  const [cos, setCos] = useState([]);
  const [newCODescription, setNewCODescription] = useState("");
  const [newBloomTaxonomy, setNewBloomTaxonomy] = useState("");
  const pos = Array.from({ length: 12 }, (_, i) => `PO${i + 1}`);

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
    PO12: "Life-long Learning: Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change."
  };

  useEffect(() => {
    fetchMappingData();
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
        setCos(parsedData.cos || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const addCO = () => {
    const newCO = {
      id: `CO${cos.length + 1}`,
      description: newCODescription,
      bloomTaxonomy: newBloomTaxonomy,
    };
    setCos([...cos, newCO]);
    setMappingData({
      ...mappingData,
      cos: [...cos, newCO],
    });
    setNewCODescription("");
    setNewBloomTaxonomy("");
    setShowCOForm(false);
  };

  const handleCellClick = (co, po) => {
    console.log(co);
    console.log(po);
    setSelectedCell({ co, po });
    console.log(selectedCell)
    setMarks(mappingData[`${co}-${po}`]?.marks || "");
    setReason(mappingData[`${co}-${po}`]?.reason || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedCell.co || !selectedCell.po) {
      console.log(selectedCell.co);
      console.log(selectedCell.po);
      console.error("Invalid CO or PO selected:", selectedCell);
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
      console.error('Error saving data:', error);
    }
  };


  useImperativeHandle(ref, () => ({
    getMappingData: () => {
      return mappingData;
    },
  }));

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">CO-PO Mapping</h4>
          <Badge bg="primary" className="fs-6">
            Course Code: {courseCode}
          </Badge>
        </div>
      </Card.Header>
      <Card.Body>
        <Button onClick={() => setShowCOForm(true)}>Add New CO</Button>
        <Table bordered hover>
          <thead className="bg-light">
            <tr>
              <th>CO / PO</th>
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
                  <td
                    key={`${co.id}-${po}`}
                    className="text-center"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleCellClick(co.id, po)}
                  >
                    {mappingData[`${co.id}-${po}`]?.marks || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>

        {showCOForm && (
          <div className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>CO Description</Form.Label>
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
            <Button onClick={addCO}>Add CO</Button>
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
                <Form.Label className="fw-medium">PO Description</Form.Label>
                <p className="text-muted">
                  {selectedCell ? poDescriptions[selectedCell.po] : ''}
                </p>
              </Form.Group>

              {/* <Form.Group className="mb-3">
                <Form.Label>Marks (out of 4)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="4"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                />
              </Form.Group> */}

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
    </Card>
  );
});

export default MappingCO;
