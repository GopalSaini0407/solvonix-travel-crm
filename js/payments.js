function financeCurrency(value) {
    return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function financeLeadForBooking(booking) {
    return window.state.leads.find(item => item.id === booking.leadId) || {};
}

function buildVendorPayouts() {
    if (window.state.vendorPayouts?.length) return window.state.vendorPayouts;

    const serviceMix = [
        { type: 'hotel', label: 'Hotel', ratio: 0.45 },
        { type: 'transport', label: 'Transport', ratio: 0.18 },
        { type: 'activity', label: 'Activities', ratio: 0.12 }
    ];

    window.state.vendorPayouts = window.state.bookings.flatMap(booking => {
        const lead = financeLeadForBooking(booking);
        return serviceMix.map((service, index) => ({
            id: `${booking.bookingRef}-${service.type}`,
            bookingId: booking.id,
            bookingRef: booking.bookingRef,
            vendorName: `${lead.destination || 'Trip'} ${service.label} Partner`,
            service: service.label,
            dueAmount: Math.round(Number(booking.totalAmount || 0) * service.ratio),
            status: booking.paymentStatus === 'full' ? (index === 0 ? 'due' : 'planned') : 'hold'
        }));
    });

    return window.state.vendorPayouts;
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

function updateFinanceSummary() {
    const bookings = window.state.bookings || [];
    const vendorPayouts = buildVendorPayouts();

    const totalCollected = bookings.reduce((sum, booking) => sum + Number(booking.paidAmount || 0), 0);
    const totalOutstanding = bookings.reduce((sum, booking) => sum + (Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0)), 0);
    const incentiveDue = bookings.reduce((sum, booking) => sum + Number(booking.incentiveAmount || 0), 0);
    const payoutDue = vendorPayouts
        .filter(item => item.status === 'due')
        .reduce((sum, item) => sum + Number(item.dueAmount || 0), 0);

    document.getElementById('financeCollected').textContent = financeCurrency(totalCollected);
    document.getElementById('financeOutstanding').textContent = financeCurrency(totalOutstanding);
    document.getElementById('financeIncentiveDue').textContent = financeCurrency(incentiveDue);
    document.getElementById('financePayoutDue').textContent = financeCurrency(payoutDue);
}

function renderCollectionsTable() {
    const tbody = document.getElementById('collectionsTableBody');
    if (!tbody) return;

    const bookings = window.state.bookings || [];
    if (!bookings.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No bookings available</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.map(booking => {
        const lead = financeLeadForBooking(booking);
        const balance = Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0);
        const statusClass = booking.paymentStatus === 'full' ? 'won' : booking.paymentStatus === 'partial' ? 'partial' : 'new';

        return `
            <tr>
                <td>${booking.bookingRef}</td>
                <td>${lead.name || 'Unknown'}<br><small style="color: var(--gray);">${lead.destination || '-'}</small></td>
                <td>${financeCurrency(booking.totalAmount)}</td>
                <td>${financeCurrency(booking.paidAmount)}</td>
                <td style="color: ${balance > 0 ? '#e94560' : '#10b981'};">${financeCurrency(balance)}</td>
                <td><span class="status-badge status-${statusClass}">${booking.paymentStatus}</span></td>
                <td>${booking.assignedTo || lead.assignedTo || 'Unassigned'}</td>
                <td>
                    ${balance > 0 ? `<button class="btn-primary" style="padding: 4px 12px;" data-onclick="openFinancePaymentModal(${booking.id})">Collect</button>` : '<span style="color:#10b981; font-weight:600;">Closed</span>'}
                </td>
            </tr>
        `;
    }).join('');
}

function renderFinanceWatchlist() {
    const container = document.getElementById('financeWatchlist');
    if (!container) return;

    const pending = (window.state.bookings || [])
        .map(booking => {
            const lead = financeLeadForBooking(booking);
            return {
                booking,
                lead,
                balance: Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0)
            };
        })
        .filter(item => item.balance > 0)
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 4);

    if (!pending.length) {
        container.innerHTML = '<div style="padding: 16px; background: #ecfdf5; border-radius: 14px; color: #166534;">All collections are cleared. Finance queue looks healthy.</div>';
        return;
    }

    container.innerHTML = pending.map(item => `
        <div style="padding: 14px; background: #fff7ed; border-radius: 14px; margin-bottom: 12px;">
            <div style="display:flex; justify-content:space-between; gap: 10px;">
                <div>
                    <strong>${item.lead.name || 'Unknown'}</strong>
                    <div style="font-size: 12px; color: var(--gray);">${item.booking.bookingRef} | ${item.lead.destination || '-'}</div>
                </div>
                <span class="status-badge status-${item.booking.paymentStatus === 'partial' ? 'partial' : 'new'}">${item.booking.paymentStatus}</span>
            </div>
            <div style="margin-top: 10px; font-size: 13px; color: #9a3412;">
                Outstanding: <strong>${financeCurrency(item.balance)}</strong><br>
                Next action: collect ${item.booking.paymentStatus === 'pending' ? 'booking advance' : 'final balance'}
            </div>
        </div>
    `).join('');
}

function renderIncentiveTracker() {
    const container = document.getElementById('incentiveSummaryGrid');
    if (!container) return;

    const summary = {};
    (window.state.bookings || []).forEach(booking => {
        const owner = booking.assignedTo || financeLeadForBooking(booking).assignedTo || 'Unassigned';
        if (!summary[owner]) {
            summary[owner] = { bookings: 0, incentive: 0, collected: 0 };
        }
        summary[owner].bookings += 1;
        summary[owner].incentive += Number(booking.incentiveAmount || 0);
        summary[owner].collected += Number(booking.paidAmount || 0);
    });

    const owners = Object.entries(summary);
    if (!owners.length) {
        container.innerHTML = '<div style="color: var(--gray);">No incentive data available.</div>';
        return;
    }

    container.innerHTML = owners.map(([owner, item]) => `
        <div style="border: 1px solid var(--border); border-radius: 16px; padding: 16px; background: #f8fafc;">
            <strong style="display:block; margin-bottom: 10px;">${owner}</strong>
            <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:8px;"><span>Bookings</span><strong>${item.bookings}</strong></div>
            <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:8px;"><span>Collected</span><strong>${financeCurrency(item.collected)}</strong></div>
            <div style="display:flex; justify-content:space-between; font-size:13px;"><span>Incentive Accrued</span><strong>${financeCurrency(item.incentive)}</strong></div>
        </div>
    `).join('');
}

function renderVendorPayouts() {
    const tbody = document.getElementById('vendorPayoutTableBody');
    if (!tbody) return;

    const vendorPayouts = buildVendorPayouts();
    if (!vendorPayouts.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No vendor payouts generated</td></tr>';
        return;
    }

    tbody.innerHTML = vendorPayouts.map(item => `
        <tr>
            <td>${item.vendorName}</td>
            <td>${item.service}</td>
            <td>${item.bookingRef}</td>
            <td>${financeCurrency(item.dueAmount)}</td>
            <td><span class="status-badge status-${item.status === 'paid' ? 'won' : item.status === 'due' ? 'negotiation' : 'contacted'}">${item.status}</span></td>
            <td>
                ${item.status !== 'paid'
                    ? `<button class="btn-outline" style="padding: 4px 12px;" data-onclick="markVendorPayout('${item.id}')">${item.status === 'hold' ? 'Keep On Hold' : 'Mark Paid'}</button>`
                    : '<span style="color:#10b981; font-weight:600;">Settled</span>'}
            </td>
        </tr>
    `).join('');
}

function renderTransactionsLedger() {
    const tbody = document.getElementById('transactionsLedgerBody');
    if (!tbody) return;

    const transactions = [...(window.state.transactions || [])].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    if (!transactions.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No payment transactions available</td></tr>';
        return;
    }

    tbody.innerHTML = transactions.map(transaction => {
        const booking = (window.state.bookings || []).find(item => item.id === transaction.bookingId) || {};
        const lead = financeLeadForBooking(booking);
        return `
            <tr>
                <td>${transaction.date || '-'}</td>
                <td>${transaction.bookingRef || booking.bookingRef || '-'}</td>
                <td>${lead.name || 'Unknown'}</td>
                <td>${financeCurrency(transaction.amount)}</td>
                <td>${transaction.mode || '-'}</td>
                <td>${transaction.transactionId || '-'}</td>
                <td>${transaction.notes || '-'}</td>
            </tr>
        `;
    }).join('');
}

function populateFinanceBookingOptions(selectedId = '') {
    const select = document.getElementById('financeBookingId');
    if (!select) return;

    const options = (window.state.bookings || []).map(booking => {
        const lead = financeLeadForBooking(booking);
        const balance = Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0);
        return `<option value="${booking.id}">${booking.bookingRef} - ${lead.name || 'Unknown'} (${financeCurrency(balance)} due)</option>`;
    }).join('');

    select.innerHTML = '<option value="">-- Select Booking --</option>' + options;
    select.value = selectedId ? String(selectedId) : '';
}

function loadFinanceBookingDetails() {
    const bookingId = Number(document.getElementById('financeBookingId').value);
    const preview = document.getElementById('financeBookingPreview');
    if (!preview) return;

    const booking = (window.state.bookings || []).find(item => item.id === bookingId);
    if (!booking) {
        preview.style.display = 'none';
        return;
    }

    const lead = financeLeadForBooking(booking);
    const balance = Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0);
    preview.style.display = 'block';
    preview.innerHTML = `
        <strong>${lead.name || 'Unknown'}</strong><br>
        ${booking.bookingRef} | ${lead.destination || '-'}<br>
        Total: ${financeCurrency(booking.totalAmount)} | Paid: ${financeCurrency(booking.paidAmount)}<br>
        <span style="color: #e94560;">Balance: ${financeCurrency(balance)}</span>
    `;

    document.getElementById('financePaymentAmount').value = balance > 0 ? balance : '';
}

function openFinancePaymentModal(bookingId = '') {
    populateFinanceBookingOptions(bookingId);
    document.getElementById('financePaymentMode').value = 'UPI';
    document.getElementById('financeTransactionId').value = '';
    document.getElementById('financePaymentNotes').value = '';
    loadFinanceBookingDetails();
    document.getElementById('financePaymentModal').classList.add('show');
}

function submitFinancePayment() {
    const bookingId = Number(document.getElementById('financeBookingId').value);
    const amount = Number(document.getElementById('financePaymentAmount').value || 0);
    const mode = document.getElementById('financePaymentMode').value;
    const transactionId = document.getElementById('financeTransactionId').value.trim();
    const notes = document.getElementById('financePaymentNotes').value.trim();

    const booking = (window.state.bookings || []).find(item => item.id === bookingId);
    if (!booking || amount <= 0) {
        showToast('Payment not saved', 'Select a booking and enter a valid amount.', 'warning');
        return;
    }

    const remaining = Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0);
    if (amount > remaining) {
        showToast('Payment exceeds balance', `Only ${financeCurrency(remaining)} is pending on this booking.`, 'warning');
        return;
    }

    booking.paidAmount = Number(booking.paidAmount || 0) + amount;
    booking.paymentStatus = booking.paidAmount >= booking.totalAmount ? 'full' : 'partial';
    booking.paymentDate = new Date().toISOString().split('T')[0];
    booking.paymentMode = mode;
    booking.status = booking.paymentStatus === 'full' ? 'confirmed' : 'pending_balance';

    window.state.transactions.push({
        id: (window.state.transactions.length || 0) + 1,
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
        amount,
        mode,
        transactionId,
        notes: notes || 'Recorded from finance desk',
        date: new Date().toISOString().split('T')[0]
    });

    closeModal('financePaymentModal');
    refreshFinanceScreen();
    showToast('Payment recorded', `${financeCurrency(amount)} collected for ${booking.bookingRef}.`);
}

function markVendorPayout(payoutId) {
    const payout = buildVendorPayouts().find(item => item.id === payoutId);
    if (!payout) return;

    if (payout.status === 'hold') {
        showToast('Payout still on hold', 'Collect full customer payment before releasing vendor funds.', 'warning');
        return;
    }

    payout.status = 'paid';
    refreshFinanceScreen();
    showToast('Vendor payout updated', `${payout.vendorName} marked as paid.`);
}

function refreshFinanceScreen() {
    updateFinanceSummary();
    renderCollectionsTable();
    renderFinanceWatchlist();
    renderIncentiveTracker();
    renderVendorPayouts();
    renderTransactionsLedger();
}

document.addEventListener('DOMContentLoaded', () => {
    buildVendorPayouts();
    refreshFinanceScreen();
});

window.openFinancePaymentModal = openFinancePaymentModal;
window.loadFinanceBookingDetails = loadFinanceBookingDetails;
window.submitFinancePayment = submitFinancePayment;
window.markVendorPayout = markVendorPayout;
window.closeModal = closeModal;
