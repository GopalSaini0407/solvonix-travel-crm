// Support page specific JavaScript
        let tickets = [];
        let chatHistory = [];

        // Sample ticket data
        const sampleTickets = [
            { id: 1001, customer: 'Amit Sharma', customerId: 1003, category: 'flight', subject: 'Flight delayed by 4 hours', description: 'Indigo flight 6E-234 from Delhi to Goa delayed', priority: 'high', status: 'open', createdAt: '2024-02-15 10:30', assignedTo: 'Support Team', lastUpdate: '2024-02-15 10:30', bookingRef: 'SOL-BK-001' },
            { id: 1002, customer: 'Priya Verma', customerId: 1002, category: 'hotel', subject: 'Hotel room not as booked', description: 'Booked deluxe room but got standard room', priority: 'medium', status: 'in-progress', createdAt: '2024-02-14 15:20', assignedTo: 'Hotel Desk', lastUpdate: '2024-02-14 16:00', bookingRef: 'SOL-BK-002' },
            { id: 1003, customer: 'Rahul Mehta', customerId: 1003, category: 'transport', subject: 'Cab not arrived for pickup', description: 'Waiting at airport for last 30 minutes', priority: 'high', status: 'open', createdAt: '2024-02-15 09:15', assignedTo: 'Transport Team', lastUpdate: '2024-02-15 09:15', bookingRef: 'SOL-BK-003' },
            { id: 1004, customer: 'Sneha Reddy', customerId: 1004, category: 'activity', subject: 'Activity cancellation', description: 'Scuba diving cancelled due to weather', priority: 'medium', status: 'resolved', createdAt: '2024-02-13 11:00', assignedTo: 'Activities Desk', lastUpdate: '2024-02-13 14:30', bookingRef: 'SOL-BK-004' },
            { id: 1005, customer: 'Vikram Singh', customerId: 1005, category: 'visa', subject: 'Visa status inquiry', description: 'Need update on Thailand visa processing', priority: 'low', status: 'in-progress', createdAt: '2024-02-12 09:00', assignedTo: 'Visa Desk', lastUpdate: '2024-02-12 11:00', bookingRef: 'SOL-BK-005' }
        ];

        // Sample active travelers
        const activeTravelers = [
            { name: 'Anjali Nair', destination: 'Kashmir', hotel: 'The Lalit Grand Palace', checkIn: '2024-02-10', checkOut: '2024-02-15', status: 'ongoing', contact: '+91 98765 43211' },
            { name: 'Rajesh Khanna', destination: 'Thailand', hotel: 'Marriott Bangkok', checkIn: '2024-02-12', checkOut: '2024-02-17', status: 'ongoing', contact: '+91 98765 43212' },
            { name: 'Neha Gupta', destination: 'Goa', hotel: 'Taj Fort Aguada', checkIn: '2024-02-14', checkOut: '2024-02-18', status: 'ongoing', contact: '+91 98765 43213' }
        ];

        // Sample real-time alerts
        const sampleAlerts = [
            { id: 1, type: 'flight', message: 'Flight 6E-234 (Delhi-Goa) delayed by 2 hours', time: '10:30 AM', priority: 'high' },
            { id: 2, type: 'weather', message: 'Heavy rainfall expected in Kerala tomorrow', time: '09:15 AM', priority: 'medium' },
            { id: 3, type: 'transport', message: 'Local transport strike in Manali on 16th Feb', time: '08:00 AM', priority: 'high' }
        ];

        function updateSupportStats() {
            const open = tickets.filter(t => t.status === 'open').length;
            const inProgress = tickets.filter(t => t.status === 'in-progress').length;
            const resolvedToday = tickets.filter(t => t.status === 'resolved' && t.lastUpdate === new Date().toISOString().split('T')[0]).length;
            
            document.getElementById('openTickets').innerText = open;
            document.getElementById('inProgressTickets').innerText = inProgress;
            document.getElementById('resolvedToday').innerText = resolvedToday;
            document.getElementById('avgResponseTime').innerText = Math.floor(Math.random() * 15) + 5;
        }

        function renderTickets() {
            const container = document.getElementById('ticketsContainer');
            if (!container) return;
            
            const statusFilter = document.getElementById('ticketFilterStatus')?.value || 'all';
            const priorityFilter = document.getElementById('ticketFilterPriority')?.value || 'all';
            const search = document.getElementById('searchTicket')?.value.toLowerCase() || '';
            
            let filteredTickets = [...tickets];
            if (statusFilter !== 'all') filteredTickets = filteredTickets.filter(t => t.status === statusFilter);
            if (priorityFilter !== 'all') filteredTickets = filteredTickets.filter(t => t.priority === priorityFilter);
            if (search) filteredTickets = filteredTickets.filter(t => t.customer.toLowerCase().includes(search) || t.subject.toLowerCase().includes(search));
            
            if (filteredTickets.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 40px; color: #64748b;">No tickets found</div>';
                return;
            }
            
            container.innerHTML = filteredTickets.map(t => `
                <div style="background: white; border-radius: 16px; padding: 16px; margin-bottom: 12px; border-left: 4px solid ${t.priority === 'high' ? '#ef4444' : t.priority === 'medium' ? '#f59e0b' : '#10b981'};">
                    <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                <span class="status-badge" style="background: #${t.category === 'flight' ? 'e94560' : t.category === 'hotel' ? '3b82f6' : t.category === 'transport' ? '10b981' : '8b5cf6'}20; color: #${t.category === 'flight' ? 'e94560' : t.category === 'hotel' ? '3b82f6' : t.category === 'transport' ? '10b981' : '8b5cf6'};">
                                    <i class="fas ${t.category === 'flight' ? 'fa-plane' : t.category === 'hotel' ? 'fa-hotel' : t.category === 'transport' ? 'fa-bus' : 'fa-ticket-alt'}"></i> ${t.category.toUpperCase()}
                                </span>
                                <strong>#${t.id}</strong>
                                <span class="status-badge status-${t.status === 'open' ? 'new' : t.status === 'in-progress' ? 'negotiation' : 'won'}">${t.status}</span>
                                <span class="status-badge" style="background: ${t.priority === 'high' ? '#fee2e2' : t.priority === 'medium' ? '#fef3c7' : '#e8f5e9'}; color: ${t.priority === 'high' ? '#ef4444' : t.priority === 'medium' ? '#f59e0b' : '#10b981'};">${t.priority.toUpperCase()}</span>
                            </div>
                            <div style="margin-top: 10px;">
                                <div style="font-weight: 600;">${t.subject}</div>
                                <div style="font-size: 13px; color: #64748b; margin-top: 5px;">${t.customer} | Booking: ${t.bookingRef}</div>
                                <div style="font-size: 12px; margin-top: 8px;">📝 ${t.description.substring(0, 100)}${t.description.length > 100 ? '...' : ''}</div>
                                <div style="font-size: 11px; color: #64748b; margin-top: 8px;">Created: ${t.createdAt} | Assigned to: ${t.assignedTo}</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: 10px;align-items: center;">
                            <button class="btn-outline" style="padding: 6px 12px;" data-onclick="viewTicketDetails(${t.id})"><i class="fas fa-eye"></i> View</button>
                            <button class="btn-primary" style="padding: 6px 12px;" data-onclick="openReplyTicketModal(${t.id})"><i class="fas fa-reply"></i> Reply</button>
                            <button class="btn-outline" style="padding: 6px 12px;" data-onclick="escalateTicket(${t.id})"><i class="fas fa-arrow-up"></i> Escalate</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function renderActiveTravelers() {
            const container = document.getElementById('activeTravelers');
            if (!container) return;
            
            container.innerHTML = activeTravelers.map(t => `
                <div style="background: #f1f5f9; border-radius: 12px; padding: 12px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <div style="font-weight: 600;">${t.name}</div>
                            <div style="font-size: 12px;">📍 ${t.destination}</div>
                            <div style="font-size: 11px; color: #64748b;">🏨 ${t.hotel}</div>
                            <div style="font-size: 11px; color: #64748b;">📅 ${t.checkIn} to ${t.checkOut}</div>
                        </div>
                        <div style="text-align: right;">
                            <span class="status-badge status-won">Traveling Now</span>
                            <div style="font-size: 11px; margin-top: 5px;"><i class="fas fa-phone"></i> ${t.contact}</div>
                            <button class="btn-outline" style="margin-top: 8px; padding: 2px 8px;" data-onclick="contactTraveler('${t.name}')">Contact</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function renderRealTimeAlerts() {
            const container = document.getElementById('realTimeAlerts');
            if (!container) return;
            
            container.innerHTML = sampleAlerts.map(a => `
                <div style="background: ${a.priority === 'high' ? '#fee2e2' : '#fef3c7'}; border-radius: 12px; padding: 12px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <i class="fas ${a.type === 'flight' ? 'fa-plane' : a.type === 'weather' ? 'fa-cloud-sun' : 'fa-bus'}"></i>
                            <span style="margin-left: 8px;">${a.message}</span>
                        </div>
                        <div style="font-size: 11px; color: #64748b;">${a.time}</div>
                    </div>
                </div>
            `).join('');
        }

        function loadCustomersForDropdown() {
            const select = document.getElementById('ticketCustomer');
            if (select && typeof state !== 'undefined' && state.leads) {
                const customers = state.leads.filter(l => l.status === 'won');
                select.innerHTML = '<option value="">-- Select Customer --</option>' + 
                    customers.map(c => `<option value="${c.id}">${c.name} - ${c.destination}</option>`).join('');
            }
        }

        function openNewTicketModal() {
            loadCustomersForDropdown();
            document.getElementById('newTicketModal').classList.add('show');
        }

        function createTicket() {
            const customerId = document.getElementById('ticketCustomer').value;
            const category = document.getElementById('ticketCategory').value;
            const priority = document.getElementById('ticketPriority').value;
            const subject = document.getElementById('ticketSubject').value;
            const description = document.getElementById('ticketDescription').value;
            
            if (!customerId || !subject || !description) {
                showToast('Error', 'Please fill all required fields', 'error');
                return;
            }
            
            let customer = null;
            if (typeof state !== 'undefined' && state.leads) {
                customer = state.leads.find(l => l.id == customerId);
            }
            
            const newTicket = {
                id: tickets.length + 1000,
                customer: customer?.name || 'Unknown',
                customerId: parseInt(customerId),
                category: category,
                subject: subject,
                description: description,
                priority: priority,
                status: 'open',
                createdAt: new Date().toLocaleString(),
                assignedTo: 'Support Team',
                lastUpdate: new Date().toLocaleString(),
                bookingRef: 'SOL-BK-XXX'
            };
            
            tickets.push(newTicket);
            renderTickets();
            updateSupportStats();
            closeModal('newTicketModal');
            showToast('Ticket Created', `Ticket #${newTicket.id} has been created`);
            
            // Clear form
            document.getElementById('ticketSubject').value = '';
            document.getElementById('ticketDescription').value = '';
        }

        function openReplyTicketModal(ticketId) {
            const ticket = tickets.find(t => t.id === ticketId);
            if (ticket) {
                document.getElementById('replyTicketId').value = ticketId;
                document.getElementById('ticketDetails').innerHTML = `
                    <div><strong>#${ticket.id} - ${ticket.subject}</strong></div>
                    <div>Customer: ${ticket.customer} | Priority: ${ticket.priority}</div>
                    <div>Status: ${ticket.status}</div>
                `;
                document.getElementById('updateStatus').value = ticket.status;
                document.getElementById('replyTicketModal').classList.add('show');
            }
        }

        function submitReply() {
            const ticketId = parseInt(document.getElementById('replyTicketId').value);
            const newStatus = document.getElementById('updateStatus').value;
            const replyMessage = document.getElementById('replyMessage').value;
            
            const ticket = tickets.find(t => t.id === ticketId);
            if (ticket && replyMessage) {
                ticket.status = newStatus;
                ticket.lastUpdate = new Date().toLocaleString();
                
                renderTickets();
                updateSupportStats();
                closeModal('replyTicketModal');
                showToast('Reply Sent', `Response sent to ${ticket.customer}`);
                
                document.getElementById('replyMessage').value = '';
            }
        }

        function escalateTicket(ticketId) {
            const ticket = tickets.find(t => t.id === ticketId);
            if (ticket) {
                ticket.priority = ticket.priority === 'low' ? 'medium' : ticket.priority === 'medium' ? 'high' : 'critical';
                ticket.assignedTo = ticket.priority === 'high' ? 'Senior Manager' : 'Operations Head';
                renderTickets();
                showToast('Ticket Escalated', `Ticket #${ticketId} escalated to ${ticket.assignedTo}`);
            }
        }

        function viewTicketDetails(ticketId) {
            const ticket = tickets.find(t => t.id === ticketId);
            if (ticket) {
                showToast('Ticket Details', `${ticket.subject} - Status: ${ticket.status}`);
            }
        }

        function openLiveChat() {
            const select = document.getElementById('chatCustomer');
            if (select && typeof state !== 'undefined' && state.leads) {
                const customers = state.leads.filter(l => l.status === 'won');
                select.innerHTML = '<option value="">-- Select Customer --</option>' + 
                    customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            }
            document.getElementById('liveChatModal').classList.add('show');
        }

        function sendChatMessage() {
            const message = document.getElementById('chatMessage').value;
            if (message) {
                const chatDiv = document.getElementById('chatMessages');
                chatDiv.innerHTML += `<div style="background: #e94560; color: white; padding: 8px; border-radius: 12px; margin-bottom: 8px; text-align: right;">Support: ${message}</div>`;
                document.getElementById('chatMessage').value = '';
                chatDiv.scrollTop = chatDiv.scrollHeight;
            }
        }

        function broadcastAlert() {
            const message = prompt('Enter alert message to broadcast to all active travelers:');
            if (message) {
                showToast('Alert Broadcasted', 'Message sent to all active travelers');
            }
        }

        function viewKnowledgeBase() {
            showToast('Knowledge Base', 'Opening help articles and FAQs');
        }

        function callEmergency() {
            showToast('Calling Emergency Helpline', 'Connecting to +91 98765 43210');
        }

        function contactTraveler(name) {
            showToast('Contacting Traveler', `Calling ${name}...`);
        }

        // Initialize support system
        function initializeSupport() {
            tickets = [...sampleTickets];
            renderTickets();
            renderActiveTravelers();
            renderRealTimeAlerts();
            updateSupportStats();
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            if (getCurrentPage() === 'support') {
                initializeSupport();
                
                document.getElementById('ticketFilterStatus')?.addEventListener('change', () => renderTickets());
                document.getElementById('ticketFilterPriority')?.addEventListener('change', () => renderTickets());
                document.getElementById('searchTicket')?.addEventListener('keyup', () => renderTickets());
            }
        });