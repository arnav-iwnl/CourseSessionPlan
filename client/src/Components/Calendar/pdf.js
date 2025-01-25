import React from 'react';
import html2canvas from 'html2canvas';

import jsPDF from 'jspdf';

//
// const PdfDownloader = ({ formContentIds }) => {
//   const downloadPDF = async () => {
//     const pdf = new jsPDF();
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const pageHeight = pdf.internal.pageSize.getHeight();
//     let currentYOffset = 0;

//     for (const [index, formContentId] of formContentIds.entries()) {
//       const input = document.getElementById(formContentId);

//       if (!input) {
//         console.error(`Element with ID "${formContentId}" not found.`);
//         continue;
//       }

//       const canvas = await html2canvas(input, { scale: 2 });
      
//       const imgWidth = pageWidth;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;

//       // Add new page for contents after first three on the first page
//       if (index > 2) {
//         pdf.addPage();
//         currentYOffset = 0;
//       }

//       // Check if image fits on current page
//       if (currentYOffset + imgHeight > pageHeight) {
//         pdf.addPage();
//         currentYOffset = 0;
//       }

//       pdf.addImage(
//         canvas.toDataURL('image/png'), 
//         'PNG', 
//         0, 
//         currentYOffset, 
//         imgWidth, 
//         imgHeight
//       );

//       currentYOffset += imgHeight;
//     }

//     pdf.save('SessionPlan.pdf');
//   };

//   return (
//     <button
//       onClick={downloadPDF}
//       style={{
//         background: '#ff8800',
//         border: 'none',
//         padding: '20px',
//         borderRadius: '5px',
//         color: 'white',
//         fontSize: '16px',
//         marginBottom: '15px',
//         width: '200px',
//       }}
//     >
//       Download PDF
//     </button>
//   );
// };


// const PdfDownloader = ({ formContentIds }) => {
//   const downloadPDF = async () => {
//     const pdf = new jsPDF();
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const pageHeight = pdf.internal.pageSize.getHeight();
//     let currentYOffset = 0;

//     for (const [index, formContentId] of formContentIds.entries()) {
//       const input = document.getElementById(formContentId);

//       if (!input) {
//         console.error(`Element with ID "${formContentId}" not found.`);
//         continue;
//       }

//       const canvas = await html2canvas(input, { scale: 2 });
      
//       const imgWidth = pageWidth;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;

//       // Add new page for contents after first three on the first page
//       if (index > 4) {
//         pdf.addPage();
//         currentYOffset = 0;
//       }

//       // Check if image fits on current page
//       if (currentYOffset + imgHeight > pageHeight) {
//         pdf.addPage();
//         pdf.addPage();
//         currentYOffset = 0;
//       }

//       pdf.addImage(
//         canvas.toDataURL('image/png'), 
//         'PNG', 
//         0, 
//         currentYOffset, 
//         imgWidth, 
//         imgHeight
//       );

//       currentYOffset += imgHeight;
//     }

//     pdf.save('SessionPlan.pdf');
//   };



//   return (
//     <button
//       onClick={downloadPDF}
//       style={{
//         background: '#ff8800',
//         border: 'none',
//         padding: '20px',
//         borderRadius: '5px',
//         color: 'white',
//         fontSize: '16px',
//         marginBottom: '15px',
//         width: '200px',
//       }}
//     >
//       Download PDF
//     </button>
//   );
// };

const PdfDownloader = ({ formContentIds }) => {
  const downloadPDF = async () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let currentYOffset = 0;

    for (const [index, formContentId] of formContentIds.entries()) {
      const input = document.getElementById(formContentId);

      if (!input) {
        console.error(`Element with ID "${formContentId}" not found.`);
        continue;
      }

      const canvas = await html2canvas(input, { scale: 2 });
      
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add new page for contents after first three on the first page
      if (index > 2) {
        pdf.addPage();
        currentYOffset = 0;
      }

      // Special handling for last content
      if (index === formContentIds.length - 1) {
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png'), 
          'PNG', 
          0, 
          0, 
          imgWidth, 
          imgHeight
        );
        break;
      }

      // Check if image fits on current page
      if (currentYOffset + imgHeight > pageHeight) {
        pdf.addPage();
        currentYOffset = 0;
      }

      pdf.addImage(
        canvas.toDataURL('image/png'), 
        'PNG', 
        0, 
        currentYOffset, 
        imgWidth, 
        imgHeight
      );

      currentYOffset += imgHeight;
    }

    pdf.save('SessionPlan.pdf');
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






