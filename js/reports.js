// Reports page specific JavaScript
        let trendChart, sourceChart, funnelChart, clvChart;
        
        // Sample data for reports
        const sourceData = [
            { source: 'Google Ads', leads: 245, qualified: 189, quotations: 156, bookings: 98, revenue: 2450000, cost: 45000 },
            { source: 'Referral', leads: 187, qualified: 156, quotations: 134, bookings: 89, revenue: 2225000, cost: 5000 },
            { source: 'Instagram', leads: 134, qualified: 98, quotations: 78, bookings: 45, revenue: 1125000, cost: 25000 },
            { source: 'Facebook', leads: 98, qualified: 76, quotations: 62, bookings: 34, revenue: 850000, cost: 20000 },
            { source: 'Website', leads: 76, qualified: 58, quotations: 48, bookings: 28, revenue: 700000, cost: 15000 },
            { source: 'WhatsApp', leads: 45, qualified: 34, quotations: 28, bookings: 18, revenue: 450000, cost: 5000 }
        ];
        
        const agentData = [
            { name: 'Neha Singh', assigned: 89, contacted: 82, quotations: 76, negotiations: 45, won: 56, revenue: 1450000, target: 1200000 },
            { name: 'Amit Patel', assigned: 76, contacted: 68, quotations: 62, negotiations: 38, won: 44, revenue: 1150000, target: 1000000 },
            { name: 'Rajesh Kumar', assigned: 65, contacted: 60, quotations: 55, negotiations: 32, won: 38, revenue: 980000, target: 900000 },
            { name: 'Priya Sharma', assigned: 54, contacted: 50, quotations: 46, negotiations: 28, won: 32, revenue: 820000, target: 750000 },
            { name: 'Sanjay Mehta', assigned: 43, contacted: 38, quotations: 34, negotiations: 22, won: 24, revenue: 620000, target: 600000 }
        ];
        
        const destinationData = [
            { destination: 'Goa', leads: 156, bookings: 78, revenue: 1950000, avgPackage: 25000, season: 'Nov-Feb', growth: '+15%' },
            { destination: 'Kerala', leads: 134, bookings: 65, revenue: 1625000, avgPackage: 25000, season: 'Sep-Mar', growth: '+12%' },
            { destination: 'Rajasthan', leads: 112, bookings: 52, revenue: 1300000, avgPackage: 25000, season: 'Oct-Mar', growth: '+10%' },
            { destination: 'Kashmir', leads: 98, bookings: 48, revenue: 1200000, avgPackage: 25000, season: 'Apr-Jun, Dec-Jan', growth: '+18%' },
            { destination: 'Himachal', leads: 87, bookings: 42, revenue: 1050000, avgPackage: 25000, season: 'Mar-Jun', growth: '+8%' }
        ];
        
        const monthlyTrend = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            leads: [45, 52, 58, 62, 68, 72, 78, 82, 88, 92, 95, 98],
            revenue: [450000, 520000, 580000, 620000, 680000, 720000, 780000, 820000, 880000, 920000, 950000, 980000]
        };
        
        function calculateROI() {
            const totalRevenue = sourceData.reduce((sum, s) => sum + s.revenue, 0);
            const totalCost = sourceData.reduce((sum, s) => sum + s.cost, 0);
            const roi = ((totalRevenue - totalCost) / totalCost) * 100;
            return { roi: roi.toFixed(1), revenue: totalRevenue, cost: totalCost };
        }
        
        function updateDashboardMetrics() {
            const { roi, revenue, cost } = calculateROI();
            const totalLeads = sourceData.reduce((sum, s) => sum + s.leads, 0);
            const totalBookings = sourceData.reduce((sum, s) => sum + s.bookings, 0);
            const conversionRate = totalLeads > 0 ? ((totalBookings / totalLeads) * 100).toFixed(1) : 0;
            
            document.getElementById('roiValue').innerHTML = roi + '%';
            document.getElementById('totalRevenue').innerHTML = '₹' + (revenue / 100000).toFixed(1) + 'L';
            document.getElementById('totalLeadsReport').innerText = totalLeads;
            document.getElementById('conversionReport').innerText = conversionRate + '%';
            
            // Executive summary
            document.getElementById('execRevenue').innerHTML = '₹' + (revenue / 100000).toFixed(1) + 'L';
            document.getElementById('execProfit').innerHTML = '₹' + ((revenue - cost) / 100000).toFixed(1) + 'L';
            document.getElementById('execROI').innerHTML = roi + '%';
            document.getElementById('execCSAT').innerHTML = '92%';
            
            // Find top agent
            const topAgent = agentData.reduce((max, a) => a.revenue > max.revenue ? a : max, agentData[0]);
            document.getElementById('execTopAgent').innerHTML = topAgent.name;
            
            // Find best source
            const bestSource = sourceData.reduce((max, s) => s.revenue > max.revenue ? s : max, sourceData[0]);
            document.getElementById('execBestSource').innerHTML = bestSource.source;
        }
        
        function renderSourceEffectivenessTable() {
            const tbody = document.getElementById('sourceEffectivenessTable');
            if (!tbody) return;
            
            const totalRevenue = sourceData.reduce((sum, s) => sum + s.revenue, 0);
            
            tbody.innerHTML = sourceData.map(s => {
                const conversionRate = s.leads > 0 ? ((s.bookings / s.leads) * 100).toFixed(1) : 0;
                const roi = s.cost > 0 ? (((s.revenue - s.cost) / s.cost) * 100).toFixed(1) : 0;
                const costPerLead = s.leads > 0 ? (s.cost / s.leads).toFixed(0) : 0;
                return `
                    <tr>
                        <td>${s.source}</td>
                        <td>${s.leads}</td>
                        <td>${s.qualified}</td>
                        <td>${s.quotations}</td>
                        <td>${s.bookings}</td>
                        <td>₹${(s.revenue / 100000).toFixed(1)}L</td>
                        <td>${conversionRate}%</td>
                        <td><span style="color: ${roi > 0 ? '#10b981' : '#ef4444'};">${roi}%</span></td>
                        <td>₹${costPerLead}</td>
                    </tr>
                `;
            }).join('');
        }
        
        function renderAgentPerformanceTable() {
            const tbody = document.getElementById('agentPerformanceTable');
            if (!tbody) return;
            
            tbody.innerHTML = agentData.map(a => {
                const conversionRate = a.assigned > 0 ? ((a.won / a.assigned) * 100).toFixed(1) : 0;
                const avgDealSize = a.won > 0 ? (a.revenue / a.won).toFixed(0) : 0;
                const bonus = a.revenue >= a.target ? (a.revenue - a.target) * 0.05 : 0;
                return `
                    <tr>
                        <td><i class="fas fa-user-circle"></i> ${a.name}</td>
                        <td>${a.assigned}</td>
                        <td>${a.contacted}</td>
                        <td>${a.quotations}</td>
                        <td>${a.negotiations}</td>
                        <td><strong>${a.won}</strong></td>
                        <td>${conversionRate}%</td>
                        <td>₹${(a.revenue / 100000).toFixed(1)}L</td>
                        <td>₹${(avgDealSize / 1000).toFixed(0)}K</td>
                        <td><span style="color: #10b981;">₹${(bonus / 1000).toFixed(0)}K</span></td>
                    </tr>
                `;
            }).join('');
        }
        
        function renderDestinationTable() {
            const tbody = document.getElementById('destinationTable');
            if (!tbody) return;
            
            tbody.innerHTML = destinationData.map(d => `
                <tr>
                    <td><i class="fas fa-map-pin"></i> ${d.destination}</td>
                    <td>${d.leads}</td>
                    <td>${d.bookings}</td>
                    <td>₹${(d.revenue / 100000).toFixed(1)}L</td>
                    <td>₹${(d.avgPackage / 1000).toFixed(0)}K</td>
                    <td>${d.season}</td>
                    <td><span style="color: #10b981;">${d.growth}</span></td>
                </tr>
            `).join('');
        }
        
        function updateFunnel() {
            const totalLeads = sourceData.reduce((sum, s) => sum + s.leads, 0);
            const totalQualified = sourceData.reduce((sum, s) => sum + s.qualified, 0);
            const totalQuotations = sourceData.reduce((sum, s) => sum + s.quotations, 0);
            const totalBookings = sourceData.reduce((sum, s) => sum + s.bookings, 0);
            
            document.getElementById('funnelLeads').innerText = totalLeads;
            document.getElementById('funnelQualified').innerText = totalQualified;
            document.getElementById('funnelQuotations').innerText = totalQuotations;
            document.getElementById('funnelBookings').innerText = totalBookings;
            
            document.getElementById('funnelQualifiedFill').style.width = ((totalQualified / totalLeads) * 100) + '%';
            document.getElementById('funnelQuoteFill').style.width = ((totalQuotations / totalLeads) * 100) + '%';
            document.getElementById('funnelBookingFill').style.width = ((totalBookings / totalLeads) * 100) + '%';
        }
        
        function updateCLVStats() {
            const totalRevenue = sourceData.reduce((sum, s) => sum + s.revenue, 0);
            const totalCustomers = sourceData.reduce((sum, s) => sum + s.bookings, 0);
            const avgCLV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
            
            document.getElementById('avgCLV').innerHTML = '₹' + (avgCLV / 1000).toFixed(0) + 'K';
            document.getElementById('repeatRate').innerHTML = '34%';
            document.getElementById('avgBookings').innerHTML = '1.4';
            document.getElementById('churnRate').innerHTML = '28%';
        }
        
        function renderMonthlySummary() {
            const container = document.getElementById('monthlySummary');
            if (!container) return;
            
            const currentMonth = new Date().getMonth();
            const currentMonthData = {
                leads: monthlyTrend.leads[currentMonth],
                revenue: monthlyTrend.revenue[currentMonth]
            };
            const prevMonthData = {
                leads: monthlyTrend.leads[currentMonth - 1] || 0,
                revenue: monthlyTrend.revenue[currentMonth - 1] || 0
            };
            
            const leadGrowth = prevMonthData.leads > 0 ? (((currentMonthData.leads - prevMonthData.leads) / prevMonthData.leads) * 100).toFixed(1) : 0;
            const revenueGrowth = prevMonthData.revenue > 0 ? (((currentMonthData.revenue - prevMonthData.revenue) / prevMonthData.revenue) * 100).toFixed(1) : 0;
            
            container.innerHTML = `
                <div class="d-flex justify-content-between mb-2"><span>Current Month Leads:</span><strong>${currentMonthData.leads}</strong> <span style="color: ${leadGrowth >= 0 ? '#10b981' : '#ef4444'};">${leadGrowth >= 0 ? '+' : ''}${leadGrowth}%</span></div>
                <div class="d-flex justify-content-between mb-2"><span>Current Month Revenue:</span><strong>₹${(currentMonthData.revenue / 100000).toFixed(1)}L</strong> <span style="color: ${revenueGrowth >= 0 ? '#10b981' : '#ef4444'};">${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%</span></div>
                <div class="d-flex justify-content-between mb-2"><span>QoQ Growth:</span><strong>+8.5%</strong></div>
                <div class="d-flex justify-content-between"><span>YoY Growth:</span><strong>+24%</strong></div>
            `;
        }
        
        function initCharts() {
            // Trend Chart
            const trendCtx = document.getElementById('trendChart')?.getContext('2d');
            if (trendCtx) {
                if (trendChart) trendChart.destroy();
                trendChart = new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: monthlyTrend.labels,
                        datasets: [
                            {
                                label: 'Leads',
                                data: monthlyTrend.leads,
                                borderColor: '#e94560',
                                backgroundColor: 'rgba(233, 69, 96, 0.05)',
                                tension: 0.4,
                                fill: true,
                                yAxisID: 'y'
                            },
                            {
                                label: 'Revenue (₹ Lakhs)',
                                data: monthlyTrend.revenue.map(r => r / 100000),
                                borderColor: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                                tension: 0.4,
                                fill: true,
                                yAxisID: 'y1'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: { legend: { position: 'top' } },
                        scales: { y: { beginAtZero: true, title: { display: true, text: 'Leads Count' } }, y1: { position: 'right', beginAtZero: true, title: { display: true, text: 'Revenue (₹ Lakhs)' } } }
                    }
                });
            }
            
            // Source Pie Chart
            const sourceCtx = document.getElementById('sourceChart')?.getContext('2d');
            if (sourceCtx) {
                if (sourceChart) sourceChart.destroy();
                sourceChart = new Chart(sourceCtx, {
                    type: 'pie',
                    data: {
                        labels: sourceData.map(s => s.source),
                        datasets: [{ data: sourceData.map(s => s.leads), backgroundColor: ['#e94560', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec489a'] }]
                    },
                    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }
                });
            }
            
            // CLV Chart
            const clvCtx = document.getElementById('clvChart')?.getContext('2d');
            if (clvCtx) {
                if (clvChart) clvChart.destroy();
                clvChart = new Chart(clvCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'],
                        datasets: [{ label: 'CLV (₹)', data: [25000, 45000, 75000, 120000, 200000], backgroundColor: '#e94560', borderRadius: 8 }]
                    },
                    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'top' } } }
                });
            }
        }
        
        function refreshReports() {
            updateDashboardMetrics();
            renderSourceEffectivenessTable();
            renderAgentPerformanceTable();
            renderDestinationTable();
            updateFunnel();
            updateCLVStats();
            renderMonthlySummary();
            initCharts();
            showToast('Reports Refreshed', 'All metrics have been updated');
        }
        
        function exportReport() {
            showToast('Export Started', 'Report is being exported to Excel');
        }
        
        function exportPDF() {
            showToast('Export Started', 'Report is being exported to PDF');
        }
        
        // Initialize reports
        function initializeReports() {
            refreshReports();
        }
        
        document.addEventListener('DOMContentLoaded', function() {
            if (getCurrentPage() === 'reports') {
                initializeReports();
            }
        });