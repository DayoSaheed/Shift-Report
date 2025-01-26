// Get reports from localStorage
const getReports = () => {
    return JSON.parse(localStorage.getItem('shiftReports') || '[]');
};

// Filter reports by date range
const filterReportsByDate = (reports, days) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return reports.filter(report => new Date(report.shiftDate) >= cutoffDate);
};

// Calculate key metrics
const calculateMetrics = (reports) => {
    const metrics = {
        totalReports: reports.length,
        avgReportsPerDay: 0,
        shiftCounts: {},
        departmentCounts: {}
    };

    reports.forEach(report => {
        // Count shifts
        metrics.shiftCounts[report.shiftType] = (metrics.shiftCounts[report.shiftType] || 0) + 1;
        // Count departments
        metrics.departmentCounts[report.department] = (metrics.departmentCounts[report.department] || 0) + 1;
    });

    // Calculate average reports per day
    const days = document.getElementById('timeRange').value;
    metrics.avgReportsPerDay = (metrics.totalReports / days).toFixed(1);

    // Find most active shift
    metrics.mostActiveShift = Object.entries(metrics.shiftCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    // Find top department
    metrics.topDepartment = Object.entries(metrics.departmentCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    return metrics;
};

// Update metric cards
const updateMetricCards = (metrics) => {
    document.querySelector('#totalReports .metric-value').textContent = metrics.totalReports;
    document.querySelector('#avgReportsPerDay .metric-value').textContent = metrics.avgReportsPerDay;
    document.querySelector('#mostActiveShift .metric-value').textContent = 
        metrics.mostActiveShift.charAt(0).toUpperCase() + metrics.mostActiveShift.slice(1);
    document.querySelector('#topDepartment .metric-value').textContent = 
        metrics.topDepartment.charAt(0).toUpperCase() + metrics.topDepartment.slice(1);
};

// Create department chart
const createDepartmentChart = (metrics) => {
    const ctx = document.getElementById('departmentChart').getContext('2d');
    
    if (window.departmentChart) {
        window.departmentChart.destroy();
    }

    window.departmentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(metrics.departmentCounts).map(dept => 
                dept.charAt(0).toUpperCase() + dept.slice(1)
            ),
            datasets: [{
                data: Object.values(metrics.departmentCounts),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
};

// Create shift type chart
const createShiftChart = (metrics) => {
    const ctx = document.getElementById('shiftChart').getContext('2d');
    
    if (window.shiftChart) {
        window.shiftChart.destroy();
    }

    window.shiftChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(metrics.shiftCounts).map(shift => 
                shift.charAt(0).toUpperCase() + shift.slice(1)
            ),
            datasets: [{
                data: Object.values(metrics.shiftCounts),
                backgroundColor: [
                    '#FF9F40',
                    '#4BC0C0',
                    '#36A2EB'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
};

// Create trend chart
const createTrendChart = (reports) => {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    // Group reports by date
    const reportsByDate = {};
    reports.forEach(report => {
        const date = report.shiftDate.split('T')[0];
        reportsByDate[date] = (reportsByDate[date] || 0) + 1;
    });

    // Sort dates and get last 30 days
    const sortedDates = Object.keys(reportsByDate).sort();
    const labels = sortedDates.slice(-30);
    const data = labels.map(date => reportsByDate[date] || 0);

    if (window.trendChart) {
        window.trendChart.destroy();
    }

    window.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Reports per Day',
                data: data,
                borderColor: '#36A2EB',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
};

// Update activity table
const updateActivityTable = (reports) => {
    const tbody = document.querySelector('#activityTable tbody');
    const recentReports = reports.slice(-10).reverse(); // Get last 10 reports

    tbody.innerHTML = recentReports.map(report => `
        <tr>
            <td>${new Date(report.shiftDate).toLocaleDateString()}</td>
            <td>${report.department.charAt(0).toUpperCase() + report.department.slice(1)}</td>
            <td>${report.shiftType.charAt(0).toUpperCase() + report.shiftType.slice(1)}</td>
            <td>${report.employeeName}</td>
        </tr>
    `).join('');
};

// Update all analytics
const updateAnalytics = () => {
    const days = parseInt(document.getElementById('timeRange').value);
    const allReports = getReports();
    const filteredReports = filterReportsByDate(allReports, days);
    const metrics = calculateMetrics(filteredReports);

    updateMetricCards(metrics);
    createDepartmentChart(metrics);
    createShiftChart(metrics);
    createTrendChart(filteredReports);
    updateActivityTable(allReports);
};

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
    // Set up time range change listener
    document.getElementById('timeRange').addEventListener('change', updateAnalytics);
    
    // Initial update
    updateAnalytics();
});