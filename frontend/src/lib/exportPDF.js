import jsPDF from 'jspdf';

export function exportItineraryPdf(trip) {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(trip.title || 'My Trip', margin, y);
    y += 10;

    // Destination + dates
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Destination: ${trip.destination}`, margin, y);
    y += 7;
    if (trip.startDate) {
        doc.text(`Dates: ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`, margin, y);
        y += 7;
    }

    // Budget
    if (trip.budget?.total) {
        doc.text(`Budget: ${trip.budget.currency} ${trip.budget.total}`, margin, y);
        y += 12;
    }

    // Itinerary days
    if (trip.itinerary?.length > 0) {
        trip.itinerary.forEach((day, i) => {
            if (y > 260) { doc.addPage(); y = margin; }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`Day ${day.day || i + 1}: ${day.theme || ''}`, margin, y);
            y += 8;

            (day.activities || []).forEach(act => {
                if (y > 260) { doc.addPage(); y = margin; }
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(`${act.time || ''} - ${act.name}`, margin + 5, y);
                y += 5;
                if (act.description) {
                    const lines = doc.splitTextToSize(act.description, 160);
                    doc.text(lines, margin + 10, y);
                    y += lines.length * 5;
                }
                y += 3;
            });
            y += 5;
        });
    }

    // Tips
    if (trip.tips?.length > 0) {
        if (y > 240) { doc.addPage(); y = margin; }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Travel Tips', margin, y);
        y += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        trip.tips.forEach(tip => {
            if (y > 260) { doc.addPage(); y = margin; }
            doc.text(`• ${tip}`, margin + 5, y);
            y += 6;
        });
    }

    doc.save(`${trip.title || 'trip'}-itinerary.pdf`);
}
