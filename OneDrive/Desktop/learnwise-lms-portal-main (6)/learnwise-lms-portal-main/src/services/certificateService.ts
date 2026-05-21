
import api from './api';
import { jsPDF } from 'jspdf';

// Get all certificates for the logged-in student
export const getMyCertificates = async () => {
  try {
    const response = await api.get('/certificates/student');
    return response.data;
  } catch (error) {
    console.error('Get certificates error:', error);
    throw error;
  }
};

// Verify certificate by ID
export const verifyCertificate = async (certificateId: string) => {
  try {
    const response = await api.get(`/certificates/${certificateId}/verify`);
    return response.data;
  } catch (error) {
    console.error('Verify certificate error:', error);
    throw error;
  }
};

// Generate sample certificate for completed courses
export const generateSampleCertificate = (course: any, userName: string) => {
  return {
    _id: `cert_${course._id}`,
    certificateId: `CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`,
    course: course,
    student: userName,
    issuedAt: new Date().toISOString(),
  };
};

// Generate PDF certificate
export const generateCertificatePdf = (certificate: any, userName: string) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set background color
  doc.setFillColor(240, 240, 250);
  doc.rect(0, 0, 297, 210, 'F');
  
  // Add border
  doc.setDrawColor(100, 100, 200);
  doc.setLineWidth(5);
  doc.rect(10, 10, 277, 190);
  
  // Add title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(50, 50, 150);
  doc.text('CERTIFICATE OF COMPLETION', 148.5, 40, { align: 'center' });
  
  // Add decorative line
  doc.setLineWidth(1);
  doc.line(74, 45, 223, 45);
  
  // Certificate text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(60, 60, 60);
  doc.text('This is to certify that', 148.5, 70, { align: 'center' });
  
  // Student name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text(userName, 148.5, 85, { align: 'center' });
  
  // Course completion text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.text('has successfully completed the course', 148.5, 100, { align: 'center' });
  
  // Course name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(certificate.course.title, 148.5, 115, { align: 'center' });
  
  // Issue date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  const issueDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Issued on: ${issueDate}`, 148.5, 135, { align: 'center' });
  
  // Certificate ID
  doc.setFontSize(12);
  doc.text(`Certificate ID: ${certificate.certificateId}`, 148.5, 145, { align: 'center' });
  
  // Signature placeholder
  doc.setLineWidth(0.5);
  doc.line(60, 170, 120, 170);
  doc.text('Instructor Signature', 90, 180, { align: 'center' });
  
  // Institution seal/logo placeholder
  doc.setDrawColor(100, 100, 200);
  doc.setLineWidth(0.5);
  doc.circle(200, 170, 15, 'S');
  doc.text('Institution Seal', 200, 180, { align: 'center' });
  
  // Return the PDF document as a blob
  return doc.output('blob');
};

// Download certificate
export const downloadCertificate = (certificate: any, userName: string) => {
  const pdfBlob = generateCertificatePdf(certificate, userName);
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `certificate-${certificate.certificateId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
