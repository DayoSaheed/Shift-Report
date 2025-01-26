import PDFGenerator from './pdfGenerator.js';
// Store reports in localStorage
const STORAGE_KEY = 'shiftReports';

// Utility functions
const getReports = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
};

const saveReport = (report) => {
    const reports = getReports();
    reports.push({
        ...report,
        id: Date.now(),
        timestamp: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

// Form handling
document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('reportForm');
    
    if (reportForm) {
        reportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(reportForm);
            const reportData = {
                shiftDate: formData.get('shiftDate'),
                shiftType: formData.get('shiftType'),
                employeeName: formData.get('employeeName'),
                department: formData.get('department'),
                activities: formData.get('activities'),
                issues: formData.get('issues'),
                handover: formData.get('handover')
            };
            
            saveReport(reportData);
            alert('Report submitted successfully!');
            reportForm.reset();
            window.location.href = 'view-reports.html';
        });
    }
    
    // Load reports on the view page
    const reportsContainer = document.getElementById('reportsContainer');
    if (reportsContainer) {
        const reports = getReports();
        
        if (reports.length === 0) {
            reportsContainer.innerHTML = '<p>No reports available.</p>';
            return;
        }
        
        const reportsHTML = reports.map(report => `
            <div class="report-card">
                <h3>Shift Report - ${new Date(report.shiftDate).toLocaleDateString()}</h3>
                <p><strong>Employee:</strong> ${report.employeeName}</p>
                <p><strong>Department:</strong> ${report.department}</p>
                <p><strong>Shift Type:</strong> ${report.shiftType}</p>
                <details>
                    <summary>View Details</summary>
                    <p><strong>Activities:</strong> ${report.activities}</p>
                    <p><strong>Issues:</strong> ${report.issues}</p>
                    <p><strong>Handover Notes:</strong> ${report.handover}</p>
                </details>
            </div>
        `).join('');
        
        reportsContainer.innerHTML = reportsHTML;
    }
    
    // Analytics page functionality
    const analyticsContainer = document.getElementById('analyticsContainer');
    if (analyticsContainer) {
        const reports = getReports();
        
        // Simple analytics
        const departments = {};
        const shiftTypes = {};
        
        reports.forEach(report => {
            departments[report.department] = (departments[report.department] || 0) + 1;
            shiftTypes[report.shiftType] = (shiftTypes[report.shiftType] || 0) + 1;
        });
        
        analyticsContainer.innerHTML = `
            <div class="analytics-card">
                <h3>Reports Overview</h3>
                <p>Total Reports: ${reports.length}</p>
                <h4>Reports by Department</h4>
                <ul>
                    ${Object.entries(departments).map(([dept, count]) => 
                        `<li>${dept}: ${count} reports</li>`
                    ).join('')}
                </ul>
                <h4>Reports by Shift Type</h4>
                <ul>
                    ${Object.entries(shiftTypes).map(([shift, count]) => 
                        `<li>${shift}: ${count} reports</li>`
                    ).join('')}
                </ul>
            </div>
        `;
    }
});

// Search functionality
const searchReports = (query) => {
    const reports = getReports();
    return reports.filter(report => 
        report.employeeName.toLowerCase().includes(query.toLowerCase()) ||
        report.department.toLowerCase().includes(query.toLowerCase()) ||
        report.activities.toLowerCase().includes(query.toLowerCase())
    );
};

// Initialize search if search input exists
const searchInput = document.getElementById('searchReports');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        const filteredReports = searchReports(query);
        updateReportsDisplay(filteredReports);
    });
}

// Update the reports display function to include PDF download button
const updateReportsDisplay = (reports) => {
    const reportsContainer = document.getElementById('reportsContainer');
    
    if (!reports.length) {
        reportsContainer.innerHTML = '<p>No reports found.</p>';
        return;
    }

    const reportsHTML = reports.map(report => `
        <div class="report-card">
            <h3>Shift Report - ${new Date(report.shiftDate).toLocaleDateString()}</h3>
            <p><strong>Employee:</strong> ${report.employeeName}</p>
            <p><strong>Department:</strong> ${report.department}</p>
            <p><strong>Shift Type:</strong> ${report.shiftType}</p>
            <details>
                <summary>View Details</summary>
                <p><strong>Activities:</strong> ${report.activities}</p>
                <p><strong>Issues:</strong> ${report.issues}</p>
                <p><strong>Handover Notes:</strong> ${report.handover}</p>
            </details>
            <button onclick="downloadPDF(${JSON.stringify(report)})" class="btn btn-download">
                Download PDF
            </button>
        </div>
    `).join('');
    
    reportsContainer.innerHTML = reportsHTML;
};

// Add PDF download functionality
window.downloadPDF = (reportData) => {
    const pdfGenerator = new PDFGenerator();
    pdfGenerator.generateReportPDF(reportData);
};

// Add filter functionality
const departmentFilter = document.getElementById('departmentFilter');
const dateFilter = document.getElementById('dateFilter');

if (departmentFilter && dateFilter) {
    const filterReports = () => {
        const department = departmentFilter.value;
        const dateRange = dateFilter.value;
        const reports = getReports();
        
        let filteredReports = reports;

        if (department) {
            filteredReports = filteredReports.filter(report => 
                report.department === department
            );
        }

        if (dateRange) {
            const today = new Date();
            const startDate = new Date();
            
            switch(dateRange) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate.setDate(today.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(today.getMonth() - 1);
                    break;
            }

            filteredReports = filteredReports.filter(report => 
                new Date(report.shiftDate) >= startDate
            );
        }

        updateReportsDisplay(filteredReports);
    };

    departmentFilter.addEventListener('change', filterReports);
    dateFilter.addEventListener('change', filterReports);
}