const voucherTypeMeta = {
    hotel: {
        label: 'Hotel Voucher',
        icon: 'fa-hotel',
        serviceLabel: 'Hotel / Property Name',
        servicePlaceholder: 'e.g., Taj Hotel, Sterling Resort',
        detailsPlaceholder: 'Room category, meal plan, guest names, early check-in notes',
        defaultServiceName: destination => `${destination} Stay Confirmation`,
        defaultDetails: () => 'Room with breakfast included. Standard check-in at 2 PM and checkout at 11 AM.'
    },
    transport: {
        label: 'Transport Voucher',
        icon: 'fa-bus',
        serviceLabel: 'Transport Vendor / Service',
        servicePlaceholder: 'e.g., Innova Airport Transfer, SIC Coach',
        detailsPlaceholder: 'Pickup point, cab type, reporting time, driver notes',
        defaultServiceName: destination => `${destination} Ground Transfer`,
        defaultDetails: () => 'Airport pickup, intercity transfers and sightseeing support as per itinerary.'
    },
    activity: {
        label: 'Activity Ticket',
        icon: 'fa-ticket-alt',
        serviceLabel: 'Activity / Attraction Name',
        servicePlaceholder: 'e.g., Gulmarg Gondola, Water Sports Combo',
        detailsPlaceholder: 'Slot timing, inclusions, meeting point, ticket category',
        defaultServiceName: destination => `${destination} Experience Pass`,
        defaultDetails: () => 'Tickets, activity access and operator coordination included.'
    },
    flight: {
        label: 'Flight Ticket',
        icon: 'fa-plane-departure',
        serviceLabel: 'Airline / Flight Sector',
        servicePlaceholder: 'e.g., IndiGo DEL-SXR, Air India Round Trip',
        detailsPlaceholder: 'PNR, baggage, terminal, web check-in, fare class',
        defaultServiceName: destination => `Flight Tickets for ${destination}`,
        defaultDetails: () => 'Economy fare with standard baggage allowance and web check-in support.'
    },
    insurance: {
        label: 'Insurance Document',
        icon: 'fa-shield-heart',
        serviceLabel: 'Insurance Policy / Provider',
        servicePlaceholder: 'e.g., ICICI Lombard Travel Protect',
        detailsPlaceholder: 'Policy number, coverage highlights, insured passengers, emergency helpline',
        defaultServiceName: destination => `${destination} Travel Cover`,
        defaultDetails: () => 'Medical emergency, baggage delay and trip interruption cover included.'
    }
};

let currentFilter = 'all';
let currentPreviewVoucher = null;

function voucherCurrency(value) {
    return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function voucherDate(value) {
    if (!value) return 'TBD';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function voucherBadgeClass(type) {
    if (type === 'hotel') return 'won';
    if (type === 'transport') return 'quotation';
    if (type === 'activity') return 'partial';
    if (type === 'flight') return 'contacted';
    return 'negotiation';
}

function getVoucherEndDate(startDate, type) {
    const baseDate = new Date(startDate || new Date().toISOString().split('T')[0]);
    if (type === 'hotel' || type === 'transport') baseDate.setDate(baseDate.getDate() + 4);
    else baseDate.setDate(baseDate.getDate() + 1);
    return baseDate.toISOString().split('T')[0];
}

function normalizeVoucherRecord(voucher = {}) {
    const booking = (window.state?.bookings || []).find(item => item.id === voucher.bookingId) || {};
    const lead = (window.state?.leads || []).find(item => item.id === booking.leadId) || {};
    const type = voucher.type || 'hotel';
    const meta = voucherTypeMeta[type] || voucherTypeMeta.hotel;
    const startDate = voucher.startDate || voucher.checkIn || booking.travelDate || lead.travelDate || new Date().toISOString().split('T')[0];
    const endDate = voucher.endDate || voucher.checkOut || getVoucherEndDate(startDate, type);

    return {
        id: voucher.id || `VCH-${Date.now()}`,
        bookingId: voucher.bookingId || booking.id || null,
        bookingRef: voucher.bookingRef || booking.bookingRef || 'Pending Ref',
        customerName: voucher.customerName || lead.name || 'Unknown Traveler',
        customerEmail: voucher.customerEmail || lead.email || 'traveler@solvonix.com',
        customerPhone: voucher.customerPhone || lead.phone || '',
        destination: voucher.destination || lead.destination || 'Custom Destination',
        type,
        serviceName: voucher.serviceName || voucher.hotel || meta.defaultServiceName(lead.destination || voucher.destination || 'Trip'),
        startDate,
        endDate,
        details: voucher.details || meta.defaultDetails(lead.destination || voucher.destination || 'Trip'),
        amount: Number(voucher.amount || booking.paidAmount || booking.totalAmount || 0),
        generatedDate: voucher.generatedDate || voucher.createdAt || new Date().toISOString().split('T')[0],
        status: voucher.status || 'active'
    };
}

function syncVoucherState() {
    if (!window.state) return;
    window.state.vouchers = (window.state.vouchers || []).map(normalizeVoucherRecord);
}

function getVoucherCountByType(type) {
    return (window.state?.vouchers || []).filter(voucher => voucher.type === type).length;
}

function updateVoucherStats() {
    syncVoucherState();

    const counters = {
        totalVouchers: window.state?.vouchers?.length || 0,
        hotelVouchers: getVoucherCountByType('hotel'),
        transportVouchers: getVoucherCountByType('transport'),
        activityVouchers: getVoucherCountByType('activity'),
        flightVouchers: getVoucherCountByType('flight'),
        insuranceVouchers: getVoucherCountByType('insurance')
    };

    Object.entries(counters).forEach(([id, value]) => {
        const node = document.getElementById(id);
        if (node) node.textContent = value;
    });
}

function getVoucherEligibleBookings() {
    return (window.state?.bookings || []).filter(booking => {
        const status = String(booking.paymentStatus || '').toLowerCase();
        return ['full', 'partial', 'pending'].includes(status);
    });
}

function loadFullyPaidBookings() {
    syncVoucherState();

    const eligibleBookings = getVoucherEligibleBookings();
    const bookingOptions = eligibleBookings.map(booking => {
        const lead = (window.state?.leads || []).find(item => item.id === booking.leadId) || {};
        const statusLabel = String(booking.paymentStatus || 'pending').toUpperCase();
        return `<option value="${booking.id}">${booking.bookingRef} - ${lead.name || 'Unknown'} (${lead.destination || 'Trip'}) • ${statusLabel}</option>`;
    }).join('');

    const bookingSelect = document.getElementById('voucherBookingSelect');
    const bulkSelect = document.getElementById('bulkBookingSelect');
    const shareSelect = document.getElementById('shareVoucherSelect');

    if (bookingSelect) {
        const selectedValue = bookingSelect.value;
        bookingSelect.innerHTML = '<option value="">-- Select Booking --</option>' + bookingOptions;
        bookingSelect.value = selectedValue;
        if (!bookingSelect.value && eligibleBookings.length) {
            bookingSelect.value = String(eligibleBookings[0].id);
        }
    }

    if (bulkSelect) {
        const selectedValue = bulkSelect.value;
        bulkSelect.innerHTML = '<option value="">-- Select Booking --</option>' + bookingOptions;
        bulkSelect.value = selectedValue;
        if (!bulkSelect.value && eligibleBookings.length) {
            bulkSelect.value = String(eligibleBookings[0].id);
        }
    }

    if (shareSelect) {
        const selectedValues = Array.from(shareSelect.selectedOptions || []).map(option => option.value);
        const voucherOptions = (window.state?.vouchers || []).map(voucher => `
            <option value="${voucher.id}">
                ${voucher.bookingRef} - ${voucherTypeMeta[voucher.type]?.label || 'Voucher'} - ${voucher.customerName}
            </option>
        `).join('');
        shareSelect.innerHTML = '<option value="all">All Documents</option>' + voucherOptions;
        Array.from(shareSelect.options).forEach(option => {
            option.selected = selectedValues.includes(option.value);
        });
    }

    renderCoverageSummary();
    renderDispatchQueue();
    loadVoucherBookingDetails();
}

function loadVoucherBookingDetails() {
    const bookingId = Number(document.getElementById('voucherBookingSelect')?.value);
    const preview = document.getElementById('voucherPreview');
    if (!preview) return;

    const booking = getVoucherEligibleBookings().find(item => item.id === bookingId);
    if (!booking) {
        preview.classList.add('hidden');
        preview.style.display = 'none';
        preview.innerHTML = '';
        return;
    }

    const lead = (window.state?.leads || []).find(item => item.id === booking.leadId) || {};
    const generatedCount = (window.state?.vouchers || []).filter(voucher => voucher.bookingId === booking.id).length;
    const balance = Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0);

    preview.classList.remove('hidden');
    preview.style.display = 'block';
    preview.innerHTML = `
        <div class="voucher-preview-head">
            <div>
                <strong>${lead.name || 'Unknown Traveler'}</strong>
                <span>${booking.bookingRef} • ${lead.destination || 'Custom Trip'}</span>
            </div>
            <span class="status-badge status-${booking.paymentStatus === 'full' ? 'won' : booking.paymentStatus === 'partial' ? 'partial' : 'new'}">${booking.paymentStatus}</span>
        </div>
        <div class="voucher-preview-grid">
            <div><span>Travel Date</span><strong>${voucherDate(booking.travelDate || lead.travelDate)}</strong></div>
            <div><span>Paid Amount</span><strong>${voucherCurrency(booking.paidAmount)}</strong></div>
            <div><span>Balance</span><strong>${voucherCurrency(balance)}</strong></div>
            <div><span>Docs Ready</span><strong>${generatedCount}/5</strong></div>
        </div>
        ${booking.paymentStatus !== 'full' ? `<div class="voucher-note">This booking is not fully paid yet. You can prepare documents for review, but final dispatch should happen after full payment.</div>` : ''}
    `;

    document.getElementById('serviceStartDate').value = booking.travelDate || lead.travelDate || '';
    document.getElementById('serviceEndDate').value = getVoucherEndDate(booking.travelDate || lead.travelDate, document.getElementById('voucherType')?.value || 'hotel');
    applyVoucherTypeDefaults();
}

function applyVoucherTypeDefaults() {
    const type = document.getElementById('voucherType')?.value || 'hotel';
    const meta = voucherTypeMeta[type] || voucherTypeMeta.hotel;
    const bookingId = Number(document.getElementById('voucherBookingSelect')?.value);
    const booking = (window.state?.bookings || []).find(item => item.id === bookingId) || {};
    const lead = (window.state?.leads || []).find(item => item.id === booking.leadId) || {};
    const serviceName = document.getElementById('serviceName');
    const details = document.getElementById('voucherDetails');
    const serviceLabel = document.getElementById('serviceNameLabel');
    const startLabel = document.getElementById('serviceStartLabel');
    const endLabel = document.getElementById('serviceEndLabel');

    if (serviceLabel) serviceLabel.textContent = meta.serviceLabel;
    if (startLabel) startLabel.textContent = type === 'hotel' ? 'Check-in Date' : type === 'transport' ? 'Service Start Date' : 'Travel / Issue Date';
    if (endLabel) endLabel.textContent = type === 'hotel' ? 'Check-out Date' : type === 'transport' ? 'Service End Date' : 'Expiry / Return Date';

    if (serviceName) {
        serviceName.placeholder = meta.servicePlaceholder;
        if (!serviceName.value.trim()) {
            serviceName.value = meta.defaultServiceName(lead.destination || 'Trip');
        }
    }

    if (details) {
        details.placeholder = meta.detailsPlaceholder;
        if (!details.value.trim()) {
            details.value = meta.defaultDetails(lead.destination || 'Trip');
        }
    }

    const startDate = document.getElementById('serviceStartDate');
    const endDate = document.getElementById('serviceEndDate');
    if (startDate?.value && endDate) {
        endDate.value = getVoucherEndDate(startDate.value, type);
    }
}

function buildVoucherPayload(type, booking, lead, overrides = {}) {
    const meta = voucherTypeMeta[type] || voucherTypeMeta.hotel;
    const startDate = overrides.startDate || booking.travelDate || lead.travelDate || new Date().toISOString().split('T')[0];

    return normalizeVoucherRecord({
        id: overrides.id || `VCH-${Date.now()}-${type}`,
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
        customerName: lead.name,
        customerEmail: lead.email,
        customerPhone: lead.phone,
        destination: lead.destination,
        type,
        serviceName: overrides.serviceName || meta.defaultServiceName(lead.destination || 'Trip'),
        startDate,
        endDate: overrides.endDate || getVoucherEndDate(startDate, type),
        details: overrides.details || meta.defaultDetails(lead.destination || 'Trip'),
        amount: Number(overrides.amount || booking.paidAmount || booking.totalAmount || 0),
        generatedDate: overrides.generatedDate || new Date().toISOString().split('T')[0],
        status: overrides.status || 'active'
    });
}

function generateCustomVoucher() {
    const bookingId = Number(document.getElementById('voucherBookingSelect')?.value);
    const type = document.getElementById('voucherType')?.value || 'hotel';
    const serviceName = document.getElementById('serviceName')?.value.trim();
    const startDate = document.getElementById('serviceStartDate')?.value;
    const endDate = document.getElementById('serviceEndDate')?.value;
    const details = document.getElementById('voucherDetails')?.value.trim();

    if (!bookingId) {
        showToast('Booking missing', 'Please select a fully paid booking first.', 'error');
        return;
    }

    const booking = (window.state?.bookings || []).find(item => item.id === bookingId);
    const lead = (window.state?.leads || []).find(item => item.id === booking?.leadId);
    if (!booking || !lead) return;

    syncVoucherState();

    const newVoucher = buildVoucherPayload(type, booking, lead, {
        serviceName,
        startDate,
        endDate,
        details
    });

    window.state.vouchers.push(newVoucher);
    renderVoucherCards();
    updateVoucherStats();
    loadFullyPaidBookings();

    document.getElementById('serviceName').value = '';
    document.getElementById('voucherDetails').value = '';
    applyVoucherTypeDefaults();

    showToast(
        booking.paymentStatus === 'full' ? 'Document generated' : 'Draft document generated',
        booking.paymentStatus === 'full'
            ? `${voucherTypeMeta[type].label} ready for ${lead.name}.`
            : `${voucherTypeMeta[type].label} draft created for ${lead.name}. Mark booking fully paid before final dispatch.`
    );
    closeModal('generateVoucherModal');
    previewVoucher(newVoucher);
}

function generateAllVouchers() {
    const bookingId = Number(document.getElementById('bulkBookingSelect')?.value);
    if (!bookingId) {
        showToast('Booking missing', 'Please select a booking for bulk generation.', 'error');
        return;
    }

    const booking = (window.state?.bookings || []).find(item => item.id === bookingId);
    const lead = (window.state?.leads || []).find(item => item.id === booking?.leadId);
    if (!booking || !lead) return;

    syncVoucherState();

    let generated = 0;
    Object.keys(voucherTypeMeta).forEach(type => {
        const existing = (window.state?.vouchers || []).find(voucher => voucher.bookingId === bookingId && voucher.type === type);
        if (!existing) {
            window.state.vouchers.push(buildVoucherPayload(type, booking, lead));
            generated += 1;
        }
    });

    renderVoucherCards();
    updateVoucherStats();
    loadFullyPaidBookings();
    closeModal('bulkVoucherModal');
    showToast('Bulk documents ready', `${generated || 0} new documents created for ${lead.name}.`);
}

function renderFilterSummary(filteredVouchers) {
    const titleNode = document.getElementById('activeVoucherTitle');
    const subtitleNode = document.getElementById('activeVoucherSubtitle');
    if (!titleNode || !subtitleNode) return;

    const filterMeta = currentFilter === 'all'
        ? { label: 'All Documents', description: 'Every generated document across hotel, transport, activity, flight and insurance.' }
        : { label: voucherTypeMeta[currentFilter]?.label || 'Documents', description: `Showing only ${voucherTypeMeta[currentFilter]?.label || 'selected'} records.` };

    titleNode.textContent = filterMeta.label;
    subtitleNode.textContent = `${filteredVouchers.length} document${filteredVouchers.length === 1 ? '' : 's'} • ${filterMeta.description}`;
}

function renderCoverageSummary() {
    const container = document.getElementById('voucherCoverageSummary');
    if (!container) return;

    const bookings = getVoucherEligibleBookings();
    if (!bookings.length) {
        container.innerHTML = '<div class="mini-empty">No fully paid bookings available for document generation.</div>';
        return;
    }

    container.innerHTML = bookings.map(booking => {
        const lead = (window.state?.leads || []).find(item => item.id === booking.leadId) || {};
        const docs = (window.state?.vouchers || []).filter(voucher => voucher.bookingId === booking.id);
        const coverage = Math.round((docs.length / Object.keys(voucherTypeMeta).length) * 100);
        return `
            <div class="voucher-coverage-card">
                <div class="voucher-coverage-head">
                    <div>
                        <strong>${booking.bookingRef}</strong>
                        <span>${lead.name || 'Unknown'} • ${lead.destination || 'Trip'}</span>
                    </div>
                    <span>${coverage}% ready</span>
                </div>
                <div class="voucher-progress">
                    <span style="width:${coverage}%;"></span>
                </div>
                <div class="voucher-mini-tags">
                    ${Object.keys(voucherTypeMeta).map(type => `
                        <span class="${docs.some(voucher => voucher.type === type) ? 'done' : ''}">
                            ${voucherTypeMeta[type].label.replace(' Voucher', '').replace(' Document', '')}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function renderDispatchQueue() {
    const container = document.getElementById('dispatchQueue');
    if (!container) return;

    const queue = [...(window.state?.vouchers || [])]
        .sort((a, b) => new Date(b.generatedDate || 0) - new Date(a.generatedDate || 0))
        .slice(0, 5);

    if (!queue.length) {
        container.innerHTML = '<div class="mini-empty">Generated documents will appear here for quick email dispatch.</div>';
        return;
    }

    container.innerHTML = queue.map(voucher => `
        <div class="dispatch-item">
            <div>
                <strong>${voucherTypeMeta[voucher.type]?.label || 'Voucher'}</strong>
                <span>${voucher.customerName} • ${voucher.bookingRef}</span>
            </div>
            <button class="btn-outline btn-sm-inline" data-onclick="previewVoucherById('${voucher.id}')">Open</button>
        </div>
    `).join('');
}

function renderVoucherCards() {
    syncVoucherState();

    const container = document.getElementById('vouchersContainer');
    if (!container) return;

    const vouchers = currentFilter === 'all'
        ? [...(window.state?.vouchers || [])]
        : (window.state?.vouchers || []).filter(voucher => voucher.type === currentFilter);

    renderFilterSummary(vouchers);
    renderCoverageSummary();
    renderDispatchQueue();

    document.querySelectorAll('.voucher-tab').forEach(button => {
        button.classList.toggle('is-active', button.dataset.type === currentFilter);
    });

    if (!vouchers.length) {
        container.innerHTML = `
            <div class="voucher-empty">
                <i class="fas fa-folder-open"></i>
                <h3>No documents in this view</h3>
                <p>Generate a voucher from a fully paid booking or switch to another tab to review available documents.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = vouchers.map(voucher => {
        const meta = voucherTypeMeta[voucher.type] || voucherTypeMeta.hotel;
        return `
            <article class="voucher-card-shell">
                <div class="voucher-card-top">
                    <div class="voucher-card-title">
                        <span class="voucher-icon"><i class="fas ${meta.icon}"></i></span>
                        <div>
                            <div class="voucher-title-row">
                                <strong>${voucher.serviceName}</strong>
                                <span class="status-badge status-${voucherBadgeClass(voucher.type)}">${meta.label}</span>
                            </div>
                            <span>${voucher.customerName} • ${voucher.destination}</span>
                        </div>
                    </div>
                    <div class="voucher-card-amount">${voucherCurrency(voucher.amount)}</div>
                </div>
                <div class="voucher-card-grid">
                    <div><span>Booking Ref</span><strong>${voucher.bookingRef}</strong></div>
                    <div><span>Travel Window</span><strong>${voucherDate(voucher.startDate)} to ${voucherDate(voucher.endDate)}</strong></div>
                    <div><span>Issued On</span><strong>${voucherDate(voucher.generatedDate)}</strong></div>
                    <div><span>Contact</span><strong>${voucher.customerPhone || voucher.customerEmail || 'Pending'}</strong></div>
                </div>
                <div class="voucher-note">${voucher.details || 'Standard operating notes attached to this document.'}</div>
                <div class="voucher-card-actions">
                    <button class="btn-outline" data-onclick="previewVoucherById('${voucher.id}')"><i class="fas fa-eye"></i> Preview</button>
                    <button class="btn-primary" data-onclick="downloadVoucherById('${voucher.id}')"><i class="fas fa-download"></i> Download</button>
                    <button class="btn-outline" data-onclick="emailVoucher('${voucher.id}')"><i class="fas fa-envelope"></i> Email</button>
                </div>
            </article>
        `;
    }).join('');
}

function filterVouchers(type) {
    currentFilter = type;
    renderVoucherCards();
}

function previewVoucherById(voucherId) {
    const voucher = (window.state?.vouchers || []).find(item => item.id === voucherId);
    if (voucher) previewVoucher(voucher);
}

function previewVoucher(voucher) {
    const meta = voucherTypeMeta[voucher.type] || voucherTypeMeta.hotel;
    currentPreviewVoucher = voucher;

    const preview = document.getElementById('voucherPreviewContent');
    if (!preview) return;

    preview.innerHTML = `
        <div class="voucher-print-card">
            <div class="voucher-print-header">
                <div>
                    <span class="voucher-print-tag">Solvonix Travel CRM</span>
                    <h2>${meta.label}</h2>
                    <p>${voucher.destination} travel document prepared for operations, traveler and vendor handoff.</p>
                </div>
                <div class="voucher-print-brand">
                    <strong>SOLVONIX</strong>
                    <span>${voucher.bookingRef}</span>
                </div>
            </div>
            <div class="voucher-print-grid">
                <div><span>Voucher ID</span><strong>${voucher.id}</strong></div>
                <div><span>Traveler</span><strong>${voucher.customerName}</strong></div>
                <div><span>Destination</span><strong>${voucher.destination}</strong></div>
                <div><span>Issue Date</span><strong>${voucherDate(voucher.generatedDate)}</strong></div>
                <div><span>Service</span><strong>${voucher.serviceName}</strong></div>
                <div><span>Travel Window</span><strong>${voucherDate(voucher.startDate)} to ${voucherDate(voucher.endDate)}</strong></div>
                <div><span>Email</span><strong>${voucher.customerEmail || 'Pending'}</strong></div>
                <div><span>Phone</span><strong>${voucher.customerPhone || 'Pending'}</strong></div>
            </div>
            <div class="voucher-print-notes">
                <h4>Operational Notes</h4>
                <p>${voucher.details || 'As per itinerary and service confirmation shared with vendors.'}</p>
            </div>
            <div class="voucher-print-footer">
                <span>Support: support@solvonix.com</span>
                <span>Helpline: +91 98765 43210</span>
                <span>Amount Covered: ${voucherCurrency(voucher.amount)}</span>
            </div>
        </div>
    `;

    document.getElementById('voucherPreviewModal')?.classList.add('show');
}

function downloadCurrentVoucher() {
    if (currentPreviewVoucher) downloadVoucherById(currentPreviewVoucher.id);
}

function downloadVoucherById(voucherId) {
    const voucher = (window.state?.vouchers || []).find(item => item.id === voucherId);
    if (!voucher) return;

    const meta = voucherTypeMeta[voucher.type] || voucherTypeMeta.hotel;
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${meta.label} - ${voucher.customerName}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 32px; background: #f8fafc; color: #0f172a; }
                .sheet { max-width: 760px; margin: 0 auto; background: #fff; border-radius: 24px; padding: 32px; border: 1px solid #e2e8f0; }
                .header { display: flex; justify-content: space-between; gap: 20px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
                .tag { display: inline-block; padding: 6px 12px; background: #fee2e2; color: #be123c; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
                h1 { margin: 16px 0 8px; color: #1e293b; }
                .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 24px; }
                .cell { padding: 14px 16px; border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0; }
                .cell span { display: block; font-size: 12px; color: #64748b; margin-bottom: 6px; }
                .notes { margin-top: 24px; padding: 18px; border-radius: 18px; background: #fff7ed; border: 1px solid #fed7aa; }
                .footer { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 28px; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #475569; }
            </style>
        </head>
        <body>
            <div class="sheet">
                <div class="header">
                    <div>
                        <span class="tag">Solvonix Travels</span>
                        <h1>${meta.label}</h1>
                        <div>${voucher.destination} service confirmation for ${voucher.customerName}</div>
                    </div>
                    <div>
                        <strong>${voucher.bookingRef}</strong><br>
                        ${voucher.id}<br>
                        ${voucherDate(voucher.generatedDate)}
                    </div>
                </div>
                <div class="grid">
                    <div class="cell"><span>Traveler</span><strong>${voucher.customerName}</strong></div>
                    <div class="cell"><span>Destination</span><strong>${voucher.destination}</strong></div>
                    <div class="cell"><span>Service</span><strong>${voucher.serviceName}</strong></div>
                    <div class="cell"><span>Travel Window</span><strong>${voucherDate(voucher.startDate)} to ${voucherDate(voucher.endDate)}</strong></div>
                    <div class="cell"><span>Email</span><strong>${voucher.customerEmail || 'Pending'}</strong></div>
                    <div class="cell"><span>Phone</span><strong>${voucher.customerPhone || 'Pending'}</strong></div>
                </div>
                <div class="notes">
                    <strong>Operational Notes</strong>
                    <p>${voucher.details || 'As per itinerary and confirmed vendor scope.'}</p>
                </div>
                <div class="footer">
                    <span>Amount Covered: ${voucherCurrency(voucher.amount)}</span>
                    <span>support@solvonix.com</span>
                    <span>+91 98765 43210</span>
                </div>
            </div>
        </body>
        </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${voucher.type}_${voucher.customerName.replace(/\s+/g, '_')}_${voucher.bookingRef}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Download started', `${meta.label} export prepared.`);
}

function emailCurrentVoucher() {
    if (currentPreviewVoucher) emailVoucher(currentPreviewVoucher.id);
}

function emailVoucher(voucherId) {
    const voucher = (window.state?.vouchers || []).find(item => item.id === voucherId);
    if (!voucher) return;
    showToast('Email queued', `${voucherTypeMeta[voucher.type]?.label || 'Document'} sent to ${voucher.customerEmail}.`);
}

function shareDocuments() {
    const email = document.getElementById('shareEmail')?.value.trim();
    const select = document.getElementById('shareVoucherSelect');
    if (!email) {
        showToast('Email required', 'Please enter the customer email for dispatch.', 'error');
        return;
    }

    const selected = Array.from(select?.selectedOptions || []).map(option => option.value);
    const sentCount = selected.includes('all')
        ? (window.state?.vouchers || []).length
        : selected.length;

    showToast('Documents shared', `${sentCount} document${sentCount === 1 ? '' : 's'} sent to ${email}.`);
    document.getElementById('shareEmail').value = '';
    closeModal('shareVoucherModal');
}

function initVouchersPage() {
    if (getCurrentPage() !== 'vouchers') return;
    syncVoucherState();
    applyVoucherTypeDefaults();
    refreshVouchersPage();
}

function refreshVouchersPage() {
    renderVoucherCards();
    updateVoucherStats();
    loadFullyPaidBookings();
}

window.filterVouchers = filterVouchers;
window.loadFullyPaidBookings = loadFullyPaidBookings;
window.loadVoucherBookingDetails = loadVoucherBookingDetails;
window.applyVoucherTypeDefaults = applyVoucherTypeDefaults;
window.generateCustomVoucher = generateCustomVoucher;
window.generateAllVouchers = generateAllVouchers;
window.renderVouchers = refreshVouchersPage;
window.previewVoucherById = previewVoucherById;
window.downloadVoucherById = downloadVoucherById;
window.emailVoucher = emailVoucher;
window.downloadCurrentVoucher = downloadCurrentVoucher;
window.emailCurrentVoucher = emailCurrentVoucher;
window.shareDocuments = shareDocuments;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVouchersPage);
} else {
    initVouchersPage();
}
