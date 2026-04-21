// ============================================
// SOLVONIX TRAVEL CRM - REAL WORLD JAVASCRIPT
// Complete Travel Pipeline System
// ============================================

// ========== GLOBAL STATE (Mock Database) ==========
let state = {
    leads: [],
    quotations: [],
    bookings: [],
    employees: [],
    campaigns: [],
    tickets: [],
    feedbacks: [],
    transactions: [],
    itineraries: [],
    vendorPayouts: [],
    users: {
        admin: { name: 'Rajesh Kumar', role: 'Admin', avatar: 'RK' }
    }
};

// ========== INITIAL SAMPLE DATA ==========
const sampleData = {
    leads: [
        { id: 1001, name: 'Amit Sharma', email: 'amit.sharma@gmail.com', phone: '9876543210', source: 'Google Ads', destination: 'Goa', budget: 55000, travelers: 4, travelDate: '2024-04-15', status: 'new', score: 85, createdAt: '2024-02-10', assignedTo: 'Neha Singh', notes: 'Family trip, looking for beach resort', tripType: 'domestic', packageType: 'standard', travelerBreakdown: { adults: 2, young: 1, children: 1, infants: 0 }, preferredHotelCategory: '3 Star', inclusionNotes: ['Hotel stay', 'Airport pickup'], exclusionNotes: ['Lunch', 'Personal expenses'] },
        { id: 1002, name: 'Priya Verma', email: 'priya.verma@yahoo.com', phone: '9876543211', source: 'Referral', destination: 'Manali', budget: 42000, travelers: 2, travelDate: '2024-03-25', status: 'contacted', score: 78, createdAt: '2024-02-09', assignedTo: 'Neha Singh', notes: 'Honeymoon package', tripType: 'domestic', packageType: 'deluxe', travelerBreakdown: { adults: 2, young: 0, children: 0, infants: 0 } },
        { id: 1003, name: 'Rahul Mehta', email: 'rahul.mehta@gmail.com', phone: '9876543212', source: 'Instagram', destination: 'Kerala', budget: 68000, travelers: 3, travelDate: '2024-04-05', status: 'interested', score: 92, createdAt: '2024-02-08', assignedTo: 'Amit Patel', notes: 'Backwaters and houseboat', tripType: 'domestic', packageType: 'premium', travelerBreakdown: { adults: 2, young: 1, children: 0, infants: 0 } },
        { id: 1004, name: 'Sneha Reddy', email: 'sneha.r@rediff.com', phone: '9876543213', source: 'Website', destination: 'Rajasthan', budget: 75000, travelers: 5, travelDate: '2024-03-18', status: 'quotation_sent', score: 88, createdAt: '2024-02-07', assignedTo: 'Neha Singh', notes: 'Cultural tour with family', tripType: 'domestic', packageType: 'deluxe', travelerBreakdown: { adults: 2, young: 1, children: 2, infants: 0 } },
        { id: 1005, name: 'Vikram Singh', email: 'vikram.singh@gmail.com', phone: '9876543214', source: 'Google Ads', destination: 'Andaman', budget: 95000, travelers: 2, travelDate: '2024-05-10', status: 'negotiation', score: 94, createdAt: '2024-02-06', assignedTo: 'Rajesh Kumar', notes: 'Scuba diving interested', tripType: 'domestic', packageType: 'premium', travelerBreakdown: { adults: 2, young: 0, children: 0, infants: 0 } },
        { id: 1006, name: 'Anjali Nair', email: 'anjali.nair@gmail.com', phone: '9876543215', source: 'Referral', destination: 'Kashmir', budget: 62000, travelers: 3, travelDate: '2024-04-20', status: 'won', score: 96, createdAt: '2024-02-05', assignedTo: 'Amit Patel', notes: 'Booked premium package', tripType: 'domestic', packageType: 'premium', travelerBreakdown: { adults: 2, young: 0, children: 1, infants: 0 } },
        { id: 1007, name: 'Deepak Joshi', email: 'deepak.j@yahoo.com', phone: '9876543216', source: 'Facebook', destination: 'Thailand', budget: 125000, travelers: 2, travelDate: '2024-06-01', status: 'new', score: 82, createdAt: '2024-02-10', assignedTo: 'Rajesh Kumar', notes: 'International trip', tripType: 'international', packageType: 'deluxe', travelerBreakdown: { adults: 2, young: 0, children: 0, infants: 0 } },
        { id: 1008, name: 'Kavita Sharma', email: 'kavita.s@gmail.com', phone: '9876543217', source: 'Google Ads', destination: 'Singapore', budget: 145000, travelers: 4, travelDate: '2024-05-25', status: 'lost', score: 45, createdAt: '2024-02-04', assignedTo: 'Neha Singh', notes: 'Budget issue', tripType: 'international', packageType: 'premium', travelerBreakdown: { adults: 2, young: 0, children: 1, infants: 1 } }
    ],
    
    quotations: [
        { id: 5001, leadId: 1004, amount: 65000, tax: 3250, total: 68250, status: 'sent', version: 1, createdAt: '2024-02-08', validUntil: '2024-02-15', itinerary: '5 Days Rajasthan Tour', packageType: 'deluxe', tripType: 'domestic', nights: 4, days: 5, travelerBreakdown: { adults: 2, young: 1, children: 2, infants: 0 }, inclusions: ['Hotel stay', 'Breakfast', 'Private cab', 'Sightseeing'], exclusions: ['Lunch', 'Entry tickets'], assignedTo: 'Neha Singh' },
        { id: 5002, leadId: 1005, amount: 89000, tax: 4450, total: 93450, status: 'negotiating', version: 2, createdAt: '2024-02-07', validUntil: '2024-02-14', itinerary: '6 Days Andaman Package', packageType: 'premium', tripType: 'domestic', nights: 5, days: 6, travelerBreakdown: { adults: 2, young: 0, children: 0, infants: 0 }, inclusions: ['Beach resort', 'Breakfast', 'Airport transfer', 'Scuba session'], exclusions: ['Lunch', '5% TCS'], assignedTo: 'Rajesh Kumar' },
        { id: 5003, leadId: 1006, amount: 58000, tax: 2900, total: 60900, status: 'accepted', version: 1, createdAt: '2024-02-06', validUntil: '2024-02-13', itinerary: '5 Days Kashmir Tour', packageType: 'premium', tripType: 'domestic', nights: 4, days: 5, travelerBreakdown: { adults: 2, young: 0, children: 1, infants: 0 }, inclusions: ['Hotel stay', 'Breakfast & dinner', 'Airport transfer', 'Shikara ride'], exclusions: ['Airfare', 'Lunch'], assignedTo: 'Amit Patel' }
    ],
    
    bookings: [
        { id: 2001, bookingRef: 'SOL-BK-001', leadId: 1006, quoteId: 5003, totalAmount: 60900, paidAmount: 60900, paymentStatus: 'full', paymentDate: '2024-02-09', travelDate: '2024-04-20', status: 'confirmed', paymentMode: 'UPI', assignedTo: 'Amit Patel', incentiveAmount: 2436, incentiveRate: 4, packageType: 'premium', tripType: 'domestic' }
    ],

    employees: [
        { id: 101, name: 'Rajesh Kumar', email: 'rajesh@solvonix.com', phone: '+91 98765 43210', role: 'CRM Admin', department: 'Management', status: 'active', joiningDate: '2021-04-10', location: 'Delhi HQ', manager: 'Founder Office', salary: 95000, performance: 97, activeLeads: 14, activeBookings: 9, notes: 'Oversees revenue, approvals and CRM operations.' },
        { id: 102, name: 'Neha Singh', email: 'neha@solvonix.com', phone: '+91 98111 22334', role: 'Senior Travel Consultant', department: 'Sales', status: 'active', joiningDate: '2022-01-18', location: 'Delhi HQ', manager: 'Rajesh Kumar', salary: 62000, performance: 92, activeLeads: 28, activeBookings: 7, notes: 'Handles premium domestic family and leisure packages.' },
        { id: 103, name: 'Amit Patel', email: 'amit.p@solvonix.com', phone: '+91 98222 33445', role: 'Travel Consultant', department: 'Sales', status: 'active', joiningDate: '2022-08-05', location: 'Ahmedabad Desk', manager: 'Neha Singh', salary: 52000, performance: 88, activeLeads: 19, activeBookings: 11, notes: 'Strong closer for premium upsell and repeat customers.' },
        { id: 104, name: 'Priya Sharma', email: 'priya.s@solvonix.com', phone: '+91 98333 44556', role: 'Campaign Executive', department: 'Marketing', status: 'active', joiningDate: '2023-02-12', location: 'Remote', manager: 'Rajesh Kumar', salary: 45000, performance: 84, activeLeads: 0, activeBookings: 0, notes: 'Owns campaign automation and follow-up sequences.' },
        { id: 105, name: 'Rohit Mehra', email: 'rohit@solvonix.com', phone: '+91 98444 55667', role: 'Support Lead', department: 'Operations', status: 'on_leave', joiningDate: '2021-11-01', location: 'Mumbai Support Hub', manager: 'Rajesh Kumar', salary: 56000, performance: 81, activeLeads: 0, activeBookings: 16, notes: 'Escalation owner for in-trip support and service recovery.' }
    ],
    campaigns: [
        { id: 1, name: 'Pre-travel Tips - Kashmir', trigger: '7 days before', status: 'active', sent: 156, opens: 98 },
        { id: 2, name: 'Packing Checklist', trigger: '5 days before', status: 'active', sent: 156, opens: 112 },
        { id: 3, name: 'Post Trip Feedback', trigger: '1 day after return', status: 'active', sent: 234, opens: 189 }
    ],
    
    tickets: [
        { id: 3001, customer: 'Sneha Reddy', subject: 'Hotel change request', status: 'open', priority: 'high', createdAt: '2024-02-10', assignedTo: 'Support Team' }
    ],
    
    feedbacks: [
        { id: 4001, customer: 'Rajesh Khanna', rating: 5, comment: 'Excellent service! Everything was perfect.', date: '2024-01-25', points: 500 }
    ],

    transactions: [
        { id: 1, bookingId: 2001, bookingRef: 'SOL-BK-001', amount: 60900, mode: 'UPI', transactionId: 'UPI24020901', notes: 'Full advance received', date: '2024-02-09' }
    ]
};

// ========== INITIALIZE APP ==========
document.addEventListener('DOMContentLoaded', function() {
    loadSampleDataIntoState();
    initializeEventListeners();
    renderCurrentPage();
});

function loadSampleDataIntoState() {
    state.leads = sampleData.leads.map(normalizeLead);
    state.quotations = sampleData.quotations.map(normalizeQuotation);
    state.bookings = sampleData.bookings.map(normalizeBooking);
    state.employees = sampleData.employees.map(normalizeEmployee);
    state.campaigns = [...sampleData.campaigns];
    state.tickets = [...sampleData.tickets];
    state.feedbacks = [...sampleData.feedbacks];
    state.transactions = [...(sampleData.transactions || [])];
    state.itineraries = state.bookings.map(createItineraryFromBooking).filter(Boolean);
}

function normalizeTravelerBreakdown(breakdown = {}) {
    const normalized = {
        adults: Number(breakdown.adults || 0),
        young: Number(breakdown.young || 0),
        children: Number(breakdown.children || 0),
        infants: Number(breakdown.infants || 0)
    };
    return normalized;
}

function getTravelerTotal(breakdown = {}) {
    const normalized = normalizeTravelerBreakdown(breakdown);
    return normalized.adults + normalized.young + normalized.children + normalized.infants;
}

function formatTravelerBreakdown(breakdown = {}) {
    const normalized = normalizeTravelerBreakdown(breakdown);
    const parts = [];
    if (normalized.adults) parts.push(`${normalized.adults} Adult`);
    if (normalized.young) parts.push(`${normalized.young} Young`);
    if (normalized.children) parts.push(`${normalized.children} Child`);
    if (normalized.infants) parts.push(`${normalized.infants} Baby`);
    return parts.length ? parts.join(', ') : 'Traveler details pending';
}

function parseTextareaList(value) {
    return String(value || '')
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean);
}

function formatListForTextarea(items = []) {
    return Array.isArray(items) ? items.join('\n') : '';
}

function updateQuoteTravelerTotal() {
    const travelerTotalField = document.getElementById('travelerTotal');
    if (!travelerTotalField) return;

    const travelerBreakdown = normalizeTravelerBreakdown({
        adults: document.getElementById('travelerAdults')?.value,
        young: document.getElementById('travelerYoung')?.value,
        children: document.getElementById('travelerChildren')?.value,
        infants: document.getElementById('travelerInfants')?.value
    });

    travelerTotalField.value = getTravelerTotal(travelerBreakdown);
}

function attachQuoteFormListeners() {
    document.getElementById('packageType')?.addEventListener('change', updateTotals);
    document.getElementById('baseAmount')?.addEventListener('input', updateTotals);
    document.getElementById('discount')?.addEventListener('input', updateTotals);
    ['travelerAdults', 'travelerYoung', 'travelerChildren', 'travelerInfants'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateQuoteTravelerTotal);
    });
    updateQuoteTravelerTotal();
}

function detectTripType(destination = '') {
    const internationalDestinations = ['thailand', 'singapore', 'bali', 'maldives', 'switzerland', 'dubai', 'europe'];
    return internationalDestinations.includes(String(destination).toLowerCase()) ? 'international' : 'domestic';
}

function getIncentiveRate(quoteOrBooking = {}) {
    const tripType = quoteOrBooking.tripType || 'domestic';
    const packageType = quoteOrBooking.packageType || 'standard';
    const rateMatrix = {
        domestic: { standard: 2, deluxe: 3, premium: 4 },
        international: { standard: 3, deluxe: 4, premium: 5 }
    };
    return rateMatrix[tripType]?.[packageType] || 2;
}

function calculateIncentive(totalAmount, quoteOrBooking = {}) {
    const rate = getIncentiveRate(quoteOrBooking);
    return {
        rate,
        amount: Math.round((Number(totalAmount || 0) * rate) / 100)
    };
}

function normalizeLead(lead) {
    const travelerBreakdown = normalizeTravelerBreakdown(lead.travelerBreakdown || { adults: lead.travelers || 0 });
    return {
        ...lead,
        tripType: lead.tripType || detectTripType(lead.destination),
        packageType: lead.packageType || 'standard',
        travelerBreakdown,
        travelers: lead.travelers || getTravelerTotal(travelerBreakdown),
        inclusionNotes: Array.isArray(lead.inclusionNotes) ? lead.inclusionNotes : [],
        exclusionNotes: Array.isArray(lead.exclusionNotes) ? lead.exclusionNotes : [],
        assignedTo: lead.assignedTo || 'unassigned'
    };
}

function normalizeEmployee(employee) {
    return {
        ...employee,
        status: employee.status || 'active',
        department: employee.department || 'Sales',
        role: employee.role || 'Team Member',
        performance: Number(employee.performance || 0),
        activeLeads: Number(employee.activeLeads || 0),
        activeBookings: Number(employee.activeBookings || 0),
        salary: Number(employee.salary || 0)
    };
}

function normalizeQuotation(quotation) {
    const lead = sampleData.leads.find(item => item.id === quotation.leadId) || state.leads.find(item => item.id === quotation.leadId) || {};
    const travelerBreakdown = normalizeTravelerBreakdown(quotation.travelerBreakdown || lead.travelerBreakdown || { adults: lead.travelers || 0 });
    return {
        ...quotation,
        packageType: quotation.packageType || lead.packageType || 'standard',
        tripType: quotation.tripType || lead.tripType || detectTripType(lead.destination),
        travelerBreakdown,
        nights: Number(quotation.nights || 0),
        days: Number(quotation.days || (quotation.nights ? quotation.nights + 1 : 0)),
        inclusions: Array.isArray(quotation.inclusions) ? quotation.inclusions : [],
        exclusions: Array.isArray(quotation.exclusions) ? quotation.exclusions : [],
        assignedTo: quotation.assignedTo || lead.assignedTo || 'unassigned'
    };
}

function normalizeBooking(booking) {
    const quote = sampleData.quotations.find(item => item.id === booking.quoteId) || sampleData.quotations.find(item => item.leadId === booking.leadId) || state.quotations.find(item => item.id === booking.quoteId) || {};
    const incentive = calculateIncentive(booking.totalAmount, {
        tripType: booking.tripType || quote.tripType,
        packageType: booking.packageType || quote.packageType
    });
    return {
        ...booking,
        quoteId: booking.quoteId || quote.id || null,
        assignedTo: booking.assignedTo || quote.assignedTo || 'unassigned',
        packageType: booking.packageType || quote.packageType || 'standard',
        tripType: booking.tripType || quote.tripType || 'domestic',
        incentiveRate: booking.incentiveRate || incentive.rate,
        incentiveAmount: booking.incentiveAmount || incentive.amount
    };
}

function createItineraryFromBooking(booking) {
    const lead = state.leads.find(item => item.id === booking.leadId) || sampleData.leads.find(item => item.id === booking.leadId);
    const quote = state.quotations.find(item => item.id === booking.quoteId) || sampleData.quotations.find(item => item.id === booking.quoteId) || sampleData.quotations.find(item => item.leadId === booking.leadId);
    if (!lead) return null;

    const startDate = booking.travelDate || lead.travelDate || new Date().toISOString().split('T')[0];
    const nights = quote?.nights || 4;
    const days = quote?.days || nights + 1;
    const destination = lead.destination || 'Custom Tour';

    return {
        bookingId: booking.id,
        quoteId: quote?.id || null,
        title: quote?.itinerary || `${days} Days ${destination} Package`,
        dates: `${startDate} onwards`,
        duration: `${days} Days / ${nights} Nights`,
        traveler: lead.name,
        pax: formatTravelerBreakdown(quote?.travelerBreakdown || lead.travelerBreakdown),
        inclusions: quote?.inclusions?.length ? quote.inclusions : ['Hotel stay', 'Transfers', 'Sightseeing'],
        exclusions: quote?.exclusions?.length ? quote.exclusions : ['Personal expenses'],
        invoice: [
            ['Package Cost', `₹${Number(quote?.amount || booking.totalAmount || 0).toLocaleString()}`],
            ['GST (5%)', `₹${Number(quote?.tax || 0).toLocaleString()}`],
            ['Total', `₹${Number(booking.totalAmount || quote?.total || 0).toLocaleString()}`]
        ],
        summary: [
            ['Paid', `₹${Number(booking.paidAmount || 0).toLocaleString()}`],
            ['Balance Due', `₹${Number((booking.totalAmount || 0) - (booking.paidAmount || 0)).toLocaleString()}`],
            ['Sales Owner', booking.assignedTo || lead.assignedTo || 'Unassigned']
        ],
        days: Array.from({ length: days }, (_, index) => ({
            title: index === 0 ? `Arrival in ${destination}` : index === days - 1 ? `Departure from ${destination}` : `${destination} Exploration`,
            date: getDateAfterDays(startDate, index),
            icon: index === 0 ? 'plane' : index === days - 1 ? 'plane' : 'map',
            activities: [
                {
                    time: '09:00 AM',
                    icon: index === 0 ? 'hotel' : 'map',
                    title: index === 0 ? 'Arrival & hotel check-in' : 'Sightseeing / free time',
                    description: `${destination} service plan for Day ${index + 1}`
                }
            ]
        }))
    };
}

function getCurrentPage() {
    const path = window.location.pathname.replace(/\/+$/, '');
    const lastSegment = path.split('/').pop() || '';
    const normalized = !lastSegment ? 'index' : lastSegment.replace(/\.html$/i, '');

    const pageMap = {
        index: 'dashboard',
        leads: 'leads',
        quotations: 'quotations',
        bookings: 'bookings',
        customers: 'customers',
        payments: 'payments',
        itinerary: 'itinerary',
        campaigns: 'campaigns',
        support: 'support',
        feedback: 'feedback',
        reports: 'reports',
        employees: 'employees'
    };

    return pageMap[normalized] || 'dashboard';
}

function renderCurrentPage() {
    const page = getCurrentPage();
    
    if (page === 'dashboard') {
        renderDashboard();
    } else if (page === 'leads') {
        renderLeadsTable();
    } else if (page === 'quotations') {
        renderQuotationsTable();
    } else if (page === 'bookings') {
        renderBookingsTable();
    } else if (page === 'campaigns') {
        renderCampaigns();
    } else if (page === 'support') {
        renderTickets();
    } else if (page === 'feedback') {
        renderFeedback();
    } else if (page === 'reports') {
        renderReports();
    }
}

// ========== DASHBOARD FUNCTIONS ==========
function renderDashboard() {
    updateStats();
    renderFlowSteps();
    renderKanbanPipeline();
    renderRecentActivities();
}

function updateStats() {
    const totalLeads = state.leads.length;
    const wonLeads = state.leads.filter(l => l.status === 'won').length;
    const conversionRate = totalLeads ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;
    const totalRevenue = state.bookings.reduce((sum, b) => sum + b.paidAmount, 0);
    const activeBookings = state.bookings.filter(b => b.status === 'confirmed').length;
    
    document.getElementById('totalLeads') && (document.getElementById('totalLeads').innerText = totalLeads);
    document.getElementById('conversionRate') && (document.getElementById('conversionRate').innerText = conversionRate + '%');
    document.getElementById('totalRevenue') && (document.getElementById('totalRevenue').innerText = '₹' + (totalRevenue/1000).toFixed(0) + 'K');
    document.getElementById('activeBookings') && (document.getElementById('activeBookings').innerText = activeBookings);
}

function renderFlowSteps() {
    const container = document.getElementById('flowStepsContainer');
    if (!container) return;
    
    const steps = [
        { num: 1, title: 'Lead Capture', desc: 'Web/WhatsApp/Ads' },
        { num: 2, title: 'Qualification', desc: 'Score & Assign' },
        { num: 3, title: 'Quotation', desc: 'PDF & Follow-up' },
        { num: 4, title: 'Negotiation', desc: 'Discount & Deal' },
        { num: 5, title: 'Booking', desc: 'Confirm & Lock' },
        { num: 6, title: 'Payment', desc: 'Partial/Full' },
        { num: 7, title: 'Trip Handoff', desc: 'Documents' },
        { num: 8, title: 'Pre-travel', desc: 'Drip Campaign' },
        { num: 9, title: 'During Travel', desc: 'Support' },
        { num: 10, title: 'Post Travel', desc: 'Feedback & Points' }
    ];
    
    container.innerHTML = steps.map(step => `
        <div class="flow-step">
            <div class="step-number">${step.num}</div>
            <div class="step-title">${step.title}</div>
            <div class="step-desc">${step.desc}</div>
        </div>
    `).join('');
}

function renderKanbanPipeline() {
    const container = document.getElementById('kanbanPipeline');
    if (!container) return;
    
    const stages = [
        { name: 'New Leads', status: 'new', color: '#3b82f6' },
        { name: 'Contacted', status: 'contacted', color: '#f59e0b' },
        { name: 'Interested', status: 'interested', color: '#10b981' },
        { name: 'Quotation Sent', status: 'quotation_sent', color: '#8b5cf6' },
        { name: 'Negotiation', status: 'negotiation', color: '#ec489a' },
        { name: 'Won / Booked', status: 'won', color: '#10b981' },
        { name: 'Lost', status: 'lost', color: '#ef4444' }
    ];
    
    container.innerHTML = stages.map(stage => {
        const stageLeads = state.leads.filter(l => l.status === stage.status);
        return `
            <div class="kanban-column">
                <div class="column-header">
                    <span class="column-title">${stage.name}</span>
                    <span class="column-count">${stageLeads.length}</span>
                </div>
                ${stageLeads.map(lead => `
                    <div class="kanban-card" data-onclick="viewLead(${lead.id})">
                        <div class="card-title">${lead.name}</div>
                        <div class="card-detail">${lead.destination} | ₹${lead.budget.toLocaleString()}</div>
                        <div class="card-badge">${lead.source}</div>
                    </div>
                `).join('')}
                ${stageLeads.length === 0 ? '<div style="text-align:center; padding:20px; color:#94a3b8; font-size:12px;">No leads</div>' : ''}
            </div>
        `;
    }).join('');
}

function renderRecentActivities() {
    const container = document.getElementById('recentActivities');
    if (!container) return;
    
    const recentLeads = [...state.leads].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,5);
    
    container.innerHTML = recentLeads.map(lead => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #e2e8f0;">
            <div>
                <div style="font-weight:500;">${lead.name}</div>
                <div style="font-size:12px; color:#64748b;">${lead.destination} | ₹${lead.budget.toLocaleString()}</div>
            </div>
            <span class="status-badge status-${lead.status === 'new' ? 'new' : lead.status === 'contacted' ? 'contacted' : lead.status === 'interested' ? 'interested' : lead.status === 'quotation_sent' ? 'quotation' : lead.status === 'negotiation' ? 'negotiation' : lead.status === 'won' ? 'won' : 'lost'}">${lead.status}</span>
        </div>
    `).join('');
}

// ========== LEADS PAGE FUNCTIONS ==========
function renderLeadsTable() {
    const tbody = document.getElementById('leadsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = state.leads.map(lead => `
        <tr>
            <td><input type="checkbox" class="lead-checkbox" data-id="${lead.id}"></td>
            <td><strong>${lead.name}</strong><br><small style="color:#64748b;">${lead.email}</small></td>
            <td>${lead.source}</td>
            <td>${lead.destination}</td>
            <td>₹${lead.budget.toLocaleString()}</td>
            <td>${lead.travelers}</td>
            <td><span class="status-badge status-${getStatusClass(lead.status)}">${lead.status.replace('_', ' ')}</span></td>
            <td>${lead.score}</td>
            <td>${lead.assignedTo !== 'unassigned' ? lead.assignedTo : '-'}</td>
            <td>
                <button class="btn-outline" style="padding:4px 8px; margin:0 2px;" data-onclick="viewLead(${lead.id})">View</button>
                <button class="btn-outline" style="padding:4px 8px; margin:0 2px;" data-onclick="sendQuotation(${lead.id})">Quote</button>
                <button class="btn-outline" style="padding:4px 8px; margin:0 2px; color:#ef4444;" data-onclick="deleteLead(${lead.id})">Del</button>
            </td>
        </tr>
    `).join('');
}

function getStatusClass(status) {
    const map = {
        'new': 'new', 'contacted': 'contacted', 'interested': 'interested',
        'quotation_sent': 'quotation', 'negotiation': 'negotiation',
        'won': 'won', 'lost': 'lost'
    };
    return map[status] || 'new';
}

function viewLead(id) {
    const lead = state.leads.find(l => l.id === id);
    if (!lead) return;
    
    const modalHtml = `
        <div class="modal show" id="leadModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Lead Details: ${lead.name}</h3>
                    <button class="close-modal" data-onclick="closeModal('leadModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <div><strong>Email:</strong><br>${lead.email}</div>
                        <div><strong>Phone:</strong><br>${lead.phone}</div>
                        <div><strong>Source:</strong><br>${lead.source}</div>
                        <div><strong>Destination:</strong><br>${lead.destination}</div>
                        <div><strong>Budget:</strong><br>₹${lead.budget.toLocaleString()}</div>
                        <div><strong>Travelers:</strong><br>${lead.travelers}</div>
                        <div><strong>Trip Type:</strong><br>${lead.tripType}</div>
                        <div><strong>Package:</strong><br>${lead.packageType}</div>
                        <div><strong>Travel Date:</strong><br>${lead.travelDate}</div>
                        <div><strong>Lead Score:</strong><br>${lead.score}/100</div>
                        <div><strong>Assigned To:</strong><br>${lead.assignedTo}</div>
                        <div><strong>Created:</strong><br>${lead.createdAt}</div>
                    </div>
                    <div style="margin-top:16px;"><strong>Pax Breakup:</strong><br>${formatTravelerBreakdown(lead.travelerBreakdown)}</div>
                    <div style="margin-top:16px;"><strong>Preferred Inclusions:</strong><br>${lead.inclusionNotes.join(', ') || 'Not added'}</div>
                    <div style="margin-top:16px;"><strong>Exclusions:</strong><br>${lead.exclusionNotes.join(', ') || 'Not added'}</div>
                    <div style="margin-top:16px;"><strong>Notes:</strong><br>${lead.notes || 'No notes'}</div>
                </div>
                <div class="modal-footer">
                    <button class="btn-outline" data-onclick="closeModal('leadModal')">Close</button>
                    <button class="btn-primary" data-onclick="sendQuotation(${lead.id}); closeModal('leadModal');">Send Quotation</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function sendQuotation(leadId) {
    const lead = state.leads.find(l => l.id === leadId);
    if (!lead) return;
    const travelerBreakdown = normalizeTravelerBreakdown(lead.travelerBreakdown);
    const defaultNights = Math.max(Number(lead.quoteNights || 4), 0);
    
    const modalHtml = `
        <div class="modal show" id="quoteModal">
            <div class="modal-content quote-modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-file-invoice"></i> Generate New Quotation</h3>
                    <button class="close-modal" data-onclick="closeModal('quoteModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="quoteForm">
                        <input type="hidden" id="quoteLeadId" value="${lead.id}">
                        <div class="form-group">
                            <label>Select Lead *</label>
                            <select id="quoteLeadIdDisplay" class="form-control" disabled>
                                <option value="${lead.id}">${lead.name} - ${lead.destination} (₹${lead.budget.toLocaleString()})</option>
                            </select>
                        </div>
                        <div id="leadDetailsPreview" class="quote-lead-preview">
                            <div><strong>${lead.name}</strong></div>
                            <div class="quote-lead-preview-meta">${lead.destination} | ${lead.travelers} travelers | ${lead.travelDate || 'Date flexible'}</div>
                        </div>
                        <div class="quote-grid-two">
                            <div class="form-group">
                                <label>Package Type</label>
                                <select id="packageType" class="form-control">
                                    <option value="standard" ${lead.packageType === 'standard' ? 'selected' : ''}>Standard Package</option>
                                    <option value="deluxe" ${lead.packageType === 'deluxe' ? 'selected' : ''}>Deluxe Package (+20%)</option>
                                    <option value="premium" ${lead.packageType === 'premium' ? 'selected' : ''}>Premium Package (+40%)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Trip Type</label>
                                <select id="quoteTripType" class="form-control">
                                    <option value="domestic" ${lead.tripType === 'domestic' ? 'selected' : ''}>Domestic</option>
                                    <option value="international" ${lead.tripType === 'international' ? 'selected' : ''}>International</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Base Amount (₹)</label>
                                <input type="number" id="baseAmount" class="form-control" value="${lead.budget}">
                            </div>
                            <div class="form-group">
                                <label>Nights</label>
                                <input type="number" id="quoteNights" class="form-control" value="${defaultNights}" min="0">
                            </div>
                            <div class="form-group">
                                <label>Discount (₹)</label>
                                <input type="number" id="discount" class="form-control" value="0" data-onchange="updateTotals()">
                            </div>
                            <div class="form-group">
                                <label>Valid Until</label>
                                <input type="date" id="validUntil" class="form-control" value="${getDateAfterDays(7)}">
                            </div>
                        </div>
                        <div class="quote-grid-four">
                            <div class="form-group">
                                <label>Adults (12+ yrs)</label>
                                <input type="number" id="travelerAdults" class="form-control" value="${travelerBreakdown.adults}" min="0">
                            </div>
                           
                            <div class="form-group">
                                <label>Children (2-11 yrs)</label>
                                <input type="number" id="travelerChildren" class="form-control" value="${travelerBreakdown.children}" min="0">
                            </div>
                            <div class="form-group">
                                <label>Infants (0-2 yrs)</label>
                                <input type="number" id="travelerInfants" class="form-control" value="${travelerBreakdown.infants}" min="0">
                            </div>
                            <div class="form-group">
                                <label>Total Travelers</label>
                                <input type="number" id="travelerTotal" class="form-control" value="${lead.travelers}" readonly>
                            </div>
                        </div>
                        <div class="quote-summary-card">
                            <div class="quote-summary-row">
                                <span>Base Amount:</span>
                                <strong id="displayBaseAmount">₹0</strong>
                            </div>
                            <div class="quote-summary-row">
                                <span>Discount:</span>
                                <strong id="displayDiscount" class="quote-discount-value">-₹0</strong>
                            </div>
                            <div class="quote-summary-row">
                                <span>Subtotal:</span>
                                <strong id="displaySubtotal">₹0</strong>
                            </div>
                            <div class="quote-summary-row">
                                <span>GST (5%):</span>
                                <strong id="displayTax">₹0</strong>
                            </div>
                            <div class="quote-summary-row quote-summary-row-total">
                                <span class="quote-total-label">Total Amount:</span>
                                <strong class="quote-total-value" id="displayTotal">₹0</strong>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Itinerary Title</label>
                            <input id="itinerary" class="form-control" value="${defaultNights + 1} Days ${lead.destination} ${lead.packageType.charAt(0).toUpperCase() + lead.packageType.slice(1)} Package" placeholder="Hotel, flights, transfers, sightseeing...">
                        </div>
                        <div class="quote-grid-two">
                            <div class="form-group mt-15">
                            <label>Inclusions</label>
                            <textarea id="quoteInclusions" class="form-control" rows="3">${formatListForTextarea(lead.inclusionNotes)}</textarea>
                            </div>
                            <div class="form-group mt-15">
                            <label>Exclusions</label>
                            <textarea id="quoteExclusions" class="form-control" rows="3">${formatListForTextarea(lead.exclusionNotes)}</textarea>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-outline" data-onclick="closeModal('quoteModal')">Cancel</button>
                    <button class="btn-primary" data-onclick="generateQuotation()">Generate & Send</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    attachQuoteFormListeners();
    updateTotals();
}

function generateQuotation() {
    const leadId = parseInt(document.getElementById('quoteLeadId')?.value);
    const baseAmount = parseFloat(document.getElementById('baseAmount')?.value);
    const discount = parseFloat(document.getElementById('discount')?.value) || 0;
    const packageType = document.getElementById('packageType')?.value;
    const tripType = document.getElementById('quoteTripType')?.value || document.getElementById('tripType')?.value || 'domestic';
    const validUntil = document.getElementById('validUntil')?.value;
    const nights = parseInt(document.getElementById('quoteNights')?.value, 10) || 4;
    const days = parseInt(document.getElementById('quoteDays')?.value, 10) || Math.max(nights + 1, 1);
    const travelerBreakdown = normalizeTravelerBreakdown({
        adults: document.getElementById('travelerAdults')?.value,
        young: document.getElementById('travelerYoung')?.value,
        children: document.getElementById('travelerChildren')?.value,
        infants: document.getElementById('travelerInfants')?.value
    });
    const inclusions = parseTextareaList(document.getElementById('quoteInclusions')?.value);
    const exclusions = parseTextareaList(document.getElementById('quoteExclusions')?.value);
    
    let adjustedBaseAmount = baseAmount;
    if (packageType === 'deluxe') adjustedBaseAmount = baseAmount * 1.2;
    if (packageType === 'premium') adjustedBaseAmount = baseAmount * 1.4;

    const amount = adjustedBaseAmount - discount;
    const tax = amount * 0.05;
    const total = amount + tax;
    const lead = state.leads.find(l => l.id === leadId);
    const itineraryTitle = document.getElementById('itinerary')?.value?.trim() || `${days} Days ${lead?.destination || 'Custom'} ${packageType.charAt(0).toUpperCase() + packageType.slice(1)} Package`;
    
    const newQuote = {
        id: state.quotations.length + 5000,
        leadId: leadId,
        amount: amount,
        tax: tax,
        total: total,
        status: 'sent',
        version: 1,
        createdAt: new Date().toISOString().split('T')[0],
        validUntil: validUntil,
        itinerary: itineraryTitle,
        packageType,
        tripType,
        days,
        nights,
        travelerBreakdown,
        inclusions,
        exclusions,
        assignedTo: lead?.assignedTo || 'unassigned'
    };
    
    state.quotations.push(normalizeQuotation(newQuote));
    
    // Update lead status
    if (lead) {
        lead.status = 'quotation_sent';
        lead.packageType = packageType;
        lead.tripType = tripType;
        lead.travelerBreakdown = travelerBreakdown;
        lead.travelers = getTravelerTotal(travelerBreakdown);
        lead.inclusionNotes = inclusions;
        lead.exclusionNotes = exclusions;
    }
    
    closeModal('quoteModal');
    showToast('Quotation Sent', `Quotation of ₹${total.toLocaleString()} sent to ${lead.name}`);
    
    if (getCurrentPage() === 'leads') renderLeadsTable();
    if (getCurrentPage() === 'quotations') renderQuotationsTable();
}

function deleteLead(id) {
    if (confirm('Are you sure you want to delete this lead?')) {
        state.leads = state.leads.filter(l => l.id !== id);
        renderLeadsTable();
        showToast('Lead Deleted', 'Lead has been removed');
    }
}

function addNewLead() {
    const travelerBreakdown = normalizeTravelerBreakdown({
        adults: document.getElementById('leadAdults')?.value || document.getElementById('leadTravelers')?.value,
        young: document.getElementById('leadYoung')?.value,
        children: document.getElementById('leadChildren')?.value,
        infants: document.getElementById('leadInfants')?.value
    });
    const destination = document.getElementById('leadDestination')?.value;
    const tripType = document.getElementById('leadTripType')?.value || detectTripType(destination);
    const packageType = document.getElementById('leadPackageType')?.value || 'standard';
    const newLead = {
        id: Math.max(...state.leads.map(l => l.id)) + 1,
        name: document.getElementById('leadName')?.value,
        email: document.getElementById('leadEmail')?.value,
        phone: document.getElementById('leadPhone')?.value,
        source: document.getElementById('leadSource')?.value,
        destination,
        budget: parseInt(document.getElementById('leadBudget')?.value),
        travelers: getTravelerTotal(travelerBreakdown),
        travelDate: document.getElementById('leadTravelDate')?.value,
        status: 'new',
        score: Math.floor(Math.random() * 30) + 70,
        createdAt: new Date().toISOString().split('T')[0],
        assignedTo: tripType === 'international' ? 'Rajesh Kumar' : 'Neha Singh',
        notes: document.getElementById('leadNotes')?.value || '',
        packageType,
        tripType,
        travelerBreakdown,
        inclusionNotes: parseTextareaList(document.getElementById('leadInclusions')?.value),
        exclusionNotes: parseTextareaList(document.getElementById('leadExclusions')?.value)
    };
    
    state.leads.unshift(normalizeLead(newLead));
    closeModal('addLeadModal');
    renderLeadsTable();
    showToast('Lead Added', `${newLead.name} captured successfully`);
}

// ========== QUOTATIONS PAGE ==========
function renderQuotationsTable() {
    const tbody = document.getElementById('quotationsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = state.quotations.map(q => {
        const lead = state.leads.find(l => l.id === q.leadId);
        return `
            <tr>
                <td>#${q.id}</td>
                <td>${lead?.name || 'Unknown'}</td>
                <td>${lead?.destination || '-'}</td>
                <td>₹${q.amount.toLocaleString()}</td>
                <td>₹${q.total.toLocaleString()}</td>
                <td><span class="status-badge status-${q.status === 'sent' ? 'quotation' : q.status === 'negotiating' ? 'negotiation' : 'won'}">${q.status}</span></td>
                <td>${q.createdAt}</td>
                <td>
                    <button class="btn-outline" style="padding:4px 8px;" data-onclick="viewQuotation(${q.id})">View</button>
                    <button class="btn-outline" style="padding:4px 8px;" data-onclick="approveQuotation(${q.id})">Approve</button>
                </td>
            </tr>
        `;
    }).join('');
}

function approveQuotation(quoteId) {
    const quote = state.quotations.find(q => q.id === quoteId);
    if (quote) {
        quote.status = 'accepted';
        const lead = state.leads.find(l => l.id === quote.leadId);
        if (lead) lead.status = 'won';
        const incentive = calculateIncentive(quote.total, quote);
        
        // Create booking
        const newBooking = normalizeBooking({
            id: state.bookings.length + 2000,
            bookingRef: `SOL-BK-${String(state.bookings.length + 1).padStart(3,'0')}`,
            leadId: quote.leadId,
            quoteId: quote.id,
            totalAmount: quote.total,
            paidAmount: 0,
            paymentStatus: 'pending',
            paymentDate: null,
            travelDate: lead?.travelDate,
            status: 'pending',
            paymentMode: null,
            assignedTo: quote.assignedTo || lead?.assignedTo,
            packageType: quote.packageType,
            tripType: quote.tripType,
            incentiveRate: incentive.rate,
            incentiveAmount: incentive.amount
        });
        state.bookings.push(newBooking);
        state.itineraries = state.itineraries.filter(Boolean).concat(createItineraryFromBooking(newBooking));
        
        renderQuotationsTable();
        showToast('Quotation Approved', 'Proceed to collect payment');
    }
}

// ========== BOOKINGS PAGE ==========
function renderBookingsTable() {
    const tbody = document.getElementById('bookingsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = state.bookings.map(b => {
        const lead = state.leads.find(l => l.id === b.leadId);
        return `
            <tr>
                <td>${b.bookingRef}</td>
                <td>${lead?.name || 'Unknown'}</td>
                <td>${lead?.destination || '-'}</td>
                <td>₹${b.totalAmount.toLocaleString()}</td>
                <td>₹${b.paidAmount.toLocaleString()}</td>
                <td><span class="status-badge status-${b.paymentStatus === 'full' ? 'won' : b.paymentStatus === 'partial' ? 'partial' : 'new'}">${b.paymentStatus}</span></td>
                
                <td>${b.travelDate || '-'}</td>
                <td>
                    <button class="btn-primary" style="padding:4px 12px;" data-onclick="processPayment(${b.id})">Pay</button>
                </td>
            </tr>
        `;
    }).join('');
}

function processPayment(bookingId) {
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const lead = state.leads.find(l => l.id === booking.leadId);
    
    const modalHtml = `
        <div class="modal show" id="paymentModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Payment - ${lead?.name}</h3>
                    <button class="close-modal" data-onclick="closeModal('paymentModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div><strong>Total Amount:</strong> ₹${booking.totalAmount.toLocaleString()}</div>
                    <div><strong>Remaining:</strong> ₹${(booking.totalAmount - booking.paidAmount).toLocaleString()}</div>
                    <div class="form-group" style="margin-top:16px;">
                        <label>Payment Amount (₹)</label>
                        <input type="number" id="paymentAmount" class="form-control" value="${booking.totalAmount - booking.paidAmount}">
                    </div>
                    <div class="form-group">
                        <label>Payment Mode</label>
                        <select id="paymentMode" class="form-control">
                            <option value="UPI">UPI</option>
                            <option value="Card">Credit/Debit Card</option>
                            <option value="NetBanking">Net Banking</option>
                            <option value="Cash">Cash</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-outline" data-onclick="closeModal('paymentModal')">Cancel</button>
                    <button class="btn-primary" data-onclick="confirmPayment(${booking.id})">Confirm Payment</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function confirmPayment(bookingId) {
    const booking = state.bookings.find(b => b.id === bookingId);
    const paymentAmount = parseFloat(document.getElementById('paymentAmount')?.value);
    const paymentMode = document.getElementById('paymentMode')?.value;
    
    if (booking && paymentAmount) {
        booking.paidAmount += paymentAmount;
        booking.paymentStatus = booking.paidAmount >= booking.totalAmount ? 'full' : 'partial';
        booking.paymentDate = new Date().toISOString().split('T')[0];
        booking.paymentMode = paymentMode;
        booking.status = 'confirmed';
        
        closeModal('paymentModal');
        renderBookingsTable();
        showToast('Payment Received', `₹${paymentAmount.toLocaleString()} received successfully`);
    }
}

// ========== CAMPAIGNS PAGE ==========
function renderCampaigns() {
    const container = document.getElementById('campaignsContainer');
    if (!container) return;
    
    container.innerHTML = state.campaigns.map(c => `
        <div style="background:white; border-radius:16px; padding:20px;">
            <div style="display:flex; justify-content:space-between;">
                <div>
                    <h4>${c.name}</h4>
                    <p style="color:#64748b;">Trigger: ${c.trigger}</p>
                </div>
                <span class="status-badge status-${c.status === 'active' ? 'won' : 'new'}">${c.status}</span>
            </div>
            <div style="margin-top:15px;">
                <div>Sent: ${c.sent} | Opens: ${c.opens}</div>
                <div style="background:#e2e8f0; height:6px; border-radius:3px; margin-top:8px;">
                    <div style="background:#e94560; width:${c.opens ? (c.opens/c.sent)*100 : 0}%; height:6px; border-radius:3px;"></div>
                </div>
            </div>
            <button class="btn-primary" style="margin-top:15px; width:100%;" data-onclick="triggerCampaign(${c.id})">Trigger Now</button>
        </div>
    `).join('');
}

function triggerCampaign(id) {
    showToast('Campaign Triggered', 'Emails/WhatsApp messages are being sent');
}

// ========== SUPPORT PAGE ==========
function renderTickets() {
    const container = document.getElementById('ticketsContainer');
    if (!container) return;
    
    container.innerHTML = state.tickets.map(t => `
        <div style="background:white; border-radius:16px; padding:16px; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between;">
                <div>
                    <strong>${t.customer}</strong>
                    <p style="margin-top:5px;">${t.subject}</p>
                </div>
                <div style="text-align:right;">
                    <span class="status-badge status-${t.priority === 'high' ? 'negotiation' : 'new'}">${t.priority}</span>
                    <span class="status-badge status-${t.status === 'open' ? 'new' : 'won'}">${t.status}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ========== FEEDBACK PAGE ==========
function renderFeedback() {
    const container = document.getElementById('feedbackContainer');
    if (!container) return;
    
    const avgRating = state.feedbacks.reduce((sum, f) => sum + f.rating, 0) / (state.feedbacks.length || 1);
    
    container.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:30px;">
            <div class="stat-card"><div><h3>${avgRating.toFixed(1)}</h3><p>Average Rating</p></div></div>
            <div class="stat-card"><div><h3>${state.feedbacks.length}</h3><p>Total Reviews</p></div></div>
            <div class="stat-card"><div><h3>${state.feedbacks.reduce((s,f)=> s + f.points,0)}</h3><p>Points Issued</p></div></div>
        </div>
        ${state.feedbacks.map(f => `
            <div style="background:white; border-radius:16px; padding:20px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between;">
                    <div><strong>${f.customer}</strong><div style="color:#f59e0b;">${'⭐'.repeat(f.rating)}</div></div>
                    <span style="color:#10b981;">+${f.points} points</span>
                </div>
                <p style="margin-top:10px;">"${f.comment}"</p>
            </div>
        `).join('')}
    `;
}

// ========== REPORTS PAGE ==========
function renderReports() {
    const container = document.getElementById('reportsContainer');
    if (!container) return;
    
    // Source effectiveness
    const sourceCount = {};
    state.leads.forEach(l => { sourceCount[l.source] = (sourceCount[l.source] || 0) + 1; });
    
    // Agent performance
    const agentStats = {};
    state.leads.forEach(l => {
        if (l.assignedTo !== 'unassigned') {
            if (!agentStats[l.assignedTo]) agentStats[l.assignedTo] = { total: 0, won: 0 };
            agentStats[l.assignedTo].total++;
            if (l.status === 'won') agentStats[l.assignedTo].won++;
        }
    });
    
    const totalRevenue = state.bookings.reduce((s,b) => s + b.paidAmount, 0);
    const marketingCost = 150000;
    const roi = ((totalRevenue - marketingCost) / marketingCost) * 100;
    
    container.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:30px;">
            <div class="stat-card"><div><h3>${roi.toFixed(1)}%</h3><p>ROI</p></div></div>
            <div class="stat-card"><div><h3>₹${(totalRevenue/1000).toFixed(0)}K</h3><p>Total Revenue</p></div></div>
            <div class="stat-card"><div><h3>${state.leads.filter(l=>l.status==='won').length}/${state.leads.length}</h3><p>Won/Total</p></div></div>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
            <div style="background:white; border-radius:20px; padding:20px;">
                <h4>Lead Source Effectiveness</h4>
                ${Object.entries(sourceCount).map(([source, count]) => `
                    <div style="margin-top:15px;">
                        <div style="display:flex; justify-content:space-between;"><span>${source}</span><strong>${count}</strong></div>
                        <div style="background:#e2e8f0; height:6px; border-radius:3px; margin-top:5px;">
                            <div style="background:#e94560; width:${(count/state.leads.length)*100}%; height:6px; border-radius:3px;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="background:white; border-radius:20px; padding:20px;">
                <h4>Agent Performance</h4>
                <table style="width:100%;">
                    <tr><th>Agent</th><th>Leads</th><th>Won</th><th>Rate</th></tr>
                    ${Object.entries(agentStats).map(([agent, stats]) => `
                        <tr><td>${agent}</td><td>${stats.total}</td><td>${stats.won}</td><td>${((stats.won/stats.total)*100).toFixed(0)}%</td></tr>
                    `).join('')}
                </table>
            </div>
        </div>
    `;
}

// ========== UTILITY FUNCTIONS ==========
function getDateAfterDays(dateStr, days = 7) {
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal?.classList.contains('modal')) {
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    if (modal.classList.contains('modal')) {
        modal.classList.remove('show');
        if (modal.parentElement === document.body && !['newItineraryModal', 'addActivityModal', 'paymentModal', 'receiptModal', 'newBookingModal', 'newTicketModal', 'replyTicketModal', 'liveChatModal', 'newQuoteModal', 'negotiationModal', 'followupModal', 'addLeadModal'].includes(modalId)) {
            modal.remove();
        }
    }
}

function showToast(message, detail, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : type === 'warning' ? 'warning' : ''}`;
    toast.innerHTML = `
        <i class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : '!'}</i>
        <div><strong>${message}</strong><br><small>${detail}</small></div>
    `;
    
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function initializeEventListeners() {
    // Add lead form
    const addLeadForm = document.getElementById('addLeadForm');
    if (addLeadForm) {
        addLeadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addNewLead();
        });
    }
}

// Global functions for HTML onclick
window.viewLead = viewLead;
window.sendQuotation = sendQuotation;
window.deleteLead = deleteLead;
window.generateQuotation = generateQuotation;
window.viewQuotation = (id) => showToast('Quotation', `Viewing quotation #${id}`);
window.approveQuotation = approveQuotation;
window.processPayment = processPayment;
window.confirmPayment = confirmPayment;
window.triggerCampaign = triggerCampaign;
window.openModal = openModal;
window.closeModal = closeModal;
window.addNewLead = addNewLead;
window.state = state;
window.detectTripType = detectTripType;
window.normalizeLead = normalizeLead;
window.normalizeTravelerBreakdown = normalizeTravelerBreakdown;
window.getTravelerTotal = getTravelerTotal;
window.formatTravelerBreakdown = formatTravelerBreakdown;
window.parseTextareaList = parseTextareaList;
window.formatListForTextarea = formatListForTextarea;
window.calculateIncentive = calculateIncentive;
window.getIncentiveRate = getIncentiveRate;
window.createItineraryFromBooking = createItineraryFromBooking;
window.normalizeEmployee = normalizeEmployee;
