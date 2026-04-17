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
                <small style="color:#64748b;">${escapeHtml(lead.email)}</small><br>
                <small style="color:#64748b;">
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
                <button class="btn-outline" style="padding: 4px 10px; margin: 0 2px;" data-onclick="viewLead(${lead.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-outline" style="padding: 4px 10px; margin: 0 2px; background: #e94560; color: white; border: none;" data-onclick="sendQuotation(${lead.id})">
                    <i class="fas fa-file-invoice"></i>
                </button>
                <button class="btn-outline" style="padding: 4px 10px; margin: 0 2px; color: #ef4444;" data-onclick="deleteLead(${lead.id})">
                    <i class="fas fa-trash"></i>
                </button>
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
    const voucher = booking ? state.vouchers.find(item => item.bookingId === booking.id) || null : null;
    const supportTicket = state.tickets.find(item => item.customer === lead.name) || null;
    const feedback = state.feedbacks.find(item => item.customer === lead.name) || null;
    return { quote, booking, payment, itinerary, voucher, supportTicket, feedback };
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

    if (context.voucher) {
        events.push({
            date: getDateAfterDays(context.booking?.paymentDate || lead.createdAt, 2),
            time: '10:40 AM',
            type: 'Operations',
            title: 'Voucher and hotel confirmation prepared',
            icon: 'fa-file-signature',
            owner: 'Operations Team',
            channel: 'Voucher Desk',
            outcome: `${context.voucher.hotel} reserved for ${formatDisplayDate(context.voucher.checkIn)} check-in.`,
            notes: `Voucher ID ${context.voucher.id} ready for dispatch.`
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

function renderLeadOverviewTab(lead, context) {
    return `
        <div class="lead-tab-pane tab-pane fade show active" id="lead-overview-pane" role="tabpanel" aria-labelledby="lead-overview-tab">
            <div class="lead-grid-2">
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Customer & Trip Snapshot</h6>
                        <span class="lead-pill"><i class="fas fa-user-check"></i> Owner: ${escapeHtml(lead.assignedTo)}</span>
                    </div>
                    <div class="lead-info-list">
                        <div class="lead-info-item"><span class="label">Email</span><span class="value">${escapeHtml(lead.email)}</span></div>
                        <div class="lead-info-item"><span class="label">Phone</span><span class="value">${escapeHtml(lead.phone)}</span></div>
                        <div class="lead-info-item"><span class="label">Destination</span><span class="value">${escapeHtml(lead.destination)}</span></div>
                        <div class="lead-info-item"><span class="label">Travel Date</span><span class="value">${formatDisplayDate(lead.travelDate)}</span></div>
                        <div class="lead-info-item"><span class="label">Trip Type</span><span class="value">${escapeHtml(getLeadStatusLabel(lead.tripType))}</span></div>
                        <div class="lead-info-item"><span class="label">Package Type</span><span class="value">${escapeHtml(getLeadStatusLabel(lead.packageType))}</span></div>
                        <div class="lead-info-item"><span class="label">Pax Mix</span><span class="value">${escapeHtml(formatTravelerBreakdown(lead.travelerBreakdown))}</span></div>
                        <div class="lead-info-item"><span class="label">Lead Created</span><span class="value">${formatDisplayDate(lead.createdAt)}</span></div>
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
                                <div class="muted-13">${escapeHtml(getLeadTemperature(lead.score))} based on score, source strength and package fit.</div>
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
                                <strong>Commercial readiness</strong>
                                <div class="muted-13">${context.quote ? `Quotation v${context.quote.version} is already active with total ₹${Number(context.quote.total || 0).toLocaleString()}.` : 'Commercial proposal not shared yet. Discovery and costing are still in progress.'}</div>
                            </div>
                        </div>
                        <div class="lead-list-item">
                            <i class="fas fa-clipboard-list"></i>
                            <div>
                                <strong>Operations handoff</strong>
                                <div class="muted-13">${context.booking ? `Booking ${context.booking.bookingRef} exists and handoff is in motion.` : 'No booking record yet. Lead is still in sales pipeline.'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="lead-grid-2 mt-16">
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Preferred Inclusions</h6>
                    </div>
                    <div class="lead-list-card">
                        ${(lead.inclusionNotes.length ? lead.inclusionNotes : ['Hotel and transfer plan to be finalized in costing stage.']).map(item => `
                            <div class="lead-list-item">
                                <i class="fas fa-check"></i>
                                <div class="muted-13">${escapeHtml(item)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="lead-section-card">
                    <div class="lead-section-title">
                        <h6>Exclusions / Risks</h6>
                    </div>
                    <div class="lead-list-card">
                        ${((lead.exclusionNotes.length ? lead.exclusionNotes : ['Lunch, personal expenses and optional activities not yet included.'])).map(item => `
                            <div class="lead-list-item">
                                <i class="fas fa-triangle-exclamation"></i>
                                <div class="muted-13">${escapeHtml(item)}</div>
                            </div>
                        `).join('')}
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
                        <h6>A to Z Journey Timeline</h6>
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

function renderLeadCommercialsTab(lead, context) {
    const quote = context.quote;
    const booking = context.booking;
    const payment = context.payment;

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
                    <span class="label">Booking Value</span>
                    <div class="value">${booking ? `₹${Number(booking.totalAmount || 0).toLocaleString()}` : 'Open'}</div>
                    <div class="meta">${booking ? `${escapeHtml(booking.bookingRef)} | ${escapeHtml(getLeadStatusLabel(booking.paymentStatus))} payment` : 'Booking not confirmed yet.'}</div>
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
                            <div class="muted-13">${lead.status === 'quotation_sent' ? 'Best time to call is within 24 hours of quote dispatch to prevent cold drift.' : lead.status === 'negotiation' ? 'Use hotel upgrade / limited seat urgency and lock commitment with payment link.' : lead.status === 'won' ? 'Focus shifts to service delivery, voucher accuracy and upsell opportunities.' : 'Keep nudges personalized around destination intent and travel window.'}</div>
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
                                <strong>Voucher Status</strong>
                                <div class="muted-13">${context.voucher ? `${escapeHtml(context.voucher.id)} ready for ${escapeHtml(context.voucher.hotel)}.` : 'Voucher not released yet.'}</div>
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
                            ? 'Booking is closed. Keep ops checklist tight: voucher, reconfirmation, pre-travel communication and feedback automation.'
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
    const timeline = buildLeadTimeline(lead);
    const latestTouch = timeline[timeline.length - 1];

    return `
        <div class="lead-journey-shell">
            <section class="lead-hero">
                <div class="lead-hero-top">
                    <div class="lead-hero-identity">
                        <div class="lead-avatar">${getLeadInitials(lead.name)}</div>
                        <div class="lead-hero-title">
                            <h3>${escapeHtml(lead.name)}</h3>
                            <p>${escapeHtml(lead.destination)} trip • ${escapeHtml(getLeadStatusLabel(lead.tripType))} • ${escapeHtml(formatTravelerBreakdown(lead.travelerBreakdown))}</p>
                            <div class="lead-hero-badges">
                                <span class="lead-chip"><i class="fas fa-bullhorn"></i> ${escapeHtml(lead.source)}</span>
                                <span class="lead-chip"><i class="fas fa-fire"></i> ${escapeHtml(getLeadTemperature(lead.score))}</span>
                                <span class="lead-chip"><i class="fas fa-route"></i> ${escapeHtml(getLeadStatusLabel(lead.status))}</span>
                                <span class="lead-chip"><i class="fas fa-phone"></i> ${escapeHtml(lead.phone)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="lead-score-tile">
                        <span class="label">Lead Score</span>
                        <div class="value">${lead.score}</div>
                        <div class="meta">Last touchpoint: ${escapeHtml(latestTouch?.title || 'Lead created')}</div>
                    </div>
                </div>
            </section>

            <section class="lead-summary-grid">
                <div class="lead-summary-card">
                    <span class="label">Expected Budget</span>
                    <div class="value">₹${Number(lead.budget || 0).toLocaleString()}</div>
                    <div class="meta">Travel target for this enquiry</div>
                </div>
                <div class="lead-summary-card">
                    <span class="label">Assigned Owner</span>
                    <div class="value">${escapeHtml(lead.assignedTo)}</div>
                    <div class="meta">Sales desk currently handling this lead</div>
                </div>
                <div class="lead-summary-card">
                    <span class="label">Quotation</span>
                    <div class="value">${context.quote ? `v${context.quote.version}` : 'Pending'}</div>
                    <div class="meta">${context.quote ? `₹${Number(context.quote.total || 0).toLocaleString()} shared` : 'Not yet issued'}</div>
                </div>
                <div class="lead-summary-card">
                    <span class="label">Booking</span>
                    <div class="value">${context.booking ? escapeHtml(context.booking.bookingRef) : 'Open'}</div>
                    <div class="meta">${context.booking ? escapeHtml(getLeadStatusLabel(context.booking.status)) : 'Still in sales pipeline'}</div>
                </div>
            </section>

            <section class="lead-tabs-wrap">
                <ul class="nav nav-tabs lead-tabs-nav" id="leadJourneyTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="lead-overview-tab" data-bs-toggle="tab" data-bs-target="#lead-overview-pane" type="button" role="tab">Overview</button>
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
                    ${renderLeadOverviewTab(lead, context)}
                    ${renderLeadJourneyTab(lead)}
                    ${renderLeadCommercialsTab(lead, context)}
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
