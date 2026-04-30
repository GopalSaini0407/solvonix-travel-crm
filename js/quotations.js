// Quotations page specific JavaScript
        let currentQuoteFilter = '';

        function quoteEscape(value) {
            return String(value ?? '').replace(/[&<>]/g, function(match) {
                if (match === '&') return '&amp;';
                if (match === '<') return '&lt;';
                return '&gt;';
            });
        }

        function quoteMoney(value) {
            return `₹${Number(value || 0).toLocaleString('en-IN')}`;
        }

        function quoteDate(value) {
            if (!value) return 'Flexible';
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return value;
            return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        }

        function getQuotePaymentSchedule(quote, lead, advanceAmount) {
            const travelDate = lead?.travelDate ? new Date(lead.travelDate) : null;
            const balanceAmount = Math.max(Number(quote.total || 0) - Number(advanceAmount || 0), 0);
            const balanceDueDate = travelDate && !Number.isNaN(travelDate.getTime())
                ? new Date(travelDate.getTime() - (15 * 24 * 60 * 60 * 1000))
                : null;

            return [
                {
                    title: 'Advance To Confirm',
                    amount: quote.advanceRequired === false ? 0 : Number(advanceAmount || 0),
                    due: quote.advanceRequired === false ? 'Not required' : 'At the time of booking confirmation'
                },
                {
                    title: 'Balance Payment',
                    amount: balanceAmount,
                    due: balanceAmount > 0
                        ? `On or before ${quoteDate(balanceDueDate ? balanceDueDate.toISOString().split('T')[0] : lead?.travelDate)}`
                        : 'No balance pending'
                }
            ];
        }

        function getQuoteTemplateRows(payload) {
            const quote = payload.quote;
            const lead = payload.lead;
            const schedule = payload.paymentSchedule || [];

            return [
                { label: 'Package', details: payload.itinerary },
                { label: 'Duration', details: `${quote.days || (quote.nights ? Number(quote.nights) + 1 : 5)} Days / ${quote.nights || 4} Nights` },
                { label: 'Travel Date', details: quoteDate(lead.travelDate) },
                { label: 'Travelers', details: payload.travelers },
                { label: 'Payment Term', details: quote.advanceRequired === false ? 'No advance required' : `${payload.paymentTermPercent}% advance to confirm booking` },
                { label: 'Balance Payment', details: schedule[1]?.due || 'Before departure' }
            ];
        }

        function getQuoteTemplateMarkup(quoteId, options = {}) {
            const payload = buildQuoteSharePayload(quoteId);
            if (!payload) return '';

            const quote = payload.quote;
            const lead = payload.lead;
            const templateRows = getQuoteTemplateRows(payload);
            const inclusions = quote.inclusions?.length ? quote.inclusions : ['Hotel stay', 'Transfers', 'Sightseeing support', 'On-trip assistance'];
            const exclusions = quote.exclusions?.length ? quote.exclusions : ['Personal expenses', 'Optional activities', 'Meals not mentioned', 'Visa / permit fees'];
            const totalDuration = `${quote.days || (quote.nights ? Number(quote.nights) + 1 : 5)} Days / ${quote.nights || 4} Nights`;
            const whatsappAction = options.modal ? `data-onclick="openWhatsAppQuote(${quote.id})"` : `onclick="shareOnWhatsApp()"`;
            const emailAction = options.modal ? `data-onclick="openEmailQuote(${quote.id})"` : `onclick="window.location.href='mailto:${lead.email || ''}'"`;

            return `
                <div class="quotation-container ${options.embedded ? 'quotation-container-embedded' : ''}">
                    <div class="quote-header">
                        <div class="company-name">SOLVONIX <span>TRAVELS</span></div>
                        <div class="quote-title">Travel Quotation</div>
                        <div class="quote-subtitle">Your dream destination, perfectly planned</div>
                        <div>
                            <span class="quote-number">Quote #: SOLV-${quote.id}</span>
                            <span class="valid-badge"><i class="far fa-clock"></i> Valid till ${quoteDate(payload.validUntil)}</span>
                        </div>
                    </div>

                    <div class="quote-body">
                        <div class="info-grid">
                            <div class="info-box">
                                <h4><i class="fas fa-user"></i> BILL TO / CUSTOMER</h4>
                                <h3>${quoteEscape(lead.name)}</h3>
                                <p>${quoteEscape(lead.email || 'Email not available')}</p>
                                <p>${quoteEscape(lead.phone || 'Phone not available')}</p>
                            </div>
                            <div class="info-box">
                                <h4><i class="fas fa-calendar-alt"></i> TRAVEL DETAILS</h4>
                                <h3>${quoteEscape(payload.itinerary)}</h3>
                                <p>${quoteDate(lead.travelDate)} • ${totalDuration}</p>
                                <p>${quoteEscape(payload.travelers)} • ${quoteEscape((quote.packageType || 'standard').toUpperCase())} Package</p>
                            </div>
                        </div>

                        <h4 class="template-section-title"><i class="fas fa-list-ul"></i> Package Summary</h4>
                        <table class="package-table">
                            <thead>
                                <tr><th>Description</th><th>Details</th></tr>
                            </thead>
                            <tbody>
                                ${templateRows.map(row => `
                                    <tr>
                                        <td>${quoteEscape(row.label)}</td>
                                        <td>${quoteEscape(row.details)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>

                        <div class="price-summary">
                            <div class="summary-row">
                                <span>Base Package Amount</span>
                                <span><strong>${quoteMoney(quote.amount)}</strong></span>
                            </div>
                            <div class="summary-row">
                                <span>GST (5%)</span>
                                <span><strong>${quoteMoney(quote.tax)}</strong></span>
                            </div>
                            <div class="summary-row total">
                                <span>TOTAL AMOUNT</span>
                                <span><strong>${quoteMoney(quote.total)}</strong></span>
                            </div>
                            <div class="summary-row">
                                <span>Advance Payment</span>
                                <span><strong>${quote.advanceRequired === false ? 'Not required' : quoteMoney(payload.advanceAmount)}</strong></span>
                            </div>
                            <div class="summary-row">
                                <span>Balance Payment</span>
                                <span><strong>${quoteMoney(Math.max(Number(quote.total || 0) - Number(payload.advanceAmount || 0), 0))}</strong></span>
                            </div>
                        </div>

                        <div class="features-grid inclusion-exclusion-box">
                            <div class="feature-box inclusion">
                                <h4><i class="fas fa-check-circle"></i> What's Included</h4>
                                <ul>
                                    ${inclusions.map(item => `<li><i class="fas fa-check"></i> ${quoteEscape(item)}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="feature-box exclusion">
                                <h4><i class="fas fa-times-circle"></i> Not Included</h4>
                                <ul>
                                    ${exclusions.map(item => `<li><i class="fas fa-times"></i> ${quoteEscape(item)}</li>`).join('')}
                                </ul>
                            </div>
                        </div>

                        <div class="terms">
                            <i class="fas fa-gavel"></i> <strong>Terms & Conditions:</strong><br>
                            • ${quote.advanceRequired === false ? 'No advance is required for this proposal.' : `${payload.paymentTermPercent}% advance payment is required to confirm the booking.`}<br>
                            • Final rates are subject to hotel/transport availability and supplier reconfirmation.<br>
                            • Changes in travel dates, occupancy or inclusions may affect the final cost.<br>
                            • Passport/ID and mandatory travel documents must be valid as per destination rules.
                        </div>

                        <div class="special-offer-box">
                            <i class="fas fa-star"></i> <strong>Sales Note:</strong> Share this quotation with the customer on WhatsApp or email for quick approval and booking confirmation.
                        </div>
                    </div>

                    <div class="quote-footer">
                        <div class="signature-area">
                            
                            <div>For Solvonix Travels</div>
                        </div>
                        <div class="contact-info">
                            <div><i class="fas fa-phone-alt"></i> +91 0123456789</div>
                            <div><i class="fas fa-envelope"></i> travel@solvonix.com</div>
                            <div><i class="fas fa-globe"></i>www.solvonix.com/</div>
                            <div><i class="fab fa-whatsapp"></i> +91 0123456789 (24/7 Support)</div>
                        </div>
                    </div>

                    <div class="quotation-actions no-print">
                        <button class="payment-btn" ${options.modal ? `data-onclick="downloadQuotePdf(${quote.id})"` : 'onclick="window.print()"'}><i class="fas fa-download"></i></button>
                        <button class="payment-btn payment-btn-whatsapp" ${whatsappAction}><i class="fab fa-whatsapp"></i></button>
                        <button class="payment-btn payment-btn-email" ${emailAction}><i class="fas fa-envelope"></i></button>
                    </div>
                </div>
            `;
        }

        function buildQuoteDayPlan(quote, lead) {
            const days = Number(quote.days || (quote.nights ? Number(quote.nights) + 1 : 5));
            const nights = Number(quote.nights || Math.max(days - 1, 0));
            const startDate = lead?.travelDate || quote.createdAt || new Date().toISOString().split('T')[0];
            const destination = lead?.destination || 'Trip';
            const inclusions = quote.inclusions?.length ? quote.inclusions : ['Hotel stay', 'Transfers', 'Sightseeing'];

            return Array.from({ length: days }, (_, index) => {
                const dayDate = new Date(startDate);
                if (!Number.isNaN(dayDate.getTime())) {
                    dayDate.setDate(dayDate.getDate() + index);
                }

                const title = index === 0
                    ? `Arrival and hotel check-in in ${destination}`
                    : index === days - 1
                        ? `Departure from ${destination}`
                        : `${destination} sightseeing and experiences`;

                const details = index === 0
                    ? `Airport/railway pickup, transfer to hotel and local orientation.`
                    : index === days - 1
                        ? `Breakfast, checkout and transfer for onward journey.`
                        : `${inclusions.slice(0, 3).join(', ')} as per the planned itinerary.`;

                return {
                    day: `Day ${index + 1}`,
                    date: !Number.isNaN(dayDate.getTime()) ? quoteDate(dayDate.toISOString().split('T')[0]) : 'To be shared',
                    title,
                    details
                };
            }).slice(0, Math.max(days, nights ? nights + 1 : 0));
        }

        function buildQuoteSharePayload(quoteId) {
            if (typeof state === 'undefined' || !state.quotations || !state.leads) return null;
            const quote = state.quotations.find(item => item.id == quoteId);
            if (!quote) return null;
            const lead = state.leads.find(item => item.id === quote.leadId);
            if (!lead) return null;

            const paymentTermPercent = Number(quote.paymentTermPercent || 25);
            const advanceAmount = quote.advanceRequired === false ? 0 : Number(quote.advanceAmount || Math.round((quote.total * paymentTermPercent) / 100));
            const itinerary = quote.itinerary || `${lead.destination} Custom Package`;
            const travelers = quote.travelerBreakdown ? formatTravelerBreakdown(quote.travelerBreakdown) : `${lead.travelers} travelers`;
            const validUntil = quote.validUntil || '7 days from date';
            const paymentSchedule = getQuotePaymentSchedule(quote, lead, advanceAmount);
            const dayPlan = buildQuoteDayPlan(quote, lead);
            const seller = state.users?.admin || { name: 'Solvonix Team', role: 'Travel Consultant' };

            const message = [
                `Hello ${lead.name},`,
                '',
                `Greetings from Solvonix Travels.`,
                `Your quotation for ${itinerary} is ready.`,
                '',
                `Destination: ${lead.destination}`,
                `Travel Date: ${lead.travelDate || 'Flexible'}`,
                `Travelers: ${travelers}`,
                `Total Package Cost: ${quoteMoney(quote.total)}`,
                `Advance Payment: ${quote.advanceRequired === false ? 'Not required' : `${quoteMoney(advanceAmount)} (${paymentTermPercent}%)`}`,
                `Valid Until: ${validUntil}`,
                '',
                `If you would like to confirm this trip, just reply to this message.`,
                '',
                `Regards,`,
                `Solvonix Travels`
            ].join('\n');

            return {
                quote,
                lead,
                itinerary,
                travelers,
                paymentTermPercent,
                advanceAmount,
                validUntil,
                paymentSchedule,
                dayPlan,
                seller,
                message,
                emailSubject: `Quotation #${quote.id} - ${itinerary}`
            };
        }

        function openWhatsAppQuote(quoteId) {
            const payload = buildQuoteSharePayload(quoteId);
            if (!payload) return;
            window.open(`https://wa.me/?text=${encodeURIComponent(payload.message)}`, '_blank');
        }

        function openEmailQuote(quoteId) {
            const payload = buildQuoteSharePayload(quoteId);
            if (!payload) return;
            window.location.href = `mailto:${payload.lead.email || ''}?subject=${encodeURIComponent(payload.emailSubject)}&body=${encodeURIComponent(payload.message)}`;
        }

        function openGmailQuote(quoteId) {
            const payload = buildQuoteSharePayload(quoteId);
            if (!payload) return;
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(payload.lead.email || '')}&su=${encodeURIComponent(payload.emailSubject)}&body=${encodeURIComponent(payload.message)}`;
            window.open(gmailUrl, '_blank');
        }

        function copyQuoteMessage(quoteId) {
            const payload = buildQuoteSharePayload(quoteId);
            if (!payload) return;

            const copyAction = navigator.clipboard?.writeText
                ? navigator.clipboard.writeText(payload.message)
                : Promise.reject(new Error('Clipboard not supported'));

            copyAction
                .then(() => showToast('Copied', 'Quotation message copied. You can now paste it in WhatsApp or email.'))
                .catch(() => showToast('Copy failed', 'Clipboard not available in this browser.', 'warning'));
        }

        function printQuotePreview() {
            window.print();
        }

        function buildQuotePrintableHtml(quoteId) {
            const payload = buildQuoteSharePayload(quoteId);
            if (!payload) return '';
            const quote = payload.quote;

            return `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Quotation #${quote.id}</title>
                    <link rel="stylesheet" href="css/style.css">
                    <link rel="stylesheet" href="css/pages.css">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                </head>
                <body class="quotation-template-page">
                    ${getQuoteTemplateMarkup(quoteId)}
                </body>
                </html>
            `;
        }

        function downloadQuotePdf(quoteId) {
            const html = buildQuotePrintableHtml(quoteId);
            if (!html) return;
            const printWindow = window.open('', '_blank', 'width=980,height=860');
            if (!printWindow) {
                showToast('Popup blocked', 'Please allow popups to open PDF preview.', 'warning');
                return;
            }
            printWindow.document.open();
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 350);
        }

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
            const tripType = document.getElementById('quoteTripType');
            const packageType = document.getElementById('packageType');
            const nights = document.getElementById('quoteNights');
            
            if (leadId && typeof state !== 'undefined' && state.leads) {
                const lead = state.leads.find(l => l.id == leadId);
                if (lead) {
                    const travelerBreakdown = normalizeTravelerBreakdown(lead.travelerBreakdown);
                    preview.style.display = 'block';
                    preview.innerHTML = `
                        <div><strong>${lead.name}</strong></div>
                        <div style="font-size: 12px;">${lead.destination} | ${lead.travelers} travelers | ${lead.travelDate || 'Date flexible'}</div>
                    `;
                    baseAmount.value = lead.budget;
                    if (tripType) tripType.value = lead.tripType || 'domestic';
                    if (packageType) packageType.value = lead.packageType || 'standard';
                    if (nights && !nights.value) nights.value = 4;
                    if (document.getElementById('travelerAdults')) document.getElementById('travelerAdults').value = travelerBreakdown.adults;
                    if (document.getElementById('travelerYoung')) document.getElementById('travelerYoung').value = travelerBreakdown.young;
                    if (document.getElementById('travelerChildren')) document.getElementById('travelerChildren').value = travelerBreakdown.children;
                    if (document.getElementById('travelerInfants')) document.getElementById('travelerInfants').value = travelerBreakdown.infants;
                    if (document.getElementById('itinerary')) {
                        const packageLabel = (lead.packageType || 'standard').charAt(0).toUpperCase() + (lead.packageType || 'standard').slice(1);
                        document.getElementById('itinerary').value = `5 Days ${lead.destination} ${packageLabel} Package`;
                    }
                    updateQuoteTravelerTotal();
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
            const termPercent = parseFloat(document.getElementById('paymentTermPercent')?.value) || 25;
            const advanceRequired = (document.getElementById('advanceRequired')?.value || 'yes') === 'yes';
            const advanceAmount = advanceRequired ? Math.round((total * termPercent) / 100) : 0;
            
            document.getElementById('displayBaseAmount').innerHTML = '₹' + base.toLocaleString();
            document.getElementById('displayDiscount').innerHTML = '-₹' + discount.toLocaleString();
            document.getElementById('displaySubtotal').innerHTML = '₹' + subtotal.toLocaleString();
            document.getElementById('displayTax').innerHTML = '₹' + tax.toLocaleString();
            document.getElementById('displayTotal').innerHTML = '₹' + total.toLocaleString();
            if (document.getElementById('displayAdvanceAmount')) {
                document.getElementById('displayAdvanceAmount').innerHTML = '₹' + advanceAmount.toLocaleString();
            }
        }

        function openNewQuoteModal() {
            loadLeadsForDropdown();
            document.getElementById('newQuoteModal').classList.add('show');
            // Set default valid until (7 days from now)
            const date = new Date();
            date.setDate(date.getDate() + 7);
            document.getElementById('validUntil').value = date.toISOString().split('T')[0];
            attachQuoteFormListeners();
            updateQuoteTravelerTotal();
            updateTotals();
        }

        function openNegotiationModal(quoteId) {
            if (typeof state !== 'undefined' && state.quotations) {
                const quote = state.quotations.find(q => q.id == quoteId);
                const lead = quote ? state.leads.find(l => l.id === quote.leadId) : null;
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
                        paymentTermPercent: oldQuote.paymentTermPercent || 25,
                        advanceRequired: oldQuote.advanceRequired !== false,
                        advanceAmount: oldQuote.advanceRequired === false ? 0 : Math.round((newAmount * Number(oldQuote.paymentTermPercent || 25)) / 100),
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
                const canvas = document.getElementById('viewQuoteCanvas');
                const content = document.getElementById('viewQuoteContent');
                if (quote && lead && canvas && content && typeof bootstrap !== 'undefined') {
                    document.getElementById('viewQuoteCanvasLabel').textContent = `Quotation #${quote.id}`;
                    content.innerHTML = `
                        <div class="quotation-modal-body">
                            ${getQuoteTemplateMarkup(quote.id, { modal: true, embedded: true })}
                            <div class="quote-offcanvas-actions no-print">
                                <button class="btn-outline" data-bs-dismiss="offcanvas">Close</button>
                                <button class="btn-outline" data-onclick="sendFollowUp(${quote.id})" data-bs-dismiss="offcanvas"><i class="fas fa-bell"></i> Follow Up</button>
                                <button class="btn-primary" data-onclick="approveQuotation(${quote.id})" data-bs-dismiss="offcanvas">Approve & Book</button>
                            </div>
                        </div>
                    `;
                    const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(canvas);
                    offcanvas.show();
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
                        quoteId: quote.id,
                        totalAmount: quote.total,
                        paidAmount: 0,
                        paymentStatus: 'pending',
                        paymentDate: null,
                        travelDate: lead?.travelDate,
                        status: 'pending',
                        paymentMode: null,
                        paymentTermPercent: Number(quote.paymentTermPercent || 25),
                        advanceDueAmount: quote.advanceRequired === false ? 0 : Number(quote.advanceAmount || Math.round((quote.total * Number(quote.paymentTermPercent || 25)) / 100))
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
                    if (tbody.dataset.static === 'true') {
                        updateQuoteStats();
                        return;
                    }
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
                                <td>${q.validUntil || q.createdAt}</td>
                                <td>
                                    <div class="table-actions">
                                    <button class="btn-outline btn-sm btn-icon" data-onclick="viewQuotation(${q.id})"><i class="fas fa-eye"></i></button>
                                    <button class="btn-outline btn-sm btn-icon" data-onclick="sendFollowUp(${q.id})"><i class="fas fa-bell"></i></button>
                                    <button class="btn-outline btn-success-solid btn-sm btn-icon" data-onclick="approveQuotation(${q.id})"><i class="fas fa-check"></i></button>
                                    </div>
                                 </td>
                            </tr>
                        `;
                    }).join('');
                    
                    if (quotes.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">No quotations found</td></tr>';
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
                document.getElementById('quotationsTableBody')?.setAttribute('data-static', 'false');
                updateQuoteStats();
                window.renderQuotationsTable();
                
                document.getElementById('searchQuotes')?.addEventListener('keyup', () => window.renderQuotationsTable());
                document.getElementById('filterQuoteStatus')?.addEventListener('change', () => window.renderQuotationsTable());
                attachQuoteFormListeners();
            }
        });
