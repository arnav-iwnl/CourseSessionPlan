import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PdfDownloader = ({ formContentIds }) => {
  const downloadPDF = () => {
    const promises = formContentIds.map((formContentId) => {
      const input = document.getElementById(formContentId);

      if (!input) {
        console.error(`Element with ID "${formContentId}" not found.`);
        return Promise.resolve(); // Skip if the element is not found
      }

      return html2canvas(input).then((canvas) => {
        return canvas; // Return the canvas for each form
      });
    });

    // Wait for all promises to resolve
    Promise.all(promises)
      .then((canvases) => {
        // Combine all canvases vertically
        const totalHeight = canvases.reduce((sum, canvas) => sum + canvas.height, 0);
        const maxWidth = Math.max(...canvases.map((canvas) => canvas.width));

        const combinedCanvas = document.createElement('canvas');
        combinedCanvas.width = maxWidth;
        combinedCanvas.height = totalHeight;

        const ctx = combinedCanvas.getContext('2d');
        let yOffset = 0;

        canvases.forEach((canvas) => {
          ctx.drawImage(canvas, 0, yOffset);
          yOffset += canvas.height;
        });

        // Convert combined canvas to image and generate PDF
        const imgData = combinedCanvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (combinedCanvas.height * imgWidth) / combinedCanvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('combined-forms.pdf');
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
      });
  };

  return (
    <button
      onClick={downloadPDF}
      style={{
        background: '#ff8800',
        border: 'none',
        borderRadius: '5px',
        color: 'white',
        fontSize: '16px',
        marginTop: '20px',
        width: '200px',
      }}
    >
      Download Combined PDF
    </button>
  );
};

export default PdfDownloader;