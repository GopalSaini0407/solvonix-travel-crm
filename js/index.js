const revenueCanvas = document.getElementById('revenueChart');

if (revenueCanvas) {
        new Chart(revenueCanvas, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue (₹L)',
                    data: [18, 22, 29, 35, 42, 48],
                    borderColor: '#e94560',
                    backgroundColor: 'rgba(233,69,96,0.12)',
                    fill: true,
                    tension: 0.35
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
}
