let customers = [];
let filteredCustomers = [];
let activeCustomerId = null;

function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function formatMonth(value) {
    if (!value) return 'No trips yet';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function getInitials(name = '') {
    return String(name)
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0]?.toUpperCase())
        .join('') || 'NA';
}

function getCustomerType(lead = {}) {
    const notes = `${lead.notes || ''} ${lead.destination || ''}`.toLowerCase();
    if (notes.includes('corporate') || notes.includes('business')) return 'Corporate';
    if (lead.packageType === 'premium') return 'Luxury';
    if ((lead.travelers || 0) >= 4) return 'Family';
    return 'Leisure';
}

function getLoyaltyLevel(trips, paidAmount) {
    if (paidAmount >= 300000 || trips >= 4) return 'Gold';
    if (paidAmount >= 150000 || trips >= 2) return 'Silver';
    if (paidAmount > 0) return 'Bronze';
    return 'New';
}

function getLoyaltyClass(level) {
    const map = { Gold: 'badge-gold', Silver: 'badge-silver', Bronze: 'badge-bronze', New: 'badge-new' };
    return map[level] || 'badge-new';
}

function getSatisfaction(feedbackEntries) {
    if (!feedbackEntries.length) return null;
    return feedbackEntries.reduce((sum, item) => sum + Number(item.rating || 0), 0) / feedbackEntries.length;
}

function buildCustomers() {
    const leads = Array.isArray(window.state?.leads) ? window.state.leads : [];
    const bookings = Array.isArray(window.state?.bookings) ? window.state.bookings : [];
    const feedbacks = Array.isArray(window.state?.feedbacks) ? window.state.feedbacks : [];
    const tickets = Array.isArray(window.state?.tickets) ? window.state.tickets : [];

    customers = leads
        .filter(lead => lead.status !== 'lost')
        .map(lead => {
            const customerBookings = bookings
                .filter(booking => booking.leadId === lead.id)
                .sort((a, b) => new Date(b.travelDate || 0) - new Date(a.travelDate || 0));
            const customerFeedback = feedbacks.filter(item => item.customer === lead.name);
            const customerTickets = tickets.filter(item => item.customer === lead.name);

            const totalSpent = customerBookings.reduce((sum, booking) => sum + Number(booking.paidAmount || 0), 0);
            const trips = customerBookings.length;
            const satisfaction = getSatisfaction(customerFeedback);
            const loyalty = getLoyaltyLevel(trips, totalSpent);
            const type = getCustomerType(lead);

            return {
                id: lead.id,
                initials: getInitials(lead.name),
                color: lead.tripType === 'international'
                    ? 'linear-gradient(135deg, #0f3460, #1d4ed8)'
                    : lead.packageType === 'premium'
                        ? 'linear-gradient(135deg, #e94560, #c62a47)'
                        : 'linear-gradient(135deg, #10b981, #047857)',
                name: lead.name,
                phone: lead.phone || 'Phone missing',
                email: lead.email || 'Email missing',
                type,
                loyalty,
                agent: lead.assignedTo || 'Unassigned',
                lastBooking: formatMonth(customerBookings[0]?.travelDate || lead.travelDate),
                totalSpent,
                trips,
                memberSince: lead.createdAt ? String(lead.createdAt).slice(0, 4) : '2024',
                preferences: [
                    ...(lead.inclusionNotes || []),
                    ...((lead.exclusionNotes && lead.exclusionNotes.length) ? [`Avoid: ${lead.exclusionNotes.join(', ')}`] : [])
                ].filter(Boolean).join(', ') || 'Preferences not captured yet.',
                notes: lead.notes || 'No internal notes added yet.',
                travelerBreakdown: window.formatTravelerBreakdown ? window.formatTravelerBreakdown(lead.travelerBreakdown) : `${lead.travelers || 0} travelers`,
                destination: lead.destination || 'Destination pending',
                budget: lead.budget || 0,
                status: lead.status,
                satisfaction,
                tickets: customerTickets,
                feedbacks: customerFeedback,
                bookings: customerBookings.map(booking => ({
                    id: booking.bookingRef,
                    destination: lead.destination,
                    date: booking.travelDate || 'TBD',
                    amount: formatCurrency(booking.totalAmount),
                    status: booking.paymentStatus === 'full' ? 'Confirmed' : booking.paymentStatus === 'partial' ? 'Deposit Paid' : 'Pending Payment'
                }))
            };
        });

    filteredCustomers = [...customers];
}

function updateCustomerStats() {
    const totalCustomers = customers.length;
    const repeatCustomerCount = customers.filter(item => item.trips > 1).length;
    const lifetimeValue = customers.reduce((sum, item) => sum + item.totalSpent, 0);
    const ratedCustomers = customers.filter(item => item.satisfaction !== null);
    const avgSatisfaction = ratedCustomers.length
        ? (ratedCustomers.reduce((sum, item) => sum + item.satisfaction, 0) / ratedCustomers.length / 5) * 100
        : 0;

    document.getElementById('customersTotal').textContent = totalCustomers;
    document.getElementById('repeatCustomers').textContent = repeatCustomerCount;
    document.getElementById('lifetimeValue').textContent = formatCurrency(lifetimeValue);
    document.getElementById('satisfactionRate').textContent = `${Math.round(avgSatisfaction)}%`;
}

function renderCustomers() {
    const list = document.getElementById('customerList');
    const count = document.getElementById('customerCount');
    if (!list || !count) return;

    count.textContent = `Showing ${filteredCustomers.length} customer${filteredCustomers.length === 1 ? '' : 's'}`;

    if (!filteredCustomers.length) {
        list.innerHTML = `
            <div class="empty-state" style="min-height: 320px;">
                <i class="fas fa-user-slash" style="font-size: 48px;"></i>
                <h3>No customers found</h3>
                <p>Try changing the filters or add a new traveler profile.</p>
            </div>
        `;
        renderEmptyProfile('No profile to display', 'Select or search another customer to continue.');
        return;
    }

    list.innerHTML = filteredCustomers.map(customer => `
        <div class="customer-row ${customer.id === activeCustomerId ? 'active' : ''}" data-onclick="showCustomerProfile(${customer.id})">
            <div class="customer-avatar" style="background: ${customer.color};">${customer.initials}</div>
            <div class="customer-meta">
                <h4>${customer.name}</h4>
                <p>${customer.phone} | ${customer.email}</p>
                <p><i class="far fa-calendar"></i> Last trip: ${customer.lastBooking}</p>
                <div class="tag-row">
                    <span class="soft-badge ${getLoyaltyClass(customer.loyalty)}">${customer.loyalty}</span>
                    <span class="soft-badge" style="background: #eff6ff; color: #1d4ed8;">${customer.type}</span>
                    <span class="soft-badge" style="background: #f1f5f9; color: var(--gray);">${customer.agent}</span>
                </div>
            </div>
            <div style="align-self: center; color: var(--gray);"><i class="fas fa-chevron-right"></i></div>
        </div>
    `).join('');
}

function renderEmptyProfile(title, detail) {
    const profilePanel = document.getElementById('profilePanel');
    if (!profilePanel) return;

    profilePanel.innerHTML = `
        <div class="empty-state">
            <i class="far fa-user-circle" style="font-size: 64px;"></i>
            <h3>${title}</h3>
            <p>${detail}</p>
        </div>
    `;
}

function showCustomerProfile(id) {
    const customer = customers.find(item => item.id === id);
    if (!customer) return;

    activeCustomerId = id;
    renderCustomers();

    const feedbackSummary = customer.feedbacks.length
        ? `${customer.feedbacks.length} review(s) | Avg ${customer.satisfaction.toFixed(1)} / 5`
        : 'No feedback captured yet';

    const ticketSummary = customer.tickets.length
        ? customer.tickets.map(ticket => `
            <div class="mini-card">
                <strong>${ticket.subject}</strong>
                <div style="font-size: 13px; color: var(--gray);">${ticket.status} | ${ticket.priority} priority</div>
            </div>
        `).join('')
        : '<div class="mini-card"><strong>No support tickets</strong><div style="font-size: 13px; color: var(--gray);">Traveler support is clear so far.</div></div>';

    const bookingMarkup = customer.bookings.length
        ? customer.bookings.map(booking => `
            <div class="mini-card">
                <strong>${booking.destination}</strong>
                <div style="font-size: 13px; color: var(--gray);">${booking.id} | ${booking.date}</div>
                <div style="display: flex; justify-content: space-between; margin-top: 8px;">
                    <span>${booking.amount}</span>
                    <span class="status-badge status-${booking.status === 'Confirmed' ? 'won' : booking.status === 'Deposit Paid' ? 'partial' : 'new'}">${booking.status}</span>
                </div>
            </div>
        `).join('')
        : '<div class="mini-card"><strong>No bookings yet</strong><div style="font-size: 13px; color: var(--gray);">Lead is still in sales pipeline.</div></div>';

    document.getElementById('profilePanel').innerHTML = `
        <div class="profile-hero">
            <div class="profile-hero-top">
                <div>
                    <h2>${customer.name}</h2>
                    <div class="profile-subtitle"><i class="far fa-envelope"></i> ${customer.email}</div>
                    <div class="profile-subtitle"><i class="fas fa-phone-alt"></i> ${customer.phone}</div>
                    <div class="profile-subtitle"><i class="fas fa-location-dot"></i> ${customer.destination}</div>
                </div>
                <div class="soft-badge ${getLoyaltyClass(customer.loyalty)}" style="background: rgba(255,255,255,0.18); color: white;">
                    ${customer.loyalty} Member
                </div>
            </div>
            <div class="profile-stats">
                <div class="profile-stat">
                    <strong>${customer.trips}</strong>
                    <span>Bookings</span>
                </div>
                <div class="profile-stat">
                    <strong>${formatCurrency(customer.totalSpent)}</strong>
                    <span>Collected Revenue</span>
                </div>
                <div class="profile-stat">
                    <strong>${customer.memberSince}</strong>
                    <span>CRM Since</span>
                </div>
            </div>
        </div>
        <div class="panel-body">
            <div class="profile-grid">
                <div class="info-block">
                    <h4><i class="fas fa-heart"></i> Preferences & CRM Notes</h4>
                    <p style="font-size: 14px; color: var(--gray);">${customer.preferences}</p>
                    <div class="tag-row">
                        <span class="soft-badge" style="background: #fee2e2; color: #be123c;">${customer.type}</span>
                        <span class="soft-badge" style="background: #f1f5f9; color: var(--gray);">${customer.agent}</span>
                        <span class="soft-badge" style="background: #ecfeff; color: #155e75;">${customer.travelerBreakdown}</span>
                    </div>
                    <h4 style="margin-top: 18px;"><i class="fas fa-note-sticky"></i> Internal Notes</h4>
                    <p style="font-size: 14px; color: var(--gray);">${customer.notes}</p>
                    <div style="margin-top: 16px; font-size: 13px; color: var(--gray);">
                        Pipeline status: <strong style="color: var(--secondary); text-transform: capitalize;">${customer.status.replace('_', ' ')}</strong><br>
                        Budget benchmark: <strong style="color: var(--secondary);">${formatCurrency(customer.budget)}</strong><br>
                        Feedback: <strong style="color: var(--secondary);">${feedbackSummary}</strong>
                    </div>
                </div>
                <div class="info-block">
                    <h4><i class="fas fa-suitcase"></i> Booking History</h4>
                    <div class="mini-list">${bookingMarkup}</div>
                    <h4 style="margin-top: 18px;"><i class="fas fa-headset"></i> Support & Service</h4>
                    <div class="mini-list">${ticketSummary}</div>
                </div>
            </div>
            <div class="profile-actions">
                <button class="btn-primary" data-onclick="notifyAction('Message ready', 'Use this profile for WhatsApp or email follow-up.')"><i class="far fa-message"></i> Contact</button>
                <button class="btn-outline" data-onclick="notifyAction('Handoff ready', 'Move this traveler into quotation or booking workflow.')"><i class="fas fa-route"></i> Start Next Step</button>
            </div>
        </div>
    `;
}

function populateAgentFilter() {
    const select = document.getElementById('agentFilter');
    if (!select) return;

    const currentValue = select.value;
    const agents = Array.from(new Set(customers.map(item => item.agent).filter(Boolean))).sort();
    select.innerHTML = '<option value="">Assigned Agent</option>' + agents.map(agent => `<option value="${agent}">${agent}</option>`).join('');
    select.value = currentValue;
}

function applyCustomerFilters() {
    const search = document.getElementById('searchInput').value.trim().toLowerCase();
    const type = document.getElementById('typeFilter').value;
    const loyalty = document.getElementById('loyaltyFilter').value;
    const agent = document.getElementById('agentFilter').value;

    filteredCustomers = customers.filter(customer => {
        const searchTarget = `${customer.name} ${customer.email} ${customer.phone} ${customer.destination}`.toLowerCase();
        const matchesSearch = !search || searchTarget.includes(search);
        const matchesType = !type || customer.type === type;
        const matchesLoyalty = !loyalty || customer.loyalty === loyalty;
        const matchesAgent = !agent || customer.agent === agent;
        return matchesSearch && matchesType && matchesLoyalty && matchesAgent;
    });

    if (activeCustomerId && !filteredCustomers.some(item => item.id === activeCustomerId)) {
        activeCustomerId = null;
        renderEmptyProfile('Select a customer to view details', 'Profile, preferences, booking history and quick actions will appear here.');
    }

    renderCustomers();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('loyaltyFilter').value = '';
    document.getElementById('agentFilter').value = '';
    filteredCustomers = [...customers];
    activeCustomerId = null;
    renderCustomers();
    renderEmptyProfile('Select a customer to view details', 'Profile, preferences, booking history and quick actions will appear here.');
}

function openModal(modalId) {
    document.getElementById(modalId)?.classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove('show');
}

function showToast(message, detail, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : type === 'warning' ? 'warning' : ''}`;
    toast.innerHTML = `<i>${type === 'success' ? '✓' : type === 'error' ? '✗' : '!'}</i><div><strong>${message}</strong><br><small>${detail}</small></div>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function notifyAction(message, detail) {
    showToast(message, detail);
}

function saveCustomer() {
    const name = document.getElementById('customerName').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const destination = document.getElementById('customerDestination').value.trim();
    const budget = Number(document.getElementById('customerBudget').value || 0);

    if (!name || !phone || !destination) {
        showToast('Required details missing', 'Name, phone and destination are required.', 'warning');
        return;
    }

    const nextId = Math.max(1000, ...window.state.leads.map(item => Number(item.id || 0))) + 1;
    window.state.leads.unshift(window.normalizeLead({
        id: nextId,
        name,
        email,
        phone,
        source: 'Customer Desk',
        destination,
        budget,
        travelers: 2,
        travelDate: document.getElementById('customerTravelDate').value,
        status: 'contacted',
        score: 72,
        createdAt: new Date().toISOString().split('T')[0],
        assignedTo: document.getElementById('customerAgent').value || 'Unassigned',
        notes: `${document.getElementById('customerType').value} traveler. ${document.getElementById('customerNotes').value.trim()}`.trim(),
        packageType: document.getElementById('customerType').value === 'Luxury' ? 'premium' : 'standard',
        tripType: window.detectTripType ? window.detectTripType(destination) : 'domestic',
        travelerBreakdown: { adults: 2, young: 0, children: 0, infants: 0 },
        inclusionNotes: [document.getElementById('customerAddress').value.trim()].filter(Boolean),
        exclusionNotes: []
    }));

    closeModal('addCustomerModal');
    initializeCustomerPage();
    showToast('Customer added', `${name} has been added to the CRM directory.`);
}

function importCustomers() {
    closeModal('importModal');
    showToast('Import note', 'CSV import UI is ready; backend parsing is still demo-only.');
}

function initializeCustomerPage() {
    buildCustomers();
    updateCustomerStats();
    populateAgentFilter();
    renderCustomers();

    if (activeCustomerId) {
        showCustomerProfile(activeCustomerId);
    } else {
        renderEmptyProfile('Select a customer to view details', 'Profile, preferences, booking history and quick actions will appear here.');
    }
}

document.addEventListener('DOMContentLoaded', initializeCustomerPage);

window.applyCustomerFilters = applyCustomerFilters;
window.resetFilters = resetFilters;
window.showCustomerProfile = showCustomerProfile;
window.openModal = openModal;
window.closeModal = closeModal;
window.notifyAction = notifyAction;
window.saveCustomer = saveCustomer;
window.importCustomers = importCustomers;
