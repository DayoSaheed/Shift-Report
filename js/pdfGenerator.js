class PDFGenerator {
    constructor() {
        this.doc = new jsPDF();
    }

    generateReportPDF(reportData) {
        // Set title
        this.doc.setFontSize(20);
        this.doc.text('Shift Report', 20, 20);

        // Add report details
        this.doc.setFontSize(12);
        this.doc.text(`Date: ${new Date(reportData.shiftDate).toLocaleDateString()}`, 20, 40);
        this.doc.text(`Shift Type: ${reportData.shiftType}`, 20, 50);
        this.doc.text(`Employee: ${reportData.employeeName}`, 20, 60);
        this.doc.text(`Department: ${reportData.department}`, 20, 70);

        // Add sections with content
        this.addSection('Activities Completed', reportData.activities, 90);
        this.addSection('Issues/Incidents', reportData.issues, 130);
        this.addSection('Handover Notes', reportData.handover, 170);

        // Add footer
        this.doc.setFontSize(10);
        this.doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 280);

        // Save the PDF
        this.doc.save(`shift-report-${reportData.shiftDate}.pdf`);
    }

    addSection(title, content, yPosition) {
        this.doc.setFontSize(14);
        this.doc.text(title, 20, yPosition);
        
        this.doc.setFontSize(12);
        const splitContent = this.doc.splitTextToSize(content, 170);
        this.doc.text(splitContent, 20, yPosition + 10);
    }
}

export default PDFGenerator;