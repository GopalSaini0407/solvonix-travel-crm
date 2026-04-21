// Bookings page specific JavaScript
        let currentReceiptData = null;

        function updateBookingStats() {
            if (typeof state !== 'undefined' && state.bookings) {
                document.getElementById('totalBookings').innerText = state.bookings.length;
                document.getElementById('pendingPayments').innerText = state.bookings.filter(b => b.paymentStatus === 'pending').length;
                document.getElementById('partialPayments').innerText = state.bookings.filter(b => b.paymentStatus === 'partial').length;
                document.getElementById('fullPayments').innerText = state.bookings.filter(b => b.paymentStatus === 'full').length;
                
                // Update payment summary
                const totalCollected = state.bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
                const totalPendingAmt = state.bookings.reduce((sum, b) => sum + ((b.totalAmount || 0) - (b.paidAmount || 0)), 0);
                const totalBookingValue = state.bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
                
                document.getElementById('totalCollected').innerHTML = '₹' + totalCollected.toLocaleString();
                document.getElementById('totalPending').innerHTML = '₹' + totalPendingAmt.toLocaleString();
                document.getElementById('totalBookingValue').innerHTML = '₹' + totalBookingValue.toLocaleString();
                
                // Payment mode distribution
                let upi=0, card=0, netbanking=0, cash=0;
                state.bookings.forEach(b => {
                    if (b.paymentMode === 'UPI') upi++;
                    else if (b.paymentMode === 'Card') card++;
                    else if (b.paymentMode === 'NetBanking') netbanking++;
                    else if (b.paymentMode === 'Cash') cash++;
                });
                document.getElementById('upiCount').innerText = upi;
                document.getElementById('cardCount').innerText = card;
                document.getElementById('netbankingCount').innerText = netbanking;
                document.getElementById('cashCount').innerText = cash;
            }
        }

        function loadApprovedQuotations() {
            const select = document.getElementById('bookingQuoteId');
            if (select && typeof state !== 'undefined' && state.quotations && state.leads) {
                const approvedQuotes = state.quotations.filter(q => q.status === 'accepted');
                const alreadyBooked = state.bookings?.map(b => b.leadId) || [];
                const availableQuotes = approvedQuotes.filter(q => !alreadyBooked.includes(q.leadId));
                
                select.innerHTML = '<option value="">-- Select Quotation --</option>' + 
                    availableQuotes.map(q => {
                        const lead = state.leads.find(l => l.id === q.leadId);
                        return `<option value="${q.id}">${lead?.name} - ${lead?.destination} (₹${q.total.toLocaleString()})</option>`;
                    }).join('');
            }
        }

        function loadBookingDetails() {
            const quoteId = document.getElementById('bookingQuoteId').value;
            const preview = document.getElementById('bookingDetailsPreview');
            
            if (quoteId && typeof state !== 'undefined' && state.quotations) {
                const quote = state.quotations.find(q => q.id == quoteId);
                const lead = state.leads.find(l => l.id === quote.leadId);
                if (quote && lead) {
                    preview.style.display = 'block';
                    preview.innerHTML = `
                        <div><strong>${lead.name}</strong></div>
                        <div>Destination: ${lead.destination} | Travelers: ${lead.travelers}</div>
                        <div>Quote Amount: ₹${quote.total.toLocaleString()}</div>
                        <div>Valid Until: ${quote.validUntil || 'N/A'}</div>
                    `;
                    document.getElementById('confirmTravelDate').value = lead.travelDate || '';
                }
            } else {
                preview.style.display = 'none';
            }
        }

        function openNewBookingModal() {
            loadApprovedQuotations();
            document.getElementById('newBookingModal').classList.add('show');
        }

        function createBooking() {
            const quoteId = document.getElementById('bookingQuoteId').value;
            const paymentType = document.getElementById('paymentTypeSelect').value;
            const travelDate = document.getElementById('confirmTravelDate').value;
            const requests = document.getElementById('bookingRequests').value;
            
            if (!quoteId) {
                showToast('Error', 'Please select a quotation', 'error');
                return;
            }
            
            if (typeof state !== 'undefined' && state.quotations && state.leads) {
                const quote = state.quotations.find(q => q.id == quoteId);
                const lead = state.leads.find(l => l.id === quote.leadId);
                
                if (quote && lead) {
                    const partialAmount = quote.total * 0.3;
                    const newBooking = {
                        id: (state.bookings?.length || 0) + 2000,
                        bookingRef: `SOL-BK-${String((state.bookings?.length || 0) + 1).padStart(3,'0')}`,
                        leadId: quote.leadId,
                        totalAmount: quote.total,
                        paidAmount: paymentType === 'full' ? quote.total : 0,
                        paymentStatus: paymentType === 'full' ? 'full' : 'pending',
                        paymentDate: paymentType === 'full' ? new Date().toISOString().split('T')[0] : null,
                        travelDate: travelDate || lead.travelDate,
                        status: paymentType === 'full' ? 'confirmed' : 'pending_payment',
                        paymentMode: null,
                        specialRequests: requests
                    };
                    
                    if (!state.bookings) state.bookings = [];
                    state.bookings.push(newBooking);
                    lead.status = 'won';
                    
                    closeModal('newBookingModal');
                    renderBookingsTable();
                    updateBookingStats();
                    
                    if (paymentType === 'full') {
                        showToast('Booking Created', `Booking ${newBooking.bookingRef} confirmed with full payment`);
                        generateVoucher(newBooking.id);
                    } else {
                        showToast('Booking Created', `Booking ${newBooking.bookingRef} created. Please collect 30% advance payment.`);
                        // Open payment modal
                        setTimeout(() => openPaymentModal(newBooking.id), 500);
                    }
                }
            }
        }

        function openPaymentModal(bookingId) {
            if (typeof state !== 'undefined' && state.bookings) {
                const booking = state.bookings.find(b => b.id == bookingId);
                const lead = state.leads.find(l => l.id === booking.leadId);
                
                if (booking && lead) {
                    const pending = booking.totalAmount - (booking.paidAmount || 0);
                    document.getElementById('paymentBookingId').value = bookingId;
                    document.getElementById('paymentAmount').value = pending;
                    document.getElementById('paymentMode').value = 'UPI';
                    document.getElementById('transactionId').value = '';
                    document.getElementById('paymentNotes').value = '';
                    
                    document.getElementById('bookingPaymentDetails').innerHTML = `
                        <div><strong>${lead.name}</strong></div>
                        <div>Booking: ${booking.bookingRef} | Destination: ${lead.destination}</div>
                        <div>Total: ₹${booking.totalAmount.toLocaleString()} | Paid: ₹${(booking.paidAmount || 0).toLocaleString()}</div>
                        <div style="color: #e94560;">Pending: ₹${pending.toLocaleString()}</div>
                    `;
                    
                    document.getElementById('paymentModal').classList.add('show');
                }
            }
        }

        function processPayment() {
            const bookingId = parseInt(document.getElementById('paymentBookingId').value);
            const amount = parseFloat(document.getElementById('paymentAmount').value);
            const mode = document.getElementById('paymentMode').value;
            const transactionId = document.getElementById('transactionId').value;
            const notes = document.getElementById('paymentNotes').value;
            
            if (typeof state !== 'undefined' && state.bookings) {
                const bookingIndex = state.bookings.findIndex(b => b.id === bookingId);
                if (bookingIndex !== -1) {
                    const booking = state.bookings[bookingIndex];
                    const newPaidAmount = (booking.paidAmount || 0) + amount;
                    booking.paidAmount = newPaidAmount;
                    booking.paymentStatus = newPaidAmount >= booking.totalAmount ? 'full' : 'partial';
                    booking.paymentDate = new Date().toISOString().split('T')[0];
                    booking.paymentMode = mode;
                    
                    // Store transaction
                    if (!state.transactions) state.transactions = [];
                    state.transactions.push({
                        id: state.transactions.length + 1,
                        bookingId: booking.id,
                        bookingRef: booking.bookingRef,
                        amount: amount,
                        mode: mode,
                        transactionId: transactionId,
                        notes: notes,
                        date: new Date().toISOString().split('T')[0]
                    });
                    
                    closeModal('paymentModal');
                    renderBookingsTable();
                    updateBookingStats();
                    renderTransactions();
                    updatePaymentReminders();
                    
                    showToast('Payment Successful', `₹${amount.toLocaleString()} received via ${mode}`);
                    
                    // Generate receipt
                    const lead = state.leads.find(l => l.id === booking.leadId);
                    showReceipt(booking, lead, amount, mode, transactionId);
                    
                    // Auto generate voucher if full payment
                    if (booking.paymentStatus === 'full') {
                        generateVoucher(booking.id);
                    }
                }
            }
        }

        function showReceipt(booking, lead, amount, mode, transactionId) {
            currentReceiptData = { booking, lead, amount, mode, transactionId };
            const receiptHtml = `
                <div style="text-align: center;">
                    <h3 style="color: #e94560;">SOLVONIX TRAVELS</h3>
                    <h4>Payment Receipt</h4>
                    <hr>
                    <div style="text-align: left;">
                        <p><strong>Receipt No:</strong> RCP-${Date.now()}</p>
                        <p><strong>Date:</strong> ${new Date().toISOString().split('T')[0]}</p>
                        <p><strong>Booking ID:</strong> ${booking.bookingRef}</p>
                        <p><strong>Customer:</strong> ${lead.name}</p>
                        <p><strong>Destination:</strong> ${lead.destination}</p>
                        <p><strong>Amount Paid:</strong> ₹${amount.toLocaleString()}</p>
                        <p><strong>Payment Mode:</strong> ${mode}</p>
                        <p><strong>Transaction ID:</strong> ${transactionId || 'N/A'}</p>
                        <p><strong>Total Paid Till Date:</strong> ₹${booking.paidAmount.toLocaleString()}</p>
                        <p><strong>Remaining:</strong> ₹${(booking.totalAmount - booking.paidAmount).toLocaleString()}</p>
                    </div>
                    <hr>
                    <p>Thank you for choosing Solvonix Travels!</p>
                </div>
            `;
            document.getElementById('receiptContent').innerHTML = receiptHtml;
            document.getElementById('receiptModal').classList.add('show');
        }

        function downloadReceipt() {
            if (currentReceiptData) {
                const html = `
                    <!DOCTYPE html>
                    <html>
                    <head><title>Payment Receipt</title></head>
                    <body style="font-family: Arial; padding: 40px;">
                        <div style="border: 1px solid #ccc; padding: 30px; max-width: 500px;">
                            <h2 style="color: #e94560;">SOLVONIX TRAVELS</h2>
                            <h3>Payment Receipt</h3>
                            <hr>
                            <p><strong>Receipt No:</strong> RCP-${Date.now()}</p>
                            <p><strong>Date:</strong> ${new Date().toISOString().split('T')[0]}</p>
                            <p><strong>Booking ID:</strong> ${currentReceiptData.booking.bookingRef}</p>
                            <p><strong>Customer:</strong> ${currentReceiptData.lead.name}</p>
                            <p><strong>Amount Paid:</strong> ₹${currentReceiptData.amount.toLocaleString()}</p>
                            <p><strong>Payment Mode:</strong> ${currentReceiptData.mode}</p>
                            <hr>
                            <p>Thank you for choosing Solvonix Travels!</p>
                        </div>
                    </body>
                    </html>
                `;
                const blob = new Blob([html], { type: 'text/html' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `receipt_${currentReceiptData.booking.bookingRef}.html`;
                link.click();
                URL.revokeObjectURL(link.href);
                showToast('Download Started', 'Receipt is being downloaded');
            }
        }

        function updatePaymentReminders() {
            const container = document.getElementById('paymentReminders');
            if (container && typeof state !== 'undefined' && state.bookings) {
                const pendingBookings = state.bookings.filter(b => b.paymentStatus === 'partial' || b.paymentStatus === 'pending');
                if (pendingBookings.length === 0) {
                    container.innerHTML = '<div style="text-align: center; padding: 20px; color: #64748b;">No pending payments</div>';
                    return;
                }
                
                container.innerHTML = pendingBookings.map(b => {
                    const lead = state.leads.find(l => l.id === b.leadId);
                    const pending = b.totalAmount - (b.paidAmount || 0);
                    return `
                        <div style="background: #fff3e0; border-radius: 12px; padding: 12px; margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between;">
                                <div><strong>${lead?.name}</strong></div>
                                <span style="color: #f59e0b;">Due: ₹${pending.toLocaleString()}</span>
                            </div>
                            <div style="font-size: 12px;">${b.bookingRef} | ${lead?.destination}</div>
                            <button class="btn-primary btn-sm mt-10" data-onclick="openPaymentModal(${b.id})">
                                <i class="fas fa-credit-card"></i> Pay Now
                            </button>
                        </div>
                    `;
                }).join('');
            }
        }

        function renderTransactions() {
            const tbody = document.getElementById('transactionsTableBody');
            if (tbody && typeof state !== 'undefined' && state.transactions && state.transactions.length > 0) {
                tbody.innerHTML = state.transactions.slice(-5).reverse().map(t => {
                    const booking = state.bookings.find(b => b.id === t.bookingId);
                    const lead = state.leads.find(l => l.id === booking?.leadId);
                    return `
                        <tr>
                            <td>${t.date}</td>
                            <td>${t.bookingRef}</td>
                            <td>${lead?.name || 'N/A'}</td>
                            <td>₹${t.amount.toLocaleString()}</td>
                            <td>${t.mode}</td>
                            <td><span class="status-badge status-won">Success</span></td>
                            <td><button class="btn-outline btn-sm" data-onclick="viewTransactionReceipt(${t.id})">View</button></td>
                        </tr>
                    `;
                }).join('');
            }
        }

        // Override renderBookingsTable
        const originalRenderBookings = window.renderBookingsTable;
        window.renderBookingsTable = function() {
            if (getCurrentPage() === 'bookings' && typeof state !== 'undefined' && state.bookings) {
                const tbody = document.getElementById('bookingsTableBody');
                if (tbody) {
                    let bookings = [...state.bookings];
                    const statusFilter = document.getElementById('filterPaymentStatus')?.value;
                    if (statusFilter) {
                        bookings = bookings.filter(b => b.paymentStatus === statusFilter);
                    }
                    const search = document.getElementById('searchBookings')?.value.toLowerCase();
                    if (search) {
                        bookings = bookings.filter(b => {
                            const lead = state.leads.find(l => l.id === b.leadId);
                            return b.bookingRef.toLowerCase().includes(search) || 
                                   lead?.name.toLowerCase().includes(search) ||
                                   lead?.destination.toLowerCase().includes(search);
                        });
                    }
                    
                    tbody.innerHTML = bookings.map(b => {
                        const lead = state.leads.find(l => l.id === b.leadId);
                        const pending = (b.totalAmount || 0) - (b.paidAmount || 0);
                        return `
                            <tr>
                                <td><strong>${b.bookingRef}</strong></td>
                                <td>${lead?.name || 'Unknown'}</td>
                                <td>${lead?.destination || '-'}</td>
                                <td>₹${(b.totalAmount || 0).toLocaleString()}</td>
                                <td>₹${(b.paidAmount || 0).toLocaleString()}</td>
                                <td><span style="color: #f59e0b;">₹${pending.toLocaleString()}</span></td>
                                <td><span class="status-badge status-${b.paymentStatus === 'full' ? 'won' : b.paymentStatus === 'partial' ? 'partial' : 'new'}">${b.paymentStatus}</span></td>
                                 <td>ram sharma</td>
                                 <td>2000</td>

                                <td>${b.travelDate || '-'}</td>
                                <td>${b.paymentStatus !== 'full' ? '<span style="color: #e94560;">Immediate</span>' : '-'}</td>
                                <td>
                                    <div class="table-actions">
                                    ${b.paymentStatus !== 'full' ? `<button class="btn-primary btn-sm" data-onclick="openPaymentModal(${b.id})">Pay Now</button>` : ''}
                                    <button class="btn-outline btn-sm btn-icon" data-onclick="viewBookingDetails(${b.id})"><i class="fas fa-eye"></i></button>
                                    </div>
                                 </td>
                            </tr>
                        `;
                    }).join('');
                    
                    if (bookings.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">No bookings found</td></tr>';
                    }
                }
                updateBookingStats();
                updatePaymentReminders();
                renderTransactions();
            } else if (originalRenderBookings) {
                originalRenderBookings();
            }
        };

        function viewBookingDetails(bookingId) {
            const booking = state.bookings.find(b => b.id === bookingId);
            const lead = state.leads.find(l => l.id === booking.leadId);
            if (booking && lead) {
                showToast('Booking Details', `${lead.name} - ${booking.bookingRef} | Status: ${booking.paymentStatus}`);
            }
        }

        function viewTransactionReceipt(txnId) {
            const txn = state.transactions.find(t => t.id === txnId);
            if (txn) {
                const booking = state.bookings.find(b => b.id === txn.bookingId);
                const lead = state.leads.find(l => l.id === booking.leadId);
                if (booking && lead) {
                    showReceipt(booking, lead, txn.amount, txn.mode, txn.transactionId);
                }
            }
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            if (getCurrentPage() === 'bookings') {
                updateBookingStats();
                window.renderBookingsTable();
                
                document.getElementById('searchBookings')?.addEventListener('keyup', () => window.renderBookingsTable());
                document.getElementById('filterPaymentStatus')?.addEventListener('change', () => window.renderBookingsTable());
            }
        });
