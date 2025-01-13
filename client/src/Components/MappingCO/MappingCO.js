import React, { useState } from "react";
import Modal from "react-modal";
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "react-bootstrap";

import "./MappingTable.css"; // Import the CSS file
import poDatabase from "./poDatabase.json"; // Adjust path accordingly

// const navigate = useNavigate();


const PO_DATABASE = poDatabase; // Use the imported JSON


const MappingCO = () => {
  const [coPoData, setCoPoData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Modal-specific state
  const [selectedCell, setSelectedCell] = useState({ co: null, po: null });
  const [marks, setMarks] = useState(0);
  const [reason, setReason] = useState("");

  const handleOpenModal = (co, po) => {
    setSelectedCell({ co, po });
    const existingMapping = coPoData.find(
      (item) => item.co === co && item.po === po
    );
    if (existingMapping) {
      setMarks(existingMapping.marks);
      setReason(existingMapping.reason);
    } else {
      setMarks(0);
      setReason("");
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setMarks(0);
    setReason("");
    setSelectedCell({ co: null, po: null });
    setModalOpen(false);
  };

  const handleSave = () => {
    if (marks <= 0 || marks > 4 || !reason) {
      alert("Please provide a valid mark (1-4) and a reason.");
      return;
    }

    const updatedData = [...coPoData];
    const existingIndex = updatedData.findIndex(
      (item) => item.co === selectedCell.co && item.po === selectedCell.po
    );

    if (existingIndex >= 0) {
      updatedData[existingIndex] = { ...selectedCell, marks, reason };
    } else {
      updatedData.push({ ...selectedCell, marks, reason });
    }

    setCoPoData(updatedData);
    handleCloseModal();
  };

  const getCellContent = (co, po) => {
    const mapping = coPoData.find((item) => item.co === co && item.po === po);
    return mapping ? `${mapping.marks}` : "";
  };

  return (
    <div className="container">
      <h2 className="title">CO-PO Mapping</h2>
 {/* BUTTON TO ADD TO BACK FUNCTIOM */}
      <table className="table">
        <thead>
          <tr>
            <th className="header-cell">CO / PO</th>
            {PO_DATABASE.map((po) => (
              <th key={po.id} className="header-cell">
                {po.id}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5).keys()].map((index) => {
            const co = `CO${index + 1}`;
            return (
              <tr key={co}>
                <td className="co-cell">{co}</td>
                {PO_DATABASE.map((po) => (
                  <td
                    key={po.id}
                    className="cell"
                    onClick={() => handleOpenModal(co, po.id)}
                  >
                    {getCellContent(co, po.id)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={handleCloseModal}
        style={{
          content: {
            width: "50em",
            margin: "auto",
            padding: "20px",
            borderRadius: "10px",
          },
        }}
      >
        <h2 className="modal-title">Map CO to PO</h2>
        <p>
          <strong>CO:</strong> {selectedCell.co}
           <strong>PO:</strong>{" "}
          {selectedCell.po}
        </p>
        <p>
  <strong>PO Description:</strong> {
    PO_DATABASE.find((po) => po.id === selectedCell.po)?.description
  }
</p>
        <form>
        <div className="form-group">
  <label htmlFor="marks-input">Marks (out of 4):</label>
  <input
    id="marks-input"
    type="number"
    min="1"
    max="4"
    value={marks}
    onChange={(e) => setMarks(Number(e.target.value))}
    className="input"
  />
</div>

<div className="form-group">
  <label htmlFor="reason-textarea">Reason:</label>
  <textarea
    id="reason-textarea"
    value={reason}
    onChange={(e) => setReason(e.target.value)}
    className="textarea"
  ></textarea>
</div>

          <button type="button" onClick={handleSave} className="btn save-btn">
            Save
          </button>
          <button type="button" onClick={handleCloseModal} className="btn cancel-btn">
            Cancel
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default MappingCO;
