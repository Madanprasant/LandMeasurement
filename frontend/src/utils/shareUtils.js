import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a WhatsApp share link for a land survey
 */
export const getWhatsAppShareLink = (record, metrics) => {
  const name = record.title || "Land Survey";
  const areaCents = (metrics?.areaCents || 0).toFixed(2);
  const areaSqFt = (metrics?.areaSqFt || 0).toFixed(0);
  
  // Get center point for Google Maps link safely
  const boundary = record?.boundary || [];
  const centerLat = boundary.length > 0 ? boundary[0].lat : 0;
  const centerLng = boundary.length > 0 ? boundary[0].lng : 0;
  const mapsLink = `https://www.google.com/maps?q=${centerLat},${centerLng}`;

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
  try {
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
      ["Total Area (Cents)", `${metrics?.areaCents.toFixed(3)} Cents`],
      ["Total Area (Sq.Ft)", `${metrics?.areaSqFt.toLocaleString()} Sq.Ft`],
      ["Total Area (Acres)", `${metrics?.areaAcres.toFixed(4)} Acres`],
      ["Total Area (Sq.M)", `${metrics?.areaSqMeters.toFixed(2)} m²`],
    ];

    autoTable(doc, {
      startY: 55,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }
    });

    // Boundary Sides
    doc.setFontSize(14);
    doc.text("Boundary Segments", 14, doc.lastAutoTable.finalY + 15);
    
    const perimeters = metrics?.perimeters || [];
    const segmentsData = perimeters.map(s => [s.segment, `${s.feet.toFixed(2)} ft`, `${s.meters.toFixed(2)} m`]);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Side", "Feet", "Meters"]],
      body: segmentsData,
      theme: 'grid',
      headStyles: { fillColor: [55, 65, 81] }
    });

    // Coordinates
    doc.setFontSize(12);
    doc.text("Boundary Coordinates", 14, doc.lastAutoTable.finalY + 15);
    const boundary = record?.boundary || [];
    const coordsData = boundary.map((p, i) => [`Point ${i+1}`, p.lat.toFixed(6), p.lng.toFixed(6)]);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Point", "Latitude", "Longitude"]],
      body: coordsData,
      theme: 'plain',
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("LandMeasurement App - Accurate Real Estate Tools", 14, 285);

    doc.save(`${name.replace(/\s+/g, '_')}_Report.pdf`);
  } catch (err) {
    console.error("PDF Generation Error:", err);
  }
};
