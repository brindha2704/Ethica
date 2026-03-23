/**
 * Pure JavaScript Charting helpers using raw Chart.js
 */

export function createTeamPerformanceChart(canvasId, stats) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Destroy existing chart if it exists (for refreshes)
    const existingChart = Chart.getChart(canvasId);
    if (existingChart) existingChart.destroy();

    const labels = stats.map(s => s.department);

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Completed',
                    data: stats.map(s => s.completed),
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1
                },
                {
                    label: 'In Progress',
                    data: stats.map(s => s.in_progress),
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                },
                {
                    label: 'Overdue',
                    data: stats.map(s => s.overdue),
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#ffffff' }
                },
                title: {
                    display: true,
                    text: 'Team Performance Overview',
                    color: '#3b82f6',
                    font: { size: 16 }
                }
            },
            scales: {
                x: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

export function createDepartmentDistributionChart(canvasId, stats) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const existingChart = Chart.getChart(canvasId);
    if (existingChart) existingChart.destroy();

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: stats.map(s => s.department),
            datasets: [{
                data: stats.map(s => s.total),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(147, 51, 234, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(34, 197, 94, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#ffffff' }
                },
                title: {
                    display: true,
                    text: 'Task Distribution by Team',
                    color: '#3b82f6',
                    font: { size: 16 }
                }
            }
        }
    });
}
