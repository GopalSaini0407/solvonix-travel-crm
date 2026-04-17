new Chart(document.getElementById('funnelChart'), {
            type: 'bar',
            data: {
                labels: ['New Leads', 'Qualified', 'Quote Sent', 'Negotiation', 'Booked'],
                datasets: [{
                    label: 'Lead Count',
                    data: [248, 174, 132, 94, 87],
                    backgroundColor: ['#e94560', '#10b981', '#3b82f6', '#f59e0b', '#0f3460'],
                    borderRadius: 10
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });

        new Chart(document.getElementById('revenueChart'), {
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