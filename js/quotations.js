// Quotations page specific JavaScript
        let currentQuoteFilter = '';

        function updateQuoteStats() {
            if (typeof state !== 'undefined' && state.quotations) {
                document.getElementById('totalQuotes').innerText = state.quotations.length;
                document.getElementById('pendingQuotes').innerText = state.quotations.filter(q => q.status === 'sent').length;
                document.getElementById('negotiatingQuotes').innerText = state.quotations.filter(q => q.status === 'negotiating').length;
                document.getElementById('acceptedQuotes').innerText = state.quotations.filter(q => q.status === 'accepted').length;
            }
        }

        function loadLeadsForDropdown() {
            const select = document.getElementById('quoteLeadId');
            if (select && typeof state !== 'undefined' && state.leads) {
                const activeLeads = state.leads.filter(l => l.status !== 'lost' && l.status !== 'won');
                select.innerHTML = '<option value="">-- Select Customer --</option>' + 
                    activeLeads.map(lead => `<option value="${lead.id}">${lead.name} - ${lead.destination} (₹${lead.budget.toLocaleString()})</option>`).join('');
            }
        }

        function loadLeadDetails() {
            const leadId = document.getElementById('quoteLeadId').value;
            const preview = document.getElementById('leadDetailsPreview');
            const baseAmount = document.getElementById('baseAmount');
            
            if (leadId && typeof state !== 'undefined' && state.leads) {
                const lead = state.leads.find(l => l.id == leadId);
                if (lead) {
                    preview.style.display = 'block';
                    preview.innerHTML = `
                        <div><strong>${lead.name}</strong></div>
                        <div style="font-size: 12px;">${lead.destination} | ${lead.travelers} travelers | ${lead.travelDate || 'Date flexible'}</div>
                    `;
                    baseAmount.value = lead.budget;
                    updateTotals();
                }
            } else {
                preview.style.display = 'none';
            }
        }

        function updateTotals() {
            let base = parseFloat(document.getElementById('baseAmount')?.value) || 0;
            let discount = parseFloat(document.getElementById('discount')?.value) || 0;
            const packageType = document.getElementById('packageType')?.value;
            
            if (packageType === 'deluxe') base = base * 1.2;
            if (packageType === 'premium') base = base * 1.4;
            
            const subtotal = base - discount;
            const tax = subtotal * 0.05;
            const total = subtotal + tax;
            
            document.getElementById('displayBaseAmount').innerHTML = '₹' + base.toLocaleString();
            document.getElementById('displayDiscount').innerHTML = '-₹' + discount.toLocaleString();
            document.getElementById('displaySubtotal').innerHTML = '₹' + subtotal.toLocaleString();
            document.getElementById('displayTax').innerHTML = '₹' + tax.toLocaleString();
            document.getElementById('displayTotal').innerHTML = '₹' + total.toLocaleString();
        }

        function openNewQuoteModal() {
            loadLeadsForDropdown();
            document.getElementById('newQuoteModal').classList.add('show');
            // Set default valid until (7 days from now)
            const date = new Date();
            date.setDate(date.getDate() + 7);
            document.getElementById('validUntil').value = date.toISOString().split('T')[0];
            updateTotals();
        }

        function openNegotiationModal(quoteId) {
            if (typeof state !== 'undefined' && state.quotations) {
                const quote = state.quotations.find(q => q.id == quoteId);
                const lead = state.leads.find(l => l.id === quote.leadId);
                if (quote && lead) {
                    document.getElementById('negotiateQuoteId').value = quoteId;
                    document.getElementById('currentQuoteAmount').innerText = quote.total.toLocaleString();
                    document.getElementById('negotiateCustomerName').innerText = lead.name;
                    document.getElementById('newOfferAmount').value = quote.total - (quote.total * 0.05);
                    document.getElementById('counterMessage').value = `Dear ${lead.name},\n\nWe appreciate your interest. As a special gesture, we are offering an additional 5% discount on your ${lead.destination} package.\n\nPlease confirm at your earliest.`;
                    document.getElementById('negotiationModal').classList.add('show');
                }
            }
        }

        function sendRevisedQuotation() {
            const quoteId = document.getElementById('negotiateQuoteId').value;
            const newAmount = parseFloat(document.getElementById('newOfferAmount').value);
            const message = document.getElementById('counterMessage').value;
            
            if (typeof state !== 'undefined' && state.quotations) {
                const quoteIndex = state.quotations.findIndex(q => q.id == quoteId);
                if (quoteIndex !== -1) {
                    const oldQuote = state.quotations[quoteIndex];
                    const newQuote = {
                        ...oldQuote,
                        id: state.quotations.length + 5000,
                        amount: newAmount - (newAmount * 0.05 / 1.05),
                        total: newAmount,
                        status: 'negotiating',
                        version: oldQuote.version + 1,
                        createdAt: new Date().toISOString().split('T')[0],
                        validUntil: document.getElementById('validUntil')?.value || oldQuote.validUntil
                    };
                    state.quotations.push(newQuote);
                    closeModal('negotiationModal');
                    renderQuotationsTable();
                    updateQuoteStats();
                    showToast('Revised Quote Sent', `New offer of ₹${newAmount.toLocaleString()} sent to customer`);
                }
            }
        }

        function sendFollowUp(quoteId) {
            document.getElementById('followupQuoteId').value = quoteId;
            document.getElementById('followupMessage').value = 'Dear Customer,\n\nYour quotation is pending. Please review at your earliest convenience.\n\nBest regards,\nSolvonix Travels Team';
            document.getElementById('followupModal').classList.add('show');
        }

        function sendFollowupMessage() {
            const quoteId = document.getElementById('followupQuoteId').value;
            const type = document.getElementById('followupType').value;
            const message = document.getElementById('followupMessage').value;
            
            closeModal('followupModal');
            showToast('Follow-up Sent', 'Reminder has been sent to customer via selected channels');
            
            // Update quote status to show follow-up sent
            if (typeof state !== 'undefined' && state.quotations) {
                const quote = state.quotations.find(q => q.id == quoteId);
                if (quote && quote.status === 'sent') {
                    // Just tracking, no status change
                }
            }
        }

        function viewQuotation(quoteId) {
            if (typeof state !== 'undefined' && state.quotations) {
                const quote = state.quotations.find(q => q.id == quoteId);
                const lead = state.leads.find(l => l.id === quote.leadId);
                if (quote && lead) {
                    const modalHtml = `
                        <div class="modal show" id="viewQuoteModalInner">
                            <div class="modal-content" style="width: 550px;">
                                <div class="modal-header">
                                    <h3>Quotation #${quote.id}</h3>
                                    <button class="close-modal" data-onclick="closeModal('viewQuoteModalInner')">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                                        <h2 style="color: #e94560;">SOLVONIX TRAVELS</h2>
                                        <hr>
                                        <p><strong>Customer:</strong> ${lead.name}</p>
                                        <p><strong>Destination:</strong> ${lead.destination}</p>
                                        <p><strong>Package:</strong> ${quote.itinerary || 'Custom Package'}</p>
                                        <p><strong>Travel Date:</strong> ${lead.travelDate || 'Flexible'}</p>
                                        <p><strong>Travelers:</strong> ${lead.travelers}</p>
                                        <hr>
                                        <p><strong>Base Amount:</strong> ₹${quote.amount.toLocaleString()}</p>
                                        <p><strong>GST (5%):</strong> ₹${quote.tax.toLocaleString()}</p>
                                        <p><strong>Total Amount:</strong> ₹${quote.total.toLocaleString()}</p>
                                        <p><strong>Valid Until:</strong> ${quote.validUntil || '7 days from date'}</p>
                                        <hr>
                                        <p>Thank you for choosing Solvonix Travels!</p>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button class="btn-outline" data-onclick="closeModal('viewQuoteModalInner')">Close</button>
                                    <button class="btn-primary" data-onclick="approveQuotation(${quote.id}); closeModal('viewQuoteModalInner');">Approve & Book</button>
                                </div>
                            </div>
                        </div>
                    `;
                    document.body.insertAdjacentHTML('beforeend', modalHtml);
                }
            }
        }

        function approveQuotation(quoteId) {
            if (typeof state !== 'undefined' && state.quotations) {
                const quote = state.quotations.find(q => q.id === quoteId);
                if (quote) {
                    quote.status = 'accepted';
                    const lead = state.leads.find(l => l.id === quote.leadId);
                    if (lead) lead.status = 'won';
                    
                    // Create booking
                    const newBooking = {
                        id: (state.bookings?.length || 0) + 2000,
                        bookingRef: `SOL-BK-${String((state.bookings?.length || 0) + 1).padStart(3,'0')}`,
                        leadId: quote.leadId,
                        totalAmount: quote.total,
                        paidAmount: 0,
                        paymentStatus: 'pending',
                        paymentDate: null,
                        travelDate: lead?.travelDate,
                        status: 'pending',
                        paymentMode: null
                    };
                    if (!state.bookings) state.bookings = [];
                    state.bookings.push(newBooking);
                    
                    renderQuotationsTable();
                    updateQuoteStats();
                    showToast('Quotation Approved', 'Proceed to payment page to complete booking');
                    
                    setTimeout(() => {
                        window.location.href = 'bookings.html';
                    }, 1500);
                }
            }
        }

        function showNegotiationTips() {
            showToast('Negotiation Tips', 'Offer 5-10% discount, free airport transfer, or room upgrade to close deals faster');
        }

        // Override renderQuotationsTable
        const originalRenderQuotations = window.renderQuotationsTable;
        window.renderQuotationsTable = function() {
            if (getCurrentPage() === 'quotations' && typeof state !== 'undefined' && state.quotations) {
                const tbody = document.getElementById('quotationsTableBody');
                if (tbody) {
                    let quotes = [...state.quotations];
                    const statusFilter = document.getElementById('filterQuoteStatus')?.value;
                    if (statusFilter) {
                        quotes = quotes.filter(q => q.status === statusFilter);
                    }
                    const search = document.getElementById('searchQuotes')?.value.toLowerCase();
                    if (search) {
                        quotes = quotes.filter(q => {
                            const lead = state.leads.find(l => l.id === q.leadId);
                            return lead?.name.toLowerCase().includes(search) || lead?.destination.toLowerCase().includes(search);
                        });
                    }
                    
                    tbody.innerHTML = quotes.map(q => {
                        const lead = state.leads.find(l => l.id === q.leadId);
                        return `
                            <tr>
                                <td>#${q.id}</td>
                                <td>${lead?.name || 'Unknown'}</td>
                                <td>${lead?.destination || '-'}</td>
                                <td>${q.itinerary || 'Custom Package'}</td>
                                <td>₹${q.amount.toLocaleString()}</td>
                                <td>₹${q.tax.toLocaleString()}</td>
                                <td><strong>₹${q.total.toLocaleString()}</strong></td>
                                <td><span class="status-badge status-${q.status === 'sent' ? 'quotation' : q.status === 'negotiating' ? 'negotiation' : 'won'}">${q.status}</span></td>
                                <td>v${q.version}</td>
                                <td>${q.validUntil || q.createdAt}</td>
                                <td>
                                    <button class="btn-outline" style="padding: 4px 8px; margin: 2px;" data-onclick="viewQuotation(${q.id})"><i class="fas fa-eye"></i></button>
                                    <button class="btn-outline" style="padding: 4px 8px; margin: 2px;" data-onclick="sendFollowUp(${q.id})"><i class="fas fa-bell"></i></button>
                                    <button class="btn-outline" style="padding: 4px 8px; margin: 2px; background: #10b981; color: white;" data-onclick="approveQuotation(${q.id})"><i class="fas fa-check"></i></button>
                                 </td>
                            </tr>
                        `;
                    }).join('');
                    
                    if (quotes.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="11" style="text-align: center;">No quotations found</td></tr>';
                    }
                }
                updateQuoteStats();
            } else if (originalRenderQuotations) {
                originalRenderQuotations();
            }
        };

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            if (getCurrentPage() === 'quotations') {
                updateQuoteStats();
                window.renderQuotationsTable();
                
                document.getElementById('searchQuotes')?.addEventListener('keyup', () => window.renderQuotationsTable());
                document.getElementById('filterQuoteStatus')?.addEventListener('change', () => window.renderQuotationsTable());
                document.getElementById('packageType')?.addEventListener('change', updateTotals);
                document.getElementById('baseAmount')?.addEventListener('input', updateTotals);
                document.getElementById('discount')?.addEventListener('input', updateTotals);
            }
        });