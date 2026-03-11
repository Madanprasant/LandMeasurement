import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates a WhatsApp share link for a land survey
 */
export const getWhatsAppShareLink = (record, metrics) => {
  const name = record.title || "Land Survey";
  const areaCents = metrics.areaCents.toFixed(2);
  const areaSqFt = metrics.areaSqFt.toFixed(0);
  
  // Get center point for Google Maps link
  const centerLat = record.boundary[0].lat;
  const centerLng = record.boundary[0].lng;
  const mapsLink = `https://www.google.com/maps?q=${centerLat},${centerLng}`;

  // Using high-compatibility bold text instead of emojis that might fail on some devices
  const message = `*LAND SURVEY REPORT: ${name.toUpperCase()}*\n\n` +
                 `*Area:* ${areaCents} Cents (${areaSqFt} Sq.Ft)\n` +
                 `*Location:* ${mapsLink}\n\n` +
                 `_Sent via LandMeasurement App_`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
};

/**
 * Generates and downloads a Professional PDF Report
 */
export const generatePDFReport = (record, metrics) => {
  const doc = new jsPDF();
  const name = record.title || "Unnamed Property";
  const date = new Date().toLocaleDateString();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129); // Emerald 600
  doc.text("Land Measurement Report", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${date}`, 14, 30);
  doc.setLineWidth(0.5);
  doc.line(14, 35, 196, 35);

  // Property Info
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(name, 14, 45);

  // Metrics Table
  const tableData = [
    ["Metric", "Value"],
    ["Total Area (Cents)", `${metrics.areaCents.toFixed(3)} Cents`],
    ["Total Area (Sq.Ft)", `${metrics.areaSqFt.toLocaleString()} Sq.Ft`],
    ["Total Area (Acres)", `${metrics.areaAcres.toFixed(4)} Acres`],
    ["Total Area (Sq.M)", `${metrics.areaSqMeters.toFixed(2)} m²`],
  ];

  doc.autoTable({
    startY: 55,
    head: [tableData[0]],
    body: tableData.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] }
  });

  // Boundary Sides
  doc.setFontSize(14);
  doc.text("Boundary Segments", 14, doc.lastAutoTable.finalY + 15);
  
  const segmentsData = metrics.perimeters.map(s => [s.segment, `${s.feet.toFixed(2)} ft`, `${s.meters.toFixed(2)} m`]);
  
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [["Side", "Feet", "Meters"]],
    body: segmentsData,
    theme: 'grid',
    headStyles: { fillColor: [55, 65, 81] }
  });

  // Coordinates
  doc.setFontSize(12);
  doc.text("Boundary Coordinates", 14, doc.lastAutoTable.finalY + 15);
  const coordsData = record.boundary.map((p, i) => [`Point ${i+1}`, p.lat.toFixed(6), p.lng.toFixed(6)]);
  
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [["Point", "Latitude", "Longitude"]],
    body: coordsData,
    theme: 'compact',
  });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("LandMeasurement App - Accurate Real Estate Tools", 14, 285);

  doc.save(`${name.replace(/\s+/g, '_')}_Report.pdf`);
};
