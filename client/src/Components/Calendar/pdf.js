import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PdfDownloader = ({ formContent }) => {
  const downloadPDF = () => {
    const input = document.getElementById(formContent);

    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgWidth = 210; // mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('admission-form.pdf');
      });
  };

  return (
    <button onClick={downloadPDF} style={{ background: '#ff8800', border: 'none', borderRadius: '5px', color: 'white', fontSize: '16px', marginTop: '20px', width: '200px' }}>Download PDF</button>
  );
};

export default PdfDownloader;
