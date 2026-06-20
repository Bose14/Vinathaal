import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generatePDF = async (elementId: string, filename: string): Promise<Blob | undefined> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  const marginInInches = 0.5;
  const pdf = new jsPDF({ unit: 'in', format: 'letter', orientation: 'portrait' });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const canvas = await html2canvas(element, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const imgWidth = pageWidth - 2 * marginInInches;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let y = marginInInches;
  pdf.addImage(imgData, 'JPEG', marginInInches, y, imgWidth, imgHeight);

  while (y + imgHeight > pageHeight) {
    y -= pageHeight - 2 * marginInInches;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', marginInInches, y, imgWidth, imgHeight);
  }

  return pdf.output('blob') as Blob;
};
