// Leads page specific JavaScript
let currentPage = 1;
let rowsPerPage = 10;
let filteredLeads = [];

function updateLeadStats() {
    if (typeof state !== 'undefined' && state.leads) {
        document.getElementById('totalLeadsCount').innerText = state.leads.length;
        document.getElementById('newLeadsCount').innerText = state.leads.filter(l => l.status === 'new').length;
        document.getElementById('qualifiedLeadsCount').innerText = state.leads.filter(l => l.status !== 'new' && l.status !== 'lost').length;
        const avgScore = state.leads.reduce((sum, l) => sum + l.score, 0) / state.leads.length;
        document.getElementById('avgLeadScore').innerText = avgScore.toFixed(0);
    }
}

function applyFilters() {
    if (!state.leads) return;
    const search = document.getElementById('searchLeads')?.value.toLowerCase() || '';
    const source = document.getElementById('filterSource')?.value || '';
    const status = document.getElementById('filterStatus')?.value || '';

    filteredLeads = state.leads.filter(lead => {
        const matchSearch = lead.name.toLowerCase().includes(search) ||
            lead.destination.toLowerCase().includes(search) ||
            lead.email.toLowerCase().includes(search);
        const matchSource = !source || lead.source === source;
        const matchStatus = !status || lead.status === status;
        return matchSearch && matchSource && matchStatus;
    });

    renderLeadsTablePage();
    updatePaginationInfo();
}

function renderLeadsTablePage() {
    const tbody = document.getElementById('leadsTableBody');
    if (!tbody) return;
    if (tbody.dataset.static === 'true') return;

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageLeads = filteredLeads.slice(start, end);

    if (pageLeads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">No leads found</td></tr>';
        return;
    }

    tbody.innerHTML = pageLeads.map(lead => `
        <tr>
            <td><input type="checkbox" class="lead-checkbox" data-id="${lead.id}"></td>
            <td>
                <strong>${escapeHtml(lead.name)}</strong><br>
                <small style="color:#64748b;" class="d-flex">${escapeHtml(lead.email)}</small>
                <small style="color:#64748b;" class="d-flex align-items-center">
                    ${escapeHtml(lead.phone)}
                    <button class="btn-outline lead-whatsapp-btn" data-onclick="shareWhatsApp()"><i class="fab fa-whatsapp"></i></button>
                </small>
            </td>
            <td>${escapeHtml(lead.source)}</td>
            <td>${escapeHtml(lead.destination)}</td>
            <td>₹${lead.budget.toLocaleString()}</td>
            <td>${lead.travelers}</td>
            <td><span class="status-badge status-${getStatusClass(lead.status)}">${lead.status.replace('_', ' ')}</span></td>
            <td>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="background: #e94560; color: white; border-radius: 20px; padding: 2px 8px; font-size: 11px; font-weight: bold;">${lead.score}</div>
                </div>
            </td>
            <td>${lead.assignedTo !== 'unassigned' ? escapeHtml(lead.assignedTo) : '<span style="color:#94a3b8;">Unassigned</span>'}</td>
            <td>
                <div class="table-actions">
                <button class="btn-outline btn-icon" data-onclick="viewLead(${lead.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-outline btn-accent btn-icon" data-onclick="sendQuotation(${lead.id})">
                    <i class="fas fa-file-invoice"></i>
                </button>
                <button class="btn-outline btn-danger-outline btn-icon" data-onclick="deleteLead(${lead.id})">
                    <i class="fas fa-trash"></i>
                </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updatePaginationInfo() {
    const total = filteredLeads.length;
    const start = (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, total);

    document.getElementById('showingStart').innerText = total > 0 ? start : 0;
    document.getElementById('showingEnd').innerText = end;
    document.getElementById('totalRecords').innerText = total;

    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = end >= total;
}

function getStatusClass(status) {
    const map = {
        new: 'new',
        contacted: 'contacted',
        interested: 'interested',
        quotation_sent: 'quotation',
        negotiation: 'negotiation',
        won: 'won',
        lost: 'lost'
    };
    return map[status] || 'new';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function openAddLeadModal() {
    const modal = document.getElementById('addLeadModal');
    if (modal) modal.classList.add('show');
}

function formatDisplayDate(value) {
    if (!value) return 'Pending';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDisplayDateTime(value, timeText) {
    const base = formatDisplayDate(value);
    return timeText ? `${base}, ${timeText}` : base;
}

function getLeadInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() || '')
        .join('') || 'LD';
}

function getLeadStatusLabel(status) {
    return String(status || 'new').replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function getLeadTemperature(score) {
    if (score >= 85) return 'Hot Lead';
    if (score >= 65) return 'Warm Lead';
    return 'Cold Lead';
}

function getLeadStageIndex(status) {
    const order = ['new', 'contacted', 'interested', 'quotation_sent', 'negotiation', 'won'];
    if (status === 'lost') return 4;
    const found = order.indexOf(status);
    return found === -1 ? 0 : found;
}

function getLeadPipelineSteps(lead) {
    const steps = [
        { key: 'new', title: 'Lead Captured', copy: `Enquiry captured from ${lead.source} and entered into CRM.` },
        { key: 'contacted', title: 'Qualification Call', copy: 'Lead owner validated travel dates, budget and traveller profile.' },
        { key: 'interested', title: 'Requirement Freeze', copy: 'Preferences, inclusions and package fitment finalized with the customer.' },
        { key: 'quotation_sent', title: 'Quotation Sent', copy: 'Commercial shared with itinerary, inclusions and payment terms.' },
        { key: 'negotiation', title: 'Negotiation & Follow-up', copy: 'Pricing, hotel choices and closing objections handled by sales.' },
        { key: 'won', title: lead.status === 'won' ? 'Booking Closed' : 'Booking Pending', copy: lead.status === 'won' ? 'Lead converted into a confirmed booking and payment tracked.' : 'Waiting for client confirmation or final approval.' }
    ];

    const activeIndex = getLeadStageIndex(lead.status);
    return steps.map((step, index) => ({
        ...step,
        state: lead.status === 'lost'
            ? (index <= activeIndex ? 'completed' : 'upcoming')
            : index < activeIndex ? 'completed' : index === activeIndex ? 'current' : 'upcoming'
    }));
}

function getLeadJourneyContext(lead) {
    const quote = state.quotations.find(item => item.leadId === lead.id) || null;
    const booking = state.bookings.find(item => item.leadId === lead.id) || null;
    const payment = booking ? state.transactions.find(item => item.bookingId === booking.id) || null : null;
    const itinerary = booking ? state.itineraries.find(item => item.bookingId === booking.id) || null : null;
    const supportTicket = state.tickets.find(item => item.customer === lead.name) || null;
    const feedback = state.feedbacks.find(item => item.customer === lead.name) || null;
    return { quote, booking, payment, itinerary, supportTicket, feedback };
}

const customerProfileMemory = {
    1001: {
        customerType: 'existing',
        loyaltyTier: 'Silver',
        relationshipManager: 'Neha Singh',
        customerSince: '2022-09-14',
        preferredStyle: 'Family leisure with resort stay and smooth transfers',
        preferredDestinations: ['Goa', 'Kerala', 'Andaman'],
        preferredHotelCategory: '4 Star',
        serviceFlags: ['Prefers early check-in support', 'Usually books with breakfast + airport transfer'],
        paymentBehaviour: 'Pays advance quickly, balance after final trip confirmation',
        decisionMaker: 'Amit Sharma',
        lastTripFeedback: 'Asked for a cleaner beach-facing property on the next holiday.',
        pastTrips: [
            { destination: 'Kerala', sector: 'Munnar + Alleppey', bookedOn: '2023-11-03', travelDate: '2023-12-18', nights: 4, days: 5, pax: '2 Adult, 1 Child', amount: 48200, status: 'completed', bookingRef: 'SOL-BK-143', highlights: 'Houseboat night and private cab' },
            { destination: 'Jaipur', sector: 'Weekend family break', bookedOn: '2023-02-07', travelDate: '2023-03-12', nights: 2, days: 3, pax: '2 Adult, 1 Child', amount: 26800, status: 'completed', bookingRef: 'SOL-BK-087', highlights: 'Heritage hotel and local sightseeing' }
        ]
    },
    1002: {
        customerType: 'new',
        loyaltyTier: 'Prospect',
        relationshipManager: 'Neha Singh',
        customerSince: '2024-02-09',
        preferredStyle: 'Couple-focused premium stay with privacy and scenic views',
        preferredDestinations: ['Manali', 'Kashmir'],
        preferredHotelCategory: '4 Star',
        serviceFlags: ['Late checkout important', 'Wants snowfall chances if possible'],
        paymentBehaviour: 'First booking, likely to compare 2-3 quotes before confirming',
        decisionMaker: 'Priya Verma',
        lastTripFeedback: 'No prior trip history in CRM.',
        pastTrips: []
    },
    1003: {
        customerType: 'existing',
        loyaltyTier: 'Gold',
        relationshipManager: 'Amit Patel',
        customerSince: '2021-06-21',
        preferredStyle: 'Premium domestic breaks with experiential activities',
        preferredDestinations: ['Kerala', 'Coorg', 'Sikkim'],
        preferredHotelCategory: 'Premium Boutique',
        serviceFlags: ['Needs child-friendly sightseeing pace', 'Prefers private vehicle all days'],
        paymentBehaviour: 'Confirms after spouse review, but once agreed closes fast',
        decisionMaker: 'Rahul Mehta',
        lastTripFeedback: 'Loved the plantation stay but wants better lake-view room allocation next time.',
        pastTrips: [
            { destination: 'Coorg', sector: 'Nature retreat', bookedOn: '2023-08-11', travelDate: '2023-09-06', nights: 3, days: 4, pax: '2 Adult, 1 Young', amount: 56600, status: 'completed', bookingRef: 'SOL-BK-132', highlights: 'Plantation resort and private sightseeing' },
            { destination: 'Sikkim', sector: 'Gangtok getaway', bookedOn: '2022-10-04', travelDate: '2022-11-14', nights: 4, days: 5, pax: '2 Adult', amount: 62400, status: 'completed', bookingRef: 'SOL-BK-076', highlights: 'Mountain hotel and permits handled' }
        ]
    },
    1004: {
        customerType: 'existing',
        loyaltyTier: 'Silver',
        relationshipManager: 'Neha Singh',
        customerSince: '2023-01-18',
        preferredStyle: 'Family heritage circuits with comfortable pacing',
        preferredDestinations: ['Rajasthan', 'Gujarat', 'Madhya Pradesh'],
        preferredHotelCategory: 'Deluxe',
        serviceFlags: ['Needs interconnecting rooms', 'Senior citizen comfort matters'],
        paymentBehaviour: 'Wants detailed inclusions before advance',
        decisionMaker: 'Sneha Reddy and spouse',
        lastTripFeedback: 'Wanted stronger cab coordination on the final day.',
        pastTrips: [
            { destination: 'Udaipur', sector: 'Lakes and palaces', bookedOn: '2023-10-02', travelDate: '2023-10-29', nights: 3, days: 4, pax: '2 Adult, 2 Child', amount: 51800, status: 'completed', bookingRef: 'SOL-BK-149', highlights: 'Boat ride and private SUV' }
        ]
    },
    1005: {
        customerType: 'existing',
        loyaltyTier: 'Gold',
        relationshipManager: 'Rajesh Kumar',
        customerSince: '2022-02-17',
        preferredStyle: 'Activity-led premium beach vacations',
        preferredDestinations: ['Andaman', 'Maldives', 'Thailand'],
        preferredHotelCategory: '5 Star / Premium Resort',
        serviceFlags: ['Scuba and water sports upsell works well', 'Needs seamless airport-hotel coordination'],
        paymentBehaviour: 'Negotiates hard but usually closes if value-adds are included',
        decisionMaker: 'Vikram Singh',
        lastTripFeedback: 'Was happy with resort, but wants better ferry timing on island routes.',
        pastTrips: [
            { destination: 'Thailand', sector: 'Phuket + Krabi', bookedOn: '2023-04-06', travelDate: '2023-05-20', nights: 5, days: 6, pax: '2 Adult', amount: 118500, status: 'completed', bookingRef: 'SOL-BK-111', highlights: 'Island tour and 4 star beach resort' },
            { destination: 'Goa', sector: 'Luxury beach break', bookedOn: '2022-11-10', travelDate: '2022-12-02', nights: 3, days: 4, pax: '2 Adult', amount: 43800, status: 'completed', bookingRef: 'SOL-BK-082', highlights: 'Sunset cruise and candlelight dinner' }
        ]
    },
    1006: {
        customerType: 'existing',
        loyaltyTier: 'Gold',
        relationshipManager: 'Amit Patel',
        customerSince: '2023-03-10',
        preferredStyle: 'Premium family trips with strong service assurance',
        preferredDestinations: ['Kashmir', 'Himachal'],
        preferredHotelCategory: 'Premium',
        serviceFlags: ['Priority on meals and room heating', 'Wants one point of contact'],
        paymentBehaviour: 'Reliable full payer',
        decisionMaker: 'Anjali Nair',
        lastTripFeedback: 'Highly satisfied and open to repeat travel.',
        pastTrips: [
            { destination: 'Shimla', sector: 'Summer family trip', bookedOn: '2023-05-08', travelDate: '2023-06-12', nights: 4, days: 5, pax: '2 Adult, 1 Child', amount: 54100, status: 'completed', bookingRef: 'SOL-BK-120', highlights: 'Mall road hotel and toy train experience' }
        ]
    },
    1007: {
        customerType: 'new',
        loyaltyTier: 'Prospect',
        relationshipManager: 'Rajesh Kumar',
        customerSince: '2024-02-10',
        preferredStyle: 'International leisure with visa guidance and nightlife options',
        preferredDestinations: ['Thailand', 'Singapore', 'Bali'],
        preferredHotelCategory: 'Deluxe',
        serviceFlags: ['Needs visa and forex clarity', 'Interested in nightlife + island excursion'],
        paymentBehaviour: 'Likely to benchmark online portals first',
        decisionMaker: 'Deepak Joshi',
        lastTripFeedback: 'No prior trip history in CRM.',
        pastTrips: []
    },
    1008: {
        customerType: 'existing',
        loyaltyTier: 'Silver',
        relationshipManager: 'Neha Singh',
        customerSince: '2022-07-05',
        preferredStyle: 'Family international departures with strong budgeting',
        preferredDestinations: ['Singapore', 'Dubai'],
        preferredHotelCategory: '4 Star',
        serviceFlags: ['Budget sensitive', 'Needs infant-friendly planning'],
        paymentBehaviour: 'High comparison shopping, low urgency response',
        decisionMaker: 'Kavita Sharma',
        lastTripFeedback: 'Service liked, but price sensitivity remains high.',
        pastTrips: [
            { destination: 'Dubai', sector: 'Family holiday', bookedOn: '2023-01-13', travelDate: '2023-02-21', nights: 4, days: 5, pax: '2 Adult, 1 Child, 1 Infant', amount: 132000, status: 'completed', bookingRef: 'SOL-BK-091', highlights: 'City tour and marina cruise' }
        ]
    }
};

function getLeadOwnerName(lead, fallback = 'Sales Desk') {
    return lead.assignedTo && lead.assignedTo !== 'unassigned' ? lead.assignedTo : fallback;
}

function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function getDaysUntil(dateValue) {
    if (!dateValue) return null;
    const current = new Date();
    const target = new Date(dateValue);
    if (Number.isNaN(target.getTime())) return null;
    current.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.round((target - current) / 86400000);
}

function getLeadServiceWindow(lead, quote) {
    const days = getDaysUntil(lead.travelDate);
    if (days === null) return 'Travel window yet to be frozen';
    if (days < 0) return `Past dated by ${Math.abs(days)} days - needs date refresh`;
    if (days === 0) return 'Travel starts today';
    if (days <= 7) return `${days} days to travel - urgent closure window`;
    if (days <= 21) return `${days} days to travel - warm follow-up window`;
    if (quote) return `${days} days to travel - proposal nurturing stage`;
    return `${days} days to travel - qualification stage`;
}

function getLeadCurrentPriority(lead, context) {
    if (lead.status === 'won') return 'Ops handover and service delivery';
    if (lead.status === 'lost') return 'Win-back or closure audit';
    if (lead.status === 'negotiation') return 'Decision maker closure and commercial lock';
    if (lead.status === 'quotation_sent') return 'Proposal review and objection handling';
    if (context.quote) return 'Quote follow-up';
    return 'Qualification and trip shaping';
}

function getLeadRiskSummary(lead) {
    if (lead.status === 'lost') return 'Lead went cold due to pricing pressure and delayed response.';
    if (lead.tripType === 'international') return 'Passport/visa, forex and travel insurance may influence decision timing.';
    if (lead.score >= 90) return 'High-potential lead. Delay in follow-up can cost a near-term conversion.';
    if (lead.budget < 50000) return 'Budget-fit and expectation-setting need tight handling.';
    return 'Main risk is slow follow-up or weak personalization against destination intent.';
}

function getLeadStageSla(lead) {
    if (lead.status === 'new') return 'First call within 15 minutes, detailed qualification same day.';
    if (lead.status === 'contacted') return 'Need requirement freeze and itinerary direction within 24 hours.';
    if (lead.status === 'interested') return 'Quote should go out within 1 working day.';
    if (lead.status === 'quotation_sent') return 'Review call due within 24 hours of quotation send.';
    if (lead.status === 'negotiation') return 'Daily touchpoint until yes/no decision.';
    if (lead.status === 'won') return 'Ops welcome call and document checklist within 4 working hours.';
    return 'Record closure reason and schedule reactivation cadence.';
}

function buildCurrentTripPlan(lead, context) {
    const quote = context.quote;
    const nights = quote?.nights || Math.max(1, Math.round((lead.travelers || 2) / 2) + 2);
    const days = quote?.days || nights + 1;
    const budgetBand = lead.budget >= 120000 ? 'Premium spend bracket' : lead.budget >= 70000 ? 'Mid-high value bracket' : 'Value-conscious bracket';
    const hotelCategory = quote?.packageType === 'premium' ? '5 Star / Premium Resort' : lead.preferredHotelCategory || (lead.packageType === 'premium' ? '5 Star' : lead.packageType === 'deluxe' ? '4 Star' : '3 Star');
    const idealRouting = lead.tripType === 'international'
        ? `${lead.destination} arrival + city exploration + 1 activity day + shopping / free day`
        : `${lead.destination} arrival + sightseeing + experience day + departure`;

    return {
        travelWindow: formatDisplayDateTime(lead.travelDate, null),
        serviceWindow: getLeadServiceWindow(lead, quote),
        duration: `${days} Days / ${nights} Nights`,
        hotelCategory,
        budgetBand,
        idealRouting,
        travelerProfile: formatTravelerBreakdown(quote?.travelerBreakdown || lead.travelerBreakdown),
        packageType: getLeadStatusLabel(quote?.packageType || lead.packageType),
        tripType: getLeadStatusLabel(lead.tripType),
        currentPriority: getLeadCurrentPriority(lead, context),
        riskSummary: getLeadRiskSummary(lead),
        stageSla: getLeadStageSla(lead)
    };
}

function getCustomerRelationshipData(lead, context) {
    const memory = customerProfileMemory[lead.id] || {
        customerType: context.booking ? 'existing' : 'new',
        loyaltyTier: context.booking ? 'Silver' : 'Prospect',
        relationshipManager: getLeadOwnerName(lead),
        customerSince: lead.createdAt,
        preferredStyle: 'Travel preference profile still being built by sales.',
        preferredDestinations: [lead.destination],
        preferredHotelCategory: lead.preferredHotelCategory || 'To be qualified',
        serviceFlags: [],
        paymentBehaviour: 'Payment confidence to be established after qualification.',
        decisionMaker: lead.name,
        lastTripFeedback: 'No historical feedback in CRM.',
        pastTrips: []
    };

    const bookingTrips = state.bookings
        .filter(item => item.leadId === lead.id)
        .map(item => {
            const quote = state.quotations.find(q => q.id === item.quoteId) || {};
            return {
                destination: lead.destination,
                sector: quote.itinerary || `${lead.destination} tour`,
                bookedOn: item.paymentDate || lead.createdAt,
                travelDate: item.travelDate,
                nights: quote.nights || 4,
                days: quote.days || 5,
                pax: formatTravelerBreakdown(quote.travelerBreakdown || lead.travelerBreakdown),
                amount: item.totalAmount,
                status: item.status || 'confirmed',
                bookingRef: item.bookingRef,
                highlights: quote.inclusions?.slice(0, 2).join(' + ') || 'Confirmed package'
            };
        });

    const pastTrips = [...memory.pastTrips, ...bookingTrips].sort((a, b) => new Date(b.travelDate || b.bookedOn) - new Date(a.travelDate || a.bookedOn));
    const lifetimeRevenue = pastTrips.reduce((sum, trip) => sum + Number(trip.amount || 0), 0) + Number(context.booking?.totalAmount || 0);
    const completedTrips = pastTrips.filter(trip => trip.status !== 'cancelled').length;
    const isExistingCustomer = memory.customerType === 'existing' || completedTrips > 0;

    return {
        ...memory,
        customerType: isExistingCustomer ? 'existing' : 'new',
        pastTrips,
        completedTrips,
        lifetimeRevenue,
        lastTripDate: pastTrips[0]?.travelDate || null,
        avgTicketSize: completedTrips ? Math.round(lifetimeRevenue / completedTrips) : 0
    };
}

function buildLeadCustomerInsights(lead, context) {
    const relationship = getCustomerRelationshipData(lead, context);
    const tripPlan = buildCurrentTripPlan(lead, context);
    return {
        relationship,
        tripPlan,
        nextAction: lead.status === 'won'
            ? 'Ops team should confirm hotel, transfer and traveler documents today.'
            : lead.status === 'lost'
                ? 'Tag for reactivation once a sharper value offer or alternate destination is available.'
                : lead.status === 'negotiation'
                    ? 'Schedule a decision-maker call with revised commercial and a firm expiry.'
                    : lead.status === 'quotation_sent'
                        ? 'Walk the customer through each inclusion and create urgency around the travel window.'
                        : 'Deepen qualification, understand blockers and shape itinerary before competition steps in.',
        decisionReadiness: lead.score >= 90 ? 'High' : lead.score >= 75 ? 'Medium' : 'Low'
    };
}

function getSyntheticFollowUps(lead, quote, booking) {
    const owner = lead.assignedTo !== 'unassigned' ? lead.assignedTo : 'Auto assignment queue';
    const events = [
        {
            date: lead.createdAt,
            time: '10:05 AM',
            type: 'Lead Created',
            title: 'Lead auto-captured in CRM',
            icon: 'fa-bullseye',
            owner,
            channel: lead.source,
            outcome: `${lead.source} enquiry synced with destination ${lead.destination}.`,
            notes: `Initial requirement captured for ${lead.travelers} travellers with target budget ₹${lead.budget.toLocaleString()}.`
        }
    ];

    if (getLeadStageIndex(lead.status) >= 1) {
        events.push({
            date: getDateAfterDays(lead.createdAt, 1),
            time: '11:30 AM',
            type: 'Follow-up',
            title: 'Discovery call completed',
            icon: 'fa-phone-volume',
            owner,
            channel: 'Phone Call',
            outcome: 'Traveller profile, preferred hotels and date flexibility confirmed.',
            notes: lead.notes || 'Customer asked for practical routing and value-for-money options.'
        });
    }

    if (getLeadStageIndex(lead.status) >= 2) {
        events.push({
            date: getDateAfterDays(lead.createdAt, 2),
            time: '04:15 PM',
            type: 'Follow-up',
            title: 'Requirement summary sent on WhatsApp',
            icon: 'fa-comments',
            owner,
            channel: 'WhatsApp',
            outcome: 'Customer acknowledged inclusions and shortlist shared by sales.',
            notes: `Package leaning toward ${lead.packageType} with ${lead.tripType} travel plan.`
        });
    }

    if (quote) {
        events.push({
            date: quote.createdAt,
            time: '06:10 PM',
            type: 'Quotation',
            title: `Quotation v${quote.version} shared`,
            icon: 'fa-file-invoice-dollar',
            owner: quote.assignedTo || owner,
            channel: 'Email + PDF',
            outcome: `Quote total ₹${Number(quote.total || 0).toLocaleString()} valid till ${formatDisplayDate(quote.validUntil)}.`,
            notes: `${quote.itinerary} with ${formatTravelerBreakdown(quote.travelerBreakdown)}.`
        });
    }

    if (lead.status === 'negotiation' || lead.status === 'won' || lead.status === 'lost') {
        events.push({
            date: getDateAfterDays(quote?.createdAt || lead.createdAt, 1),
            time: '12:45 PM',
            type: 'Negotiation',
            title: 'Commercial discussion recorded',
            icon: 'fa-handshake',
            owner,
            channel: 'Phone + WhatsApp',
            outcome: lead.status === 'lost' ? 'Lead stalled due to pricing mismatch and response delay.' : 'Hotels, transfers and final selling price revised after client objections.',
            notes: lead.status === 'won' ? 'Decision maker requested final hold and payment link.' : 'Sales pushed urgency and highlighted limited inventory.'
        });
    }

    if (booking) {
        events.push({
            date: booking.paymentDate || getDateAfterDays(quote?.createdAt || lead.createdAt, 2),
            time: '03:20 PM',
            type: 'Booking',
            title: `Booking ${booking.bookingRef} confirmed`,
            icon: 'fa-ticket-alt',
            owner: booking.assignedTo || owner,
            channel: 'CRM Booking Desk',
            outcome: `Payment status ${booking.paymentStatus} with total booking value ₹${Number(booking.totalAmount || 0).toLocaleString()}.`,
            notes: `Travel locked for ${formatDisplayDate(booking.travelDate)} and ops handoff initiated.`
        });
    }

    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function buildLeadTimeline(lead) {
    const context = getLeadJourneyContext(lead);
    const events = getSyntheticFollowUps(lead, context.quote, context.booking);

    if (context.payment) {
        events.push({
            date: context.payment.date,
            time: '04:05 PM',
            type: 'Payment',
            title: 'Advance/payment reconciled',
            icon: 'fa-wallet',
            owner: 'Accounts Desk',
            channel: context.payment.mode,
            outcome: `Received ₹${Number(context.payment.amount || 0).toLocaleString()} via ${context.payment.mode}.`,
            notes: `Transaction reference ${context.payment.transactionId || 'Pending'}.`
        });
    }

    if (context.supportTicket) {
        events.push({
            date: context.supportTicket.createdAt,
            time: '08:55 PM',
            type: 'Support',
            title: 'During-travel support case opened',
            icon: 'fa-headset',
            owner: context.supportTicket.assignedTo,
            channel: 'Support Desk',
            outcome: `${context.supportTicket.subject} logged with ${context.supportTicket.priority} priority.`,
            notes: `Ticket status is ${context.supportTicket.status}.`
        });
    }

    if (context.feedback) {
        events.push({
            date: context.feedback.date,
            time: '07:30 PM',
            type: 'Post Travel',
            title: 'Feedback captured',
            icon: 'fa-star',
            owner: 'Retention Team',
            channel: 'Review Collection',
            outcome: `${context.feedback.rating}/5 rating received from customer.`,
            notes: context.feedback.comment
        });
    }

    if (lead.status !== 'won' && lead.status !== 'lost') {
        events.push({
            date: getDateAfterDays(events[events.length - 1]?.date || lead.createdAt, 1),
            time: '09:30 AM',
            type: 'Next Action',
            title: 'Planned next touchpoint',
            icon: 'fa-calendar-check',
            owner: lead.assignedTo !== 'unassigned' ? lead.assignedTo : 'Sales queue',
            channel: 'Scheduled',
            outcome: lead.status === 'quotation_sent'
                ? 'Quotation review follow-up due with decision maker.'
                : lead.status === 'negotiation'
                    ? 'Close final objections and secure payment confirmation.'
                    : 'Push lead toward proposal-ready stage.',
            notes: 'System reminder generated so no enquiry stays idle beyond SLA.'
        });
    }

    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function renderLeadOverviewTab(lead, context, insights) {
    const relationship = insights.relationship;
    const tripPlan = insights.tripPlan;
    return `
        <div class="lead-tab-pane tab-pane fade show active" id="lead-overview-pane" role="tabpanel" aria-labelledby="lead-overview-tab">
            <div class="lead-grid-2">
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Customer Snapshot</h6>
                        <span class="lead-pill"><i class="fas fa-user-check"></i> ${relationship.customerType === 'existing' ? 'Existing Customer' : 'New Customer'}</span>
                    </div>
                    <div class="lead-info-list">
                        <div class="lead-info-item"><span class="label">Email</span><span class="value">${escapeHtml(lead.email)}</span></div>
                        <div class="lead-info-item"><span class="label">Phone</span><span class="value">${escapeHtml(lead.phone)}</span></div>
                        <div class="lead-info-item"><span class="label">Customer Since</span><span class="value">${formatDisplayDate(relationship.customerSince)}</span></div>
                        <div class="lead-info-item"><span class="label">Loyalty Tier</span><span class="value">${escapeHtml(relationship.loyaltyTier)}</span></div>
                        <div class="lead-info-item"><span class="label">Relationship Owner</span><span class="value">${escapeHtml(relationship.relationshipManager)}</span></div>
                        <div class="lead-info-item"><span class="label">Decision Maker</span><span class="value">${escapeHtml(relationship.decisionMaker)}</span></div>
                        <div class="lead-info-item"><span class="label">Completed Tours</span><span class="value">${relationship.completedTrips}</span></div>
                        <div class="lead-info-item"><span class="label">Lifetime Revenue</span><span class="value">${formatCurrency(relationship.lifetimeRevenue)}</span></div>
                        <div class="lead-info-item"><span class="label">Average Ticket Size</span><span class="value">${relationship.avgTicketSize ? formatCurrency(relationship.avgTicketSize) : 'Pending'}</span></div>
                        <div class="lead-info-item"><span class="label">Last Tour</span><span class="value">${relationship.lastTripDate ? formatDisplayDate(relationship.lastTripDate) : 'No prior tour'}</span></div>
                    </div>
                </div>
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Current Opportunity Health</h6>
                        <span class="status-badge status-${getStatusClass(lead.status)}">${escapeHtml(getLeadStatusLabel(lead.status))}</span>
                    </div>
                    <div class="lead-list-card">
                        <div class="lead-list-item">
                            <i class="fas fa-circle-check"></i>
                            <div>
                                <strong>Customer intent</strong>
                                <div class="muted-13">${escapeHtml(getLeadTemperature(lead.score))} with ${escapeHtml(insights.decisionReadiness)} decision readiness based on score, source and prior relationship.</div>
                            </div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-suitcase-rolling"></i>
                            <div>
                                <strong>Requirement notes</strong>
                                <div class="muted-13">${escapeHtml(lead.notes || 'Detailed notes are still being captured by the sales owner.')}</div>
                            </div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-layer-group"></i>
                            <div>
                                <strong>Current sales priority</strong>
                                <div class="muted-13">${escapeHtml(tripPlan.currentPriority)}. ${escapeHtml(tripPlan.serviceWindow)}.</div>
                            </div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-clipboard-list"></i>
                            <div>
                                <strong>Stage SLA</strong>
                                <div class="muted-13">${escapeHtml(tripPlan.stageSla)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="lead-grid-2 mt-16">
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Customer Preferences</h6>
                    </div>
                    <div class="lead-list-card">
                        <div class="lead-list-item">
                            <i class="fas fa-heart"></i>
                            <div>
                                <strong>Travel style</strong>
                                <div class="muted-13">${escapeHtml(relationship.preferredStyle)}</div>
                            </div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-hotel"></i>
                            <div>
                                <strong>Preferred hotel category</strong>
                                <div class="muted-13">${escapeHtml(relationship.preferredHotelCategory)}</div>
                            </div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-location-dot"></i>
                            <div>
                                <strong>Preferred destinations</strong>
                                <div class="muted-13">${escapeHtml(relationship.preferredDestinations.join(', '))}</div>
                            </div>
                        </div>
                        ${(relationship.serviceFlags.length ? relationship.serviceFlags : ['Preference profile is still being built.']).map(item => `
                            <div class="lead-list-item">
                                <i class="fas fa-check"></i>
                                <div class="muted-13">${escapeHtml(item)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Service Risks & Notes</h6>
                    </div>
                    <div class="lead-list-card">
                        <div class="lead-list-item">
                            <i class="fas fa-wallet"></i>
                            <div>
                                <strong>Payment behavior</strong>
                                <div class="muted-13">${escapeHtml(relationship.paymentBehaviour)}</div>
                            </div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-shield-halved"></i>
                            <div>
                                <strong>Current risk summary</strong>
                                <div class="muted-13">${escapeHtml(tripPlan.riskSummary)}</div>
                            </div>
                        </div>
                        ${(lead.exclusionNotes.length ? lead.exclusionNotes : ['Lunch, personal expenses and optional activities not yet included.']).map(item => `
                            <div class="lead-list-item">
                                <i class="fas fa-triangle-exclamation"></i>
                                <div class="muted-13">${escapeHtml(item)}</div>
                            </div>
                        `).join('')}
                        <div class="lead-alert">${escapeHtml(relationship.lastTripFeedback)}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderLeadCustomerTab(lead, context, insights) {
    const relationship = insights.relationship;
    const trips = relationship.pastTrips;

    return `
        <div class="lead-tab-pane tab-pane fade" id="lead-customer-pane" role="tabpanel" aria-labelledby="lead-customer-tab">
            <div class="lead-grid-2">
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Customer Relationship Memory</h6>
                        <span class="lead-pill"><i class="fas fa-repeat"></i> ${relationship.customerType === 'existing' ? 'Repeat traveller' : 'Fresh enquiry'}</span>
                    </div>
                    <div class="lead-insight-strip">
                        <div class="lead-insight-tile">
                            <span class="label">Customer Type</span>
                            <strong>${relationship.customerType === 'existing' ? 'Existing customer' : 'New customer'}</strong>
                        </div>
                        <div class="lead-insight-tile">
                            <span class="label">Lifetime Revenue</span>
                            <strong>${formatCurrency(relationship.lifetimeRevenue)}</strong>
                        </div>
                        <div class="lead-insight-tile">
                            <span class="label">Tours Taken</span>
                            <strong>${relationship.completedTrips}</strong>
                        </div>
                    </div>
                    <div class="lead-list-card mt-16">
                        <div class="lead-list-item">
                            <i class="fas fa-user-tie"></i>
                            <div>
                                <strong>Decision maker</strong>
                                <div class="muted-13">${escapeHtml(relationship.decisionMaker)}</div>
                            </div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-people-group"></i>
                            <div>
                                <strong>Relationship owner</strong>
                                <div class="muted-13">${escapeHtml(relationship.relationshipManager)}</div>
                            </div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-comments-dollar"></i>
                            <div>
                                <strong>Payment pattern</strong>
                                <div class="muted-13">${escapeHtml(relationship.paymentBehaviour)}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Past Booking History</h6>
                        <span class="lead-pill"><i class="fas fa-suitcase"></i> ${trips.length} trip records</span>
                    </div>
                    ${trips.length ? `
                        <div class="lead-history-list">
                            ${trips.map(trip => `
                                <article class="lead-history-card">
                                    <div class="lead-history-head">
                                        <div>
                                            <h6>${escapeHtml(trip.destination)}</h6>
                                            <p>${escapeHtml(trip.sector)} • ${trip.days}D/${trip.nights}N</p>
                                        </div>
                                        <span class="status-badge status-won">${escapeHtml(getLeadStatusLabel(trip.status))}</span>
                                    </div>
                                    <div class="lead-meta-chips">
                                        <span class="lead-meta-chip"><i class="fas fa-calendar"></i> Travel: ${formatDisplayDate(trip.travelDate)}</span>
                                        <span class="lead-meta-chip"><i class="fas fa-wallet"></i> ${formatCurrency(trip.amount)}</span>
                                        <span class="lead-meta-chip"><i class="fas fa-users"></i> ${escapeHtml(trip.pax)}</span>
                                        <span class="lead-meta-chip"><i class="fas fa-hashtag"></i> ${escapeHtml(trip.bookingRef)}</span>
                                    </div>
                                    <div class="lead-alert mt-16">${escapeHtml(trip.highlights)}</div>
                                </article>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="lead-empty-state">
                            <i class="fas fa-user-plus"></i>
                            <strong>No historical tour in CRM</strong>
                            <p>This is a new customer enquiry. Current lead will establish first-trip baseline, budget pattern and preference memory.</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

function renderLeadTripPlanTab(lead, context, insights) {
    const tripPlan = insights.tripPlan;
    const quote = context.quote;
    const booking = context.booking;

    return `
        <div class="lead-tab-pane tab-pane fade" id="lead-trip-pane" role="tabpanel" aria-labelledby="lead-trip-tab">
            <div class="lead-grid-2">
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Current Trip Requirement</h6>
                        <span class="lead-pill"><i class="fas fa-map"></i> ${escapeHtml(lead.destination)}</span>
                    </div>
                    <div class="lead-info-list">
                        <div class="lead-info-item"><span class="label">Destination</span><span class="value">${escapeHtml(lead.destination)}</span></div>
                        <div class="lead-info-item"><span class="label">Travel Start</span><span class="value">${formatDisplayDate(lead.travelDate)}</span></div>
                        <div class="lead-info-item"><span class="label">Trip Type</span><span class="value">${escapeHtml(tripPlan.tripType)}</span></div>
                        <div class="lead-info-item"><span class="label">Package Level</span><span class="value">${escapeHtml(tripPlan.packageType)}</span></div>
                        <div class="lead-info-item"><span class="label">Duration</span><span class="value">${escapeHtml(tripPlan.duration)}</span></div>
                        <div class="lead-info-item"><span class="label">Pax Detail</span><span class="value">${escapeHtml(tripPlan.travelerProfile)}</span></div>
                        <div class="lead-info-item"><span class="label">Lead Budget</span><span class="value">${formatCurrency(lead.budget)}</span></div>
                        <div class="lead-info-item"><span class="label">Hotel Category</span><span class="value">${escapeHtml(tripPlan.hotelCategory)}</span></div>
                    </div>
                    <div class="lead-alert mt-16">${escapeHtml(tripPlan.idealRouting)}</div>
                </div>
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Plan Readiness</h6>
                    </div>
                    <div class="lead-list-card">
                        <div class="lead-list-item">
                            <i class="fas fa-hourglass-half"></i>
                            <div>
                                <strong>Travel window</strong>
                                <div class="muted-13">${escapeHtml(tripPlan.serviceWindow)}</div>
                            </div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-bullseye"></i>
                            <div>
                                <strong>Current priority</strong>
                                <div class="muted-13">${escapeHtml(tripPlan.currentPriority)}</div>
                            </div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-file-signature"></i>
                            <div>
                                <strong>Quotation status</strong>
                                <div class="muted-13">${quote ? `v${quote.version} shared for ${formatCurrency(quote.total)} and valid till ${formatDisplayDate(quote.validUntil)}.` : 'No quote issued yet. Requirement shaping still active.'}</div>
                            </div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-plane-departure"></i>
                            <div>
                                <strong>Booking / ops status</strong>
                                <div class="muted-13">${booking ? `${booking.bookingRef} created with ${escapeHtml(getLeadStatusLabel(booking.status))} status.` : 'No booking created yet. Still pre-confirmation.'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="lead-grid-2 mt-16">
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Included in Current Ask</h6>
                    </div>
                    <div class="lead-list-card">
                        ${(lead.inclusionNotes.length ? lead.inclusionNotes : ['Hotel, transfers and sightseeing to be finalized during costing.']).map(item => `
                            <div class="lead-list-item">
                                <i class="fas fa-check"></i>
                                <div class="muted-13">${escapeHtml(item)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Open Questions / Exclusions</h6>
                    </div>
                    <div class="lead-list-card">
                        ${(lead.exclusionNotes.length ? lead.exclusionNotes : ['Meals, optional activities and personal spends not locked yet.']).map(item => `
                            <div class="lead-list-item">
                                <i class="fas fa-circle-question"></i>
                                <div class="muted-13">${escapeHtml(item)}</div>
                            </div>
                        `).join('')}
                        <div class="lead-alert">${escapeHtml(insights.nextAction)}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderLeadJourneyTab(lead) {
    const timeline = buildLeadTimeline(lead);
    const pipeline = getLeadPipelineSteps(lead);
    return `
        <div class="lead-tab-pane tab-pane fade" id="lead-journey-pane" role="tabpanel" aria-labelledby="lead-journey-tab">
            <div class="lead-grid-2">
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Journey Timeline</h6>
               <span class="lead-pill"><i class="fas fa-clock"></i> ${timeline.length} logged touchpoints</span>
                    </div>
                    <div class="lead-timeline">
                        ${timeline.map(item => `
                            <div class="lead-timeline-item">
                                <div class="lead-timeline-stamp">
                                    <div class="lead-timeline-icon"><i class="fas ${item.icon}"></i></div>
                                    <span>${formatDisplayDate(item.date)}</span>
                                    <span>${escapeHtml(item.time)}</span>
                                </div>
                                <div class="lead-timeline-card">
                                    <div class="lead-timeline-head">
                                        <div>
                                            <h6>${escapeHtml(item.title)}</h6>
                                            <p>${escapeHtml(item.outcome)}</p>
                                        </div>
                                        <span class="lead-pill">${escapeHtml(item.type)}</span>
                                    </div>
                                    <div class="lead-meta-chips">
                                        <span class="lead-meta-chip"><i class="fas fa-user"></i> ${escapeHtml(item.owner)}</span>
                                        <span class="lead-meta-chip"><i class="fas fa-message"></i> ${escapeHtml(item.channel)}</span>
                                    </div>
                                    <div class="lead-alert mt-16">${escapeHtml(item.notes)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Pipeline Progress</h6>
                        <span class="lead-pill"><i class="fas fa-route"></i> Real-world sales path</span>
                    </div>
                    <div class="lead-pipeline">
                        ${pipeline.map((step, index) => `
                            <div class="lead-pipeline-step ${step.state}">
                                <div class="lead-pipeline-marker">${index + 1}</div>
                                <div class="lead-pipeline-copy">
                                    <strong>${escapeHtml(step.title)}</strong>
                                    <p>${escapeHtml(step.copy)}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    ${lead.status === 'lost' ? '<div class="lead-alert mt-16">Lead is marked lost. Timeline still shows earlier sales work so the team can review drop-off reasons and improve recovery playbooks.</div>' : ''}
                </div>
            </div>
        </div>
    `;
}

function renderLeadCommercialsTab(lead, context, insights) {
    const quote = context.quote;
    const booking = context.booking;
    const payment = context.payment;
    const relationship = insights.relationship;

    return `
        <div class="lead-tab-pane tab-pane fade" id="lead-commercials-pane" role="tabpanel" aria-labelledby="lead-commercials-tab">
            <div class="lead-commercial-grid">
                <div class="lead-commercial-card">
                    <span class="label">Lead Budget</span>
                    <div class="value">₹${Number(lead.budget || 0).toLocaleString()}</div>
                    <div class="meta">Expected spend captured during discovery.</div>
                </div>
                <div class="lead-commercial-card">
                    <span class="label">Quoted Total</span>
                    <div class="value">${quote ? `₹${Number(quote.total || 0).toLocaleString()}` : 'Pending'}</div>
                    <div class="meta">${quote ? `${escapeHtml(quote.itinerary)} | valid till ${formatDisplayDate(quote.validUntil)}` : 'No quotation has been generated yet.'}</div>
                </div>
                <div class="lead-commercial-card">
                    <span class="label">Customer Lifetime</span>
                    <div class="value">${formatCurrency(relationship.lifetimeRevenue)}</div>
                    <div class="meta">${relationship.completedTrips} historical tour(s) already serviced</div>
                </div>
            </div>
            <div class="lead-grid-2 mt-16">
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Commercial Summary</h6>
                    </div>
                    <div class="lead-list-card">
                        <div class="lead-list-item">
                            <i class="fas fa-file-lines"></i>
                            <div class="muted-13">${quote ? `Quotation v${quote.version} created on ${formatDisplayDate(quote.createdAt)} by ${escapeHtml(quote.assignedTo || lead.assignedTo)}.` : 'Sales has not issued a formal quotation yet.'}</div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-percent"></i>
                            <div class="muted-13">${quote ? `Base amount ₹${Number(quote.amount || 0).toLocaleString()} + tax ₹${Number(quote.tax || 0).toLocaleString()}.` : 'Discounting and tax breakup will appear after quotation creation.'}</div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-users"></i>
                            <div class="muted-13">${quote ? escapeHtml(formatTravelerBreakdown(quote.travelerBreakdown)) : escapeHtml(formatTravelerBreakdown(lead.travelerBreakdown))}</div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-briefcase"></i>
                            <div class="muted-13">${booking ? `Booking ${booking.bookingRef} value is ${formatCurrency(booking.totalAmount)} with ${escapeHtml(getLeadStatusLabel(booking.paymentStatus))} payment status.` : 'Booking value will lock after commercial approval.'}</div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-wallet"></i>
                            <div class="muted-13">${payment ? `Latest transaction ${payment.transactionId} received on ${formatDisplayDate(payment.date)}.` : 'No payment has been logged yet for this opportunity.'}</div>
                        </div>
                    </div>
                </div>
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Closing Guidance</h6>
                    </div>
                    <div class="lead-list-card">
                        <div class="lead-list-item">
                            <i class="fas fa-bolt"></i>
                            <div class="muted-13">${lead.status === 'quotation_sent' ? 'Best time to call is within 24 hours of quote dispatch to prevent cold drift.' : lead.status === 'negotiation' ? 'Use hotel upgrade / limited seat urgency and lock commitment with payment link.' : lead.status === 'won' ? 'Focus shifts to service delivery, booking accuracy and upsell opportunities.' : 'Keep nudges personalized around destination intent and travel window.'}</div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-hand-holding-dollar"></i>
                            <div class="muted-13">${lead.score >= 90 ? 'High-conversion lead. Senior agent intervention is justified for closing.' : 'Maintain price-value narrative and reinforce itinerary confidence.'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderLeadOpsTab(lead, context) {
    return `
        <div class="lead-tab-pane tab-pane fade" id="lead-ops-pane" role="tabpanel" aria-labelledby="lead-ops-tab">
            <div class="lead-grid-2">
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Documents & Fulfilment</h6>
                    </div>
                    <div class="lead-list-card">
                        <div class="lead-list-item">
                            <i class="fas fa-map-location-dot"></i>
                            <div>
                                <strong>Itinerary</strong>
                                <div class="muted-13">${context.itinerary ? `${escapeHtml(context.itinerary.title)} | ${escapeHtml(context.itinerary.duration)}` : 'Itinerary will be auto-created after booking confirmation.'}</div>
                            </div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-receipt"></i>
                            <div>
                                <strong>Operations Status</strong>
                                <div class="muted-13">${context.booking ? 'Booking handed over to operations for trip servicing and confirmations.' : 'Operations handoff will begin after booking confirmation.'}</div>
                            </div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-headset"></i>
                            <div>
                                <strong>Support / Escalation</strong>
                                <div class="muted-13">${context.supportTicket ? `${escapeHtml(context.supportTicket.subject)} (${escapeHtml(context.supportTicket.status)}) assigned to ${escapeHtml(context.supportTicket.assignedTo)}.` : 'No travel support case logged so far.'}</div>
                            </div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-star"></i>
                            <div>
                                <strong>Post Travel Feedback</strong>
                                <div class="muted-13">${context.feedback ? `${context.feedback.rating}/5 rating captured with loyalty points ${context.feedback.points}.` : 'Feedback will be requested after travel completion.'}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Next Best Action</h6>
                    </div>
                    <div class="lead-alert">
                        ${lead.status === 'won'
                            ? 'Booking is closed. Keep ops checklist tight: reconfirmation, pre-travel communication and feedback automation.'
                            : lead.status === 'lost'
                                ? 'Review the pricing objection and response gaps. This record can be reused for reactivation campaigns and win-back offers.'
                                : lead.status === 'negotiation'
                                    ? 'Push a final approval call, reconfirm inventory hold and ask for payment commitment within the same conversation.'
                                    : lead.status === 'quotation_sent'
                                        ? 'Follow up on the shared proposal, clarify doubts line-by-line and identify the real decision maker.'
                                        : 'Complete qualification depth first, then move quickly to a proposal with destination-specific hooks.'}
                    </div>
                    <div class="lead-list-card mt-16">
                        <div class="lead-list-item">
                            <i class="fas fa-bell"></i>
                            <div class="muted-13">SLA reminder: every active lead should have a fresh follow-up logged within 24 working hours.</div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-user-tie"></i>
                            <div class="muted-13">Lead owner: ${escapeHtml(lead.assignedTo)}${context.booking ? ` | Booking owner: ${escapeHtml(context.booking.assignedTo || lead.assignedTo)}` : ''}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderLeadJourneyContent(lead) {
    const context = getLeadJourneyContext(lead);
    const insights = buildLeadCustomerInsights(lead, context);
    const timeline = buildLeadTimeline(lead);
    const latestTouch = timeline[timeline.length - 1];
    const leadManager = getLeadOwnerName(lead, insights.relationship.relationshipManager || 'Sales Desk');

    return `
        <div class="lead-journey-shell">
            <section class="lead-hero">
                <div class="lead-hero-top">
                    <div class="lead-hero-identity">
                        <div class="lead-avatar">${getLeadInitials(lead.name)}</div>
                        <div class="lead-hero-title">
                            <h3>${escapeHtml(lead.name)}</h3>
                            <p>${escapeHtml(lead.phone)} • ${escapeHtml(lead.email)}</p>
                            <div class="lead-hero-badges">
                                <span class="lead-chip"><i class="fas fa-bullhorn"></i> ${escapeHtml(lead.source)}</span>
                                <span class="lead-chip"><i class="fas fa-fire"></i> ${escapeHtml(getLeadTemperature(lead.score))}</span>
                                <span class="lead-chip"><i class="fas fa-route"></i> ${escapeHtml(getLeadStatusLabel(lead.status))}</span>
                                <span class="lead-chip"><i class="fas fa-id-badge"></i> ${insights.relationship.customerType === 'existing' ? 'Existing customer' : 'New customer'}</span>
                                <span class="lead-chip"><i class="fas fa-user-tie"></i> Lead Executive: ${escapeHtml(leadManager)}</span>
                            </div>
                        </div>
                    </div>
                 
                </div>
            </section>

            <section class="lead-summary-grid">
                <div class="lead-summary-card">
                    <span class="label">Expected Budget</span>
                    <div class="value">${formatCurrency(lead.budget)}</div>
                    <div class="meta">Travel target for this enquiry</div>
                </div>
                <div class="lead-summary-card">
                    <span class="label">Customer Type</span>
                    <div class="value">${insights.relationship.customerType === 'existing' ? 'Existing' : 'New'}</div>
                    <div class="meta">${insights.relationship.completedTrips} previous trip(s) in CRM</div>
                </div>
                <div class="lead-summary-card">
                    <span class="label">Current Plan</span>
                    <div class="value">${escapeHtml(insights.tripPlan.duration)}</div>
                    <div class="meta">${escapeHtml(insights.tripPlan.hotelCategory)} target stay</div>
                </div>
                <div class="lead-summary-card">
                    <span class="label">Next Action</span>
                    <div class="value">${escapeHtml(insights.tripPlan.currentPriority)}</div>
                    <div class="meta">${escapeHtml(insights.tripPlan.serviceWindow)}</div>
                </div>
            </section>

            <section class="lead-tabs-wrap">
                <ul class="nav nav-tabs lead-tabs-nav" id="leadJourneyTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="lead-overview-tab" data-bs-toggle="tab" data-bs-target="#lead-overview-pane" type="button" role="tab">Overview</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="lead-customer-tab" data-bs-toggle="tab" data-bs-target="#lead-customer-pane" type="button" role="tab">Customer 360</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="lead-trip-tab" data-bs-toggle="tab" data-bs-target="#lead-trip-pane" type="button" role="tab">Current Trip</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="lead-journey-tab" data-bs-toggle="tab" data-bs-target="#lead-journey-pane" type="button" role="tab">Journey Timeline</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="lead-commercials-tab" data-bs-toggle="tab" data-bs-target="#lead-commercials-pane" type="button" role="tab">Commercials</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="lead-ops-tab" data-bs-toggle="tab" data-bs-target="#lead-ops-pane" type="button" role="tab">Ops & Handover</button>
                    </li>
                </ul>
                <div class="tab-content">
                    ${renderLeadOverviewTab(lead, context, insights)}
                    ${renderLeadCustomerTab(lead, context, insights)}
                    ${renderLeadTripPlanTab(lead, context, insights)}
                    ${renderLeadJourneyTab(lead)}
                    ${renderLeadCommercialsTab(lead, context, insights)}
                    ${renderLeadOpsTab(lead, context)}
                </div>
            </section>
        </div>
    `;
}

function viewLead(id) {
    if (getCurrentPage() !== 'leads') {
        return;
    }

    const lead = state.leads.find(l => l.id === id);
    const canvas = document.getElementById('leadJourneyCanvas');
    const content = document.getElementById('leadJourneyContent');
    if (!lead || !canvas || !content || typeof bootstrap === 'undefined') return;

    document.getElementById('leadJourneyCanvasLabel').textContent = `${lead.name} Journey`;
    content.innerHTML = renderLeadJourneyContent(lead);

    const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(canvas);
    offcanvas.show();
}

const originalRenderLeadsTable = window.renderLeadsTable;
window.renderLeadsTable = function() {
    if (getCurrentPage() === 'leads') {
        updateLeadStats();
        applyFilters();
    } else if (originalRenderLeadsTable) {
        originalRenderLeadsTable();
    }
};

window.viewLead = viewLead;

document.addEventListener('DOMContentLoaded', function() {
    if (getCurrentPage() === 'leads') {
        updateLeadStats();
        applyFilters();

        document.getElementById('searchLeads')?.addEventListener('keyup', function() {
            currentPage = 1;
            applyFilters();
        });
        document.getElementById('filterSource')?.addEventListener('change', function() {
            currentPage = 1;
            applyFilters();
        });
        document.getElementById('filterStatus')?.addEventListener('change', function() {
            currentPage = 1;
            applyFilters();
        });
        document.getElementById('prevPage')?.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                renderLeadsTablePage();
                updatePaginationInfo();
            }
        });
        document.getElementById('nextPage')?.addEventListener('click', function() {
            const total = filteredLeads.length;
            const end = currentPage * rowsPerPage;
            if (end < total) {
                currentPage++;
                renderLeadsTablePage();
                updatePaginationInfo();
            }
        });
        document.getElementById('selectAll')?.addEventListener('change', function(e) {
            document.querySelectorAll('.lead-checkbox').forEach(cb => {
                cb.checked = e.target.checked;
            });
        });
    }
});
