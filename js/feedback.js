// Feedback page specific JavaScript
        let feedbacks = [];
        let currentFilter = 'all';
        let loyaltyPoints = {};

        // Sample feedback data
        const sampleFeedbacks = [
            { id: 1, customer: 'Anjali Nair', customerId: 1006, bookingRef: 'SOL-BK-001', rating: 5, comment: 'Absolutely amazing trip! Everything was perfectly organized. Hotel was great, food was delicious.', category: 'overall', date: '2024-02-20', points: 500, status: 'approved', resolved: false },
            { id: 2, customer: 'Rajesh Khanna', customerId: 1007, bookingRef: 'SOL-BK-002', rating: 4, comment: 'Good experience overall. Hotel could be better in terms of location.', category: 'hotel', date: '2024-02-18', points: 400, status: 'approved', resolved: false },
            { id: 3, customer: 'Amit Sharma', customerId: 1001, bookingRef: 'SOL-BK-003', rating: 5, comment: 'Fantastic service! Our guide was very knowledgeable. Will book again.', category: 'activity', date: '2024-02-15', points: 500, status: 'approved', resolved: false },
            { id: 4, customer: 'Priya Verma', customerId: 1002, bookingRef: 'SOL-BK-004', rating: 2, comment: 'Hotel room was not clean. Staff was unhelpful. Disappointed with the experience.', category: 'hotel', date: '2024-02-14', points: 0, status: 'pending', resolved: false },
            { id: 5, customer: 'Sneha Reddy', customerId: 1004, bookingRef: 'SOL-BK-005', rating: 3, comment: 'Average experience. Transport was late on first day.', category: 'transport', date: '2024-02-12', points: 100, status: 'approved', resolved: false },
            { id: 6, customer: 'Vikram Singh', customerId: 1005, bookingRef: 'SOL-BK-006', rating: 5, comment: 'Best trip ever! Andaman is beautiful. Thanks Solvonix for amazing arrangements.', category: 'overall', date: '2024-02-10', points: 500, status: 'approved', resolved: false },
            { id: 7, customer: 'Neha Gupta', customerId: 1004, bookingRef: 'SOL-BK-007', rating: 4, comment: 'Good value for money. Recommended!', category: 'overall', date: '2024-02-08', points: 400, status: 'approved', resolved: false }
        ];

        // Sample loyalty points data
        const sampleLoyalty = [
            { customer: 'Anjali Nair', points: 2500, tier: 'Gold', bookings: 3 },
            { customer: 'Rajesh Khanna', points: 1800, tier: 'Silver', bookings: 2 },
            { customer: 'Amit Sharma', points: 1200, tier: 'Silver', bookings: 2 },
            { customer: 'Vikram Singh', points: 900, tier: 'Bronze', bookings: 1 },
            { customer: 'Sneha Reddy', points: 600, tier: 'Bronze', bookings: 2 },
            { customer: 'Priya Verma', points: 300, tier: 'Basic', bookings: 1 }
        ];

        function updateFeedbackStats() {
            const total = feedbacks.length;
            const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / (total || 1);
            const totalPoints = feedbacks.reduce((sum, f) => sum + f.points, 0);
            
            // Calculate NPS (9-10 promoters, 7-8 passives, 0-6 detractors)
            const promoters = feedbacks.filter(f => f.rating >= 9).length;
            const detractors = feedbacks.filter(f => f.rating <= 6).length;
            const nps = total > 0 ? ((promoters - detractors) / total * 100).toFixed(0) : 0;
            
            document.getElementById('avgRating').innerHTML = avgRating.toFixed(1) + ' ⭐';
            document.getElementById('totalReviews').innerText = total;
            document.getElementById('totalPoints').innerText = totalPoints.toLocaleString();
            document.getElementById('npsScore').innerText = nps;
            
            // Category ratings
            const hotelFeedbacks = feedbacks.filter(f => f.category === 'hotel');
            const transportFeedbacks = feedbacks.filter(f => f.category === 'transport');
            const activityFeedbacks = feedbacks.filter(f => f.category === 'activity');
            const overallFeedbacks = feedbacks.filter(f => f.category === 'overall');
            
            document.getElementById('hotelRating').innerHTML = (hotelFeedbacks.reduce((s,f)=> s+f.rating,0) / (hotelFeedbacks.length || 1)).toFixed(1) + ' ⭐';
            document.getElementById('transportRating').innerHTML = (transportFeedbacks.reduce((s,f)=> s+f.rating,0) / (transportFeedbacks.length || 1)).toFixed(1) + ' ⭐';
            document.getElementById('activityRating').innerHTML = (activityFeedbacks.reduce((s,f)=> s+f.rating,0) / (activityFeedbacks.length || 1)).toFixed(1) + ' ⭐';
            document.getElementById('overallRating').innerHTML = (overallFeedbacks.reduce((s,f)=> s+f.rating,0) / (overallFeedbacks.length || 1)).toFixed(1) + ' ⭐';
        }

        function renderFeedback() {
            const container = document.getElementById('feedbackContainer');
            if (!container) return;
            
            const ratingFilter = document.getElementById('feedbackFilter')?.value || 'all';
            let filtered = [...feedbacks];
            
            if (ratingFilter === '5') filtered = filtered.filter(f => f.rating === 5);
            else if (ratingFilter === '4') filtered = filtered.filter(f => f.rating >= 4);
            else if (ratingFilter === '3') filtered = filtered.filter(f => f.rating === 3);
            else if (ratingFilter === 'below') filtered = filtered.filter(f => f.rating < 3);
            
            if (filtered.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 40px; color: #64748b;">No feedback found</div>';
                return;
            }
            
            container.innerHTML = filtered.map(f => `
                <div class="feedback-item" style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 15px; border-left: 4px solid ${f.rating >= 4 ? '#10b981' : f.rating >= 3 ? '#f59e0b' : '#ef4444'};">
                    <div  class="feedback-content" style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                <div style="font-size: 18px; font-weight: bold;">${f.customer}</div>
                                <span class="status-badge status-${f.category === 'hotel' ? 'won' : f.category === 'transport' ? 'quotation' : 'partial'}">${f.category.toUpperCase()}</span>
                                <div style="color: #f59e0b;">${'★'.repeat(f.rating)}${'☆'.repeat(5-f.rating)}</div>
                            </div>
                            <div style="margin-top: 12px;">
                                <p style="font-style: italic;">"${f.comment}"</p>
                                <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
                                    Booking: ${f.bookingRef} | Date: ${f.date}
                                </div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            ${f.rating >= 4 ? `<div style="color: #10b981; font-weight: bold;">+${f.points} Points Earned</div>` : 
                              f.rating < 3 ? `<div style="color: #ef4444;"><button class="btn-outline" data-onclick="openComplaintResolution(${f.id})">Resolve Complaint</button></div>` : 
                              `<div style="color: #f59e0b;">+${f.points} Points</div>`}
                        </div>
                    </div>
                </div>
            `).join('');
            
            renderComplaints();
        }

        function renderLoyaltyLeaderboard() {
            const container = document.getElementById('loyaltyLeaderboard');
            if (!container) return;
            
            const sorted = [...sampleLoyalty].sort((a,b) => b.points - a.points);
            
            container.innerHTML = `
                <table style="width: 100%;">
                    <thead>
                        <tr><th>Rank</th><th>Customer</th><th>Points</th><th>Tier</th><th>Bookings</th></tr>
                    </thead>
                    <tbody>
                        ${sorted.map((l, idx) => `
                            <tr>
                                <td>${idx + 1}${idx === 0 ? ' 🏆' : ''}${idx === 1 ? ' 🥈' : ''}${idx === 2 ? ' 🥉' : ''}</td>
                                <td>${l.customer}</td>
                                <td>${l.points}</td>
                                <td><span class="status-badge ${l.tier === 'Gold' ? 'status-won' : l.tier === 'Silver' ? 'status-partial' : 'status-new'}">${l.tier}</span></td>
                                <td>${l.bookings}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            // Set user points (demo - first customer)
            document.getElementById('userPoints').innerText = sorted[0]?.points || 0;
            const pointsPercent = (sorted[0]?.points / 5000) * 100;
            document.getElementById('pointsProgress').style.width = Math.min(pointsPercent, 100) + '%';
            document.getElementById('pointsProgress').style.background = '#e94560';
            
            let nextTier = 'Gold';
            if (sorted[0]?.points < 500) nextTier = 'Silver (500 points)';
            else if (sorted[0]?.points < 2000) nextTier = 'Gold (2000 points)';
            else if (sorted[0]?.points < 5000) nextTier = 'Platinum (5000 points)';
            else nextTier = 'Diamond (10000 points)';
            document.getElementById('nextTier').innerText = nextTier;
        }

        function renderComplaints() {
            const container = document.getElementById('complaintList');
            if (!container) return;
            
            const complaints = feedbacks.filter(f => f.rating < 3 && !f.resolved);
            
            if (complaints.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 20px; color: #64748b;">No open complaints</div>';
                return;
            }
            
            container.innerHTML = complaints.map(c => `
                <div class="complaint-item" style="background: white; border-radius: 12px; padding: 12px; margin-bottom: 10px;">
                    <div class="complaint-content" style="display: flex; justify-content: space-between;">
                        <div>
                            <strong>${c.customer}</strong> - ${c.category.toUpperCase()}
                            <div style="font-size: 12px;">"${c.comment.substring(0, 80)}..."</div>
                        </div>
                        <button class="btn-primary" data-onclick="openComplaintResolution(${c.id})">Take Action</button>
                    </div>
                </div>
            `).join('');
        }

        function openComplaintResolution(feedbackId) {
            const feedback = feedbacks.find(f => f.id === feedbackId);
            if (feedback) {
                document.getElementById('complaintFeedbackId').value = feedbackId;
                document.getElementById('complaintDetails').innerHTML = `
                    <div><strong>${feedback.customer}</strong> - Rating: ${feedback.rating}★</div>
                    <div>Complaint: "${feedback.comment}"</div>
                `;
                document.getElementById('complaintModal').classList.add('show');
            }
        }

        function resolveComplaint() {
            const feedbackId = parseInt(document.getElementById('complaintFeedbackId').value);
            const action = document.getElementById('resolutionAction').value;
            const resolutionValue = document.getElementById('resolutionValue').value;
            const comment = document.getElementById('managerComment').value;
            
            const feedback = feedbacks.find(f => f.id === feedbackId);
            if (feedback) {
                feedback.resolved = true;
                if (action === 'points') {
                    const points = parseInt(resolutionValue) || 200;
                    feedback.points = points;
                    showToast('Complaint Resolved', `${feedback.customer} has been awarded ${points} compensation points`);
                } else if (action === 'voucher') {
                    showToast('Complaint Resolved', `Travel voucher of ${resolutionValue} sent to ${feedback.customer}`);
                } else if (action === 'refund') {
                    showToast('Complaint Resolved', `Refund of ${resolutionValue} processed for ${feedback.customer}`);
                } else {
                    showToast('Complaint Resolved', `Apology sent to ${feedback.customer}`);
                }
                
                closeModal('complaintModal');
                renderFeedback();
                updateFeedbackStats();
                
                document.getElementById('resolutionValue').value = '';
                document.getElementById('managerComment').value = '';
            }
        }

        function submitNPS(score) {
            showToast('NPS Submitted', `Thank you! Your rating: ${score}/10`);
            document.querySelectorAll('.nps-btn').forEach(btn => btn.style.background = '');
            event.target.style.background = '#e94560';
            event.target.style.color = 'white';
        }

        function filterFeedback(category) {
            showToast('Filter Applied', `Showing ${category} feedback`);
        }

        function sendFeedbackRequest() {
            showToast('Feedback Request Sent', 'Email sent to all recent travelers');
        }

        function redeemPoints(points) {
            showToast('Redemption Requested', `${points} points redemption submitted for approval`);
        }

        function requestGoogleReview() {
            showToast('Google Review', 'Review request sent via email');
        }

        function requestTripAdvisorReview() {
            showToast('TripAdvisor', 'Review request sent');
        }

        function shareSocialProof() {
            showToast('Share', 'Social proof link copied to clipboard');
        }

        function viewTestimonials() {
            showToast('Testimonials', 'Showing customer testimonials');
        }

        function openFeedbackModal() {
            const select = document.getElementById('feedbackCustomer');
            if (select && typeof state !== 'undefined' && state.leads) {
                const customers = state.leads.filter(l => l.status === 'won');
                select.innerHTML = '<option value="">-- Select Customer --</option>' + 
                    customers.map(c => `<option value="${c.id}">${c.name} - ${c.destination}</option>`).join('');
            }
            document.getElementById('feedbackModal').classList.add('show');
            
            // Setup rating stars
            document.querySelectorAll('.rating-star').forEach(star => {
                star.onclick = function() {
                    const rating = parseInt(this.dataset.rating);
                    document.getElementById('feedbackRating').value = rating;
                    document.querySelectorAll('.rating-star').forEach((s, i) => {
                        s.style.color = i < rating ? '#f59e0b' : '#cbd5e1';
                    });
                };
            });
        }

        function submitFeedback() {
            const customerId = document.getElementById('feedbackCustomer').value;
            const category = document.getElementById('feedbackCategory').value;
            const rating = parseInt(document.getElementById('feedbackRating').value);
            const comment = document.getElementById('feedbackComment').value;
            
            if (!customerId || rating === 0 || !comment) {
                showToast('Error', 'Please fill all fields', 'error');
                return;
            }
            
            let customer = null;
            if (typeof state !== 'undefined' && state.leads) {
                customer = state.leads.find(l => l.id == customerId);
            }
            
            const points = rating >= 4 ? 500 : rating === 3 ? 200 : 0;
            
            const newFeedback = {
                id: feedbacks.length + 1,
                customer: customer?.name || 'Unknown',
                customerId: parseInt(customerId),
                bookingRef: 'SOL-BK-XXX',
                rating: rating,
                comment: comment,
                category: category,
                date: new Date().toISOString().split('T')[0],
                points: points,
                status: 'approved',
                resolved: false
            };
            
            feedbacks.unshift(newFeedback);
            renderFeedback();
            updateFeedbackStats();
            closeModal('feedbackModal');
            showToast('Feedback Submitted', `Thank you! You earned ${points} loyalty points`);
            
            document.getElementById('feedbackComment').value = '';
            document.getElementById('feedbackRating').value = '0';
            document.querySelectorAll('.rating-star').forEach(s => s.style.color = '#cbd5e1');
        }

        // Initialize feedback system
        function initializeFeedback() {
            feedbacks = [...sampleFeedbacks];
            renderFeedback();
            updateFeedbackStats();
            renderLoyaltyLeaderboard();
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            if (getCurrentPage() === 'feedback') {
                initializeFeedback();
                
                document.getElementById('feedbackFilter')?.addEventListener('change', () => renderFeedback());
            }
        });