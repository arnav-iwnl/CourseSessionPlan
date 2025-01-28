import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PdfDownloader = ({ formContentIds }) => {
  
  const downloadPDF = async () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const padding = 10; // Padding around the content
    let currentYOffset = padding;
  
    for (const [index, formContentId] of formContentIds.entries()) {
      const input = document.getElementById(formContentId);
  
      if (!input) {
        console.error(`Element with ID "${formContentId}" not found.`);
        continue;
      }
  
      const canvas = await html2canvas(input, { scale: 2 });
      const imgWidth = pageWidth - 2 * padding;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      let offsetY = 0; // For cropping the canvas
      while (offsetY < canvas.height) {
        const cropHeight = Math.min(
          canvas.height - offsetY,
          ((pageHeight - 2 * padding) * canvas.width) / imgWidth
        );
  
        // Create a cropped canvas
        const croppedCanvas = document.createElement("canvas");
        croppedCanvas.width = canvas.width;
        croppedCanvas.height = cropHeight;
  
        const ctx = croppedCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          offsetY,
          canvas.width,
          cropHeight,
          0,
          0,
          canvas.width,
          cropHeight
        );
  
        const croppedImgHeight = (cropHeight * imgWidth) / canvas.width;
  
        // Add a new page if necessary
        if (currentYOffset + croppedImgHeight > pageHeight - padding) {
          pdf.addPage();
          currentYOffset = padding; // Reset Y-offset with padding for the new page
        }
  
        // Add the cropped image to the PDF
        pdf.addImage(
          croppedCanvas.toDataURL("image/png"),
          "PNG",
          padding,
          currentYOffset,
          imgWidth,
          croppedImgHeight
        );
  
        currentYOffset += croppedImgHeight;
        offsetY += cropHeight;
      }
    }
  
    pdf.save("SessionPlan.pdf");
  };
  
  
  
  return (
    <button
      onClick={downloadPDF}
      style={{
        background: '#ff8800',
        border: 'none',
        padding: '20px',
        borderRadius: '5px',
        color: 'white',
        fontSize: '16px',
        marginBottom: '15px',
        width: '200px',
      }}
    >
      Download PDF
    </button>
  );
};


export default PdfDownloader;






