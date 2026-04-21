// Campaigns page specific JavaScript
        let campaigns = [];
        
        // Sample campaign data
        const sampleCampaigns = [
            { id: 1, name: 'Visa & Documents Reminder', trigger: '30 days before', status: 'active', sent: 245, opens: 189, clicks: 98, channel: 'Email, WhatsApp', lastRun: '2024-02-15' },
            { id: 2, name: 'Packing Checklist', trigger: '7 days before', status: 'active', sent: 198, opens: 156, clicks: 87, channel: 'Email', lastRun: '2024-02-14' },
            { id: 3, name: 'Final Payment Reminder', trigger: '15 days before', status: 'active', sent: 167, opens: 134, clicks: 45, channel: 'Email, SMS', lastRun: '2024-02-13' },
            { id: 4, name: 'Weather & Travel Tips', trigger: '5 days before', status: 'draft', sent: 0, opens: 0, clicks: 0, channel: 'WhatsApp', lastRun: null },
            { id: 5, name: 'Check-in Instructions', trigger: '1 day before', status: 'active', sent: 312, opens: 278, clicks: 156, channel: 'Email, WhatsApp', lastRun: '2024-02-12' },
            { id: 6, name: 'Post-Trip Feedback', trigger: '1 day after', status: 'active', sent: 234, opens: 189, clicks: 67, channel: 'Email', lastRun: '2024-02-11' }
        ];

        function updateCampaignStats() {
            const active = campaigns.filter(c => c.status === 'active').length;
            const totalSent = campaigns.reduce((sum, c) => sum + (c.sent || 0), 0);
            const totalOpens = campaigns.reduce((sum, c) => sum + (c.opens || 0), 0);
            const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
            const openRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : 0;
            const clickRate = totalOpens > 0 ? ((totalClicks / totalOpens) * 100).toFixed(1) : 0;
            
            document.getElementById('activeCampaigns').innerText = active;
            document.getElementById('totalSent').innerText = totalSent.toLocaleString();
            document.getElementById('openRate').innerText = openRate + '%';
            document.getElementById('clickRate').innerText = clickRate + '%';
            
            // Update performance bars
            document.getElementById('emailOpenRate').innerText = openRate + '%';
            document.getElementById('emailOpenFill').style.width = openRate + '%';
            document.getElementById('whatsappReadRate').innerText = (openRate * 0.85).toFixed(1) + '%';
            document.getElementById('whatsappReadFill').style.width = (openRate * 0.85) + '%';
            document.getElementById('smsDeliveryRate').innerText = '92%';
            document.getElementById('smsDeliveryFill').style.width = '92%';
            document.getElementById('campaignConvRate').innerText = (clickRate * 0.6).toFixed(1) + '%';
            document.getElementById('campaignConvFill').style.width = (clickRate * 0.6) + '%';
        }

        function renderCampaigns() {
            const container = document.getElementById('campaignsContainer');
            if (!container) return;
            
            container.innerHTML = campaigns.map(c => `
                <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 15px; border-left: 4px solid ${c.status === 'active' ? '#10b981' : '#cbd5e1'};">
                    <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                <h4 style="margin: 0;">${c.name}</h4>
                                <span class="status-badge ${c.status === 'active' ? 'status-won' : 'status-new'}">${c.status}</span>
                            </div>
                            <div style="margin-top: 8px; display: flex; gap: 20px; flex-wrap: wrap;">
                                <span style="font-size: 13px;"><i class="fas fa-clock"></i> Trigger: ${c.trigger}</span>
                                <span style="font-size: 13px;"><i class="fas fa-envelope"></i> Channel: ${c.channel}</span>
                                <span style="font-size: 13px;"><i class="fas fa-calendar"></i> Last Run: ${c.lastRun || 'Not run yet'}</span>
                            </div>
                            <div style="margin-top: 15px;">
                                <div style="display: flex; gap: 20px;">
                                    <div><strong>${c.sent}</strong> <span style="color: #64748b;">Sent</span></div>
                                    <div><strong>${c.opens}</strong> <span style="color: #64748b;">Opens</span></div>
                                    <div><strong>${c.clicks}</strong> <span style="color: #64748b;">Clicks</span></div>
                                </div>
                                <div class="progress-bar-bg" style="margin-top: 8px;">
                                    <div class="progress-bar-fill" style="width: ${c.sent > 0 ? (c.opens/c.sent)*100 : 0}%; background: #e94560;"></div>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: 10px;">
                            <button class="btn-outline" data-onclick="editCampaign(${c.id})"><i class="fas fa-edit"></i> Edit</button>
                            <button class="btn-primary" data-onclick="triggerCampaignNow(${c.id})"><i class="fas fa-play"></i> Run Now</button>
                            <button class="btn-outline" data-onclick="viewCampaignAnalytics(${c.id})"><i class="fas fa-chart-line"></i> Analytics</button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            renderUpcomingCampaigns();
        }

        function renderUpcomingCampaigns() {
            const container = document.getElementById('upcomingCampaigns');
            if (!container) return;
            
            const upcoming = [
                { customer: 'Amit Sharma', destination: 'Goa', travelDate: '2024-03-15', daysLeft: 28, campaign: 'Visa Checklist' },
                { customer: 'Priya Verma', destination: 'Manali', travelDate: '2024-03-25', daysLeft: 18, campaign: 'Payment Reminder' },
                { customer: 'Rahul Mehta', destination: 'Kerala', travelDate: '2024-04-05', daysLeft: 8, campaign: 'Packing Tips' },
                { customer: 'Sneha Reddy', destination: 'Rajasthan', travelDate: '2024-03-18', daysLeft: 5, campaign: 'Weather Alert' },
                { customer: 'Vikram Singh', destination: 'Andaman', travelDate: '2024-05-10', daysLeft: 35, campaign: 'Visa Checklist' }
            ];
            
            container.innerHTML = upcoming.map(u => `
                <div style="background: #fef3c7; border-radius: 12px; padding: 12px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between;">
                        <div><strong>${u.customer}</strong><br><span style="font-size: 12px;">${u.destination}</span></div>
                        <div style="text-align: right;">
                            <span style="background: #e94560; color: white; padding: 2px 8px; border-radius: 20px; font-size: 11px;">${u.daysLeft} days left</span>
                            <div style="font-size: 12px; margin-top: 5px;">${u.campaign}</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function openCreateCampaignModal() {
            document.getElementById('campaignName').value = '';
            document.getElementById('campaignTrigger').value = 'days_before';
            document.getElementById('triggerDays').value = '7';
            document.getElementById('emailSubject').value = '';
            document.getElementById('messageContent').value = '';
            document.getElementById('targetAudience').value = 'all';
            document.getElementById('destinationSelect').style.display = 'none';
            document.getElementById('createCampaignModal').classList.add('show');
        }

        function createCampaign() {
            const name = document.getElementById('campaignName').value;
            const trigger = document.getElementById('campaignTrigger').value;
            const days = document.getElementById('triggerDays').value;
            const subject = document.getElementById('emailSubject').value;
            const message = document.getElementById('messageContent').value;
            const target = document.getElementById('targetAudience').value;
            
            if (!name || !message) {
                showToast('Error', 'Please fill campaign name and message', 'error');
                return;
            }
            
            let triggerText = '';
            if (trigger === 'days_before') triggerText = `${days} days before travel`;
            else if (trigger === 'days_after') triggerText = `${days} days after travel`;
            else if (trigger === 'on_booking') triggerText = 'Immediately after booking';
            else triggerText = 'After full payment';
            
            const newCampaign = {
                id: campaigns.length + 1,
                name: name,
                trigger: triggerText,
                status: 'active',
                sent: 0,
                opens: 0,
                clicks: 0,
                channel: 'Email',
                lastRun: null,
                subject: subject,
                message: message,
                target: target
            };
            
            campaigns.push(newCampaign);
            renderCampaigns();
            updateCampaignStats();
            closeModal('createCampaignModal');
            showToast('Campaign Created', `${name} has been created and activated`);
        }

        function editCampaign(id) {
            const campaign = campaigns.find(c => c.id === id);
            if (campaign) {
                showToast('Edit Campaign', `Editing ${campaign.name}`);
                openCreateCampaignModal();
            }
        }

        function triggerCampaignNow(id) {
            const campaign = campaigns.find(c => c.id === id);
            if (campaign) {
                const sentCount = Math.floor(Math.random() * 50) + 10;
                campaign.sent = (campaign.sent || 0) + sentCount;
                campaign.opens = campaign.opens + Math.floor(sentCount * 0.6);
                campaign.clicks = campaign.clicks + Math.floor(sentCount * 0.3);
                campaign.lastRun = new Date().toISOString().split('T')[0];
                
                renderCampaigns();
                updateCampaignStats();
                showToast('Campaign Triggered', `${campaign.name} has been sent to ${sentCount} customers`);
            }
        }

        function viewCampaignAnalytics(id) {
            const campaign = campaigns.find(c => c.id === id);
            if (campaign) {
                const openPercent = campaign.sent > 0 ? ((campaign.opens / campaign.sent) * 100).toFixed(1) : 0;
                const clickPercent = campaign.opens > 0 ? ((campaign.clicks / campaign.opens) * 100).toFixed(1) : 0;
                showToast('Campaign Analytics', `${campaign.name}: Open Rate ${openPercent}%, Click Rate ${clickPercent}%`);
            }
        }

        function useTemplate(type) {
            const templates = {
                visa: {
                    name: 'Visa & Documents Checklist',
                    subject: 'Important: Visa & Travel Documents Checklist for Your Upcoming Trip',
                    message: `Dear Customer,\n\nYour trip is coming up soon! Please ensure you have the following documents ready:\n\n📌 Valid Passport (min 6 months validity)\n📌 Visa (if applicable)\n📌 Flight tickets copy\n📌 Hotel confirmations\n📌 Travel Insurance\n📌 COVID-19 documents (if required)\n\nPlease contact us if you need any assistance with visa processing.\n\nSafe travels!\nSolvonix Travels Team`
                },
                packing: {
                    name: 'Packing Checklist',
                    subject: 'Packing Tips for Your Trip',
                    message: `Dear Customer,\n\nHere's a handy packing checklist for your upcoming trip:\n\n✅ Clothes as per weather forecast\n✅ Toiletries & medications\n✅ Power bank & chargers\n✅ Comfortable walking shoes\n✅ Sunscreen & sunglasses\n✅ Camera to capture memories!\n\nHave a wonderful journey!\nSolvonix Travels Team`
                },
                weather: {
                    name: 'Weather Alert & Tips',
                    subject: 'Weather Update for Your Destination',
                    message: `Dear Customer,\n\nHere's the weather forecast for your destination:\n🌡️ Temperature: 25-30°C\n☀️ Weather: Sunny with light clouds\n\nRecommendations:\n• Carry light cotton clothes\n• Keep an umbrella/raincoat\n• Stay hydrated\n\nEnjoy your trip!\nSolvonix Travels Team`
                },
                payment: {
                    name: 'Final Payment Reminder',
                    subject: 'Reminder: Final Payment Due Date',
                    message: `Dear Customer,\n\nThis is a gentle reminder that your final payment is due soon.\n\n💰 Outstanding Amount: ₹XX,XXX\n📅 Due Date: [Date]\n\nPlease complete the payment to confirm your booking.\n\nPayment Link: [Link]\n\nThank you for choosing Solvonix Travels!`
                },
                contact: {
                    name: 'Local Contact Information',
                    subject: 'Local Contact Details for Your Trip',
                    message: `Dear Customer,\n\nHere are your local contact details for the trip:\n\n📍 Pickup Point: [Hotel Lobby / Airport Arrival]\n🕐 Pickup Time: [Time]\n📞 Local Representative: +91 XXXXX XXXXX\n\nFor any assistance during the trip, please contact our 24/7 helpline: +91 98765 43210\n\nWishing you a fantastic holiday!\nSolvonix Travels Team`
                },
                feedback: {
                    name: 'Post-Travel Feedback',
                    subject: 'Share Your Travel Experience',
                    message: `Dear Customer,\n\nWe hope you had a wonderful trip! We'd love to hear about your experience.\n\nPlease take a moment to rate your trip and share feedback:\n\n⭐ Rate your experience: [1-5 Stars]\n📝 Your feedback: ____________\n\nAs a token of appreciation, you'll receive 500 loyalty points!\n\n[Submit Feedback]\n\nThank you for choosing Solvonix Travels!`
                }
            };
            
            const template = templates[type];
            if (template) {
                document.getElementById('campaignName').value = template.name;
                document.getElementById('emailSubject').value = template.subject;
                document.getElementById('messageContent').value = template.message;
                showToast('Template Loaded', `${template.name} template is ready to use`);
                openCreateCampaignModal();
            }
        }

        // Initialize campaigns
        function initializeCampaigns() {
            campaigns = [...sampleCampaigns];
            renderCampaigns();
            updateCampaignStats();
        }

        // Override renderCampaigns from main js
        const originalRenderCampaigns = window.renderCampaigns;
        window.renderCampaigns = function() {
            if (getCurrentPage() === 'campaigns') {
                renderCampaigns();
                updateCampaignStats();
            } else if (originalRenderCampaigns) {
                originalRenderCampaigns();
            }
        };

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            if (getCurrentPage() === 'campaigns') {
                initializeCampaigns();
                
                document.getElementById('targetAudience')?.addEventListener('change', function() {
                    const destDiv = document.getElementById('destinationSelect');
                    if (destDiv) {
                        destDiv.style.display = this.value === 'specific_destination' ? 'block' : 'none';
                    }
                });
            }
        });
