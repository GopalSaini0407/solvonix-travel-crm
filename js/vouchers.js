// Vouchers page specific JavaScript
        let currentVouchers = [];
        let currentFilter = 'all';
        let currentPreviewVoucher = null;

        function updateVoucherStats() {
            if (typeof state !== 'undefined' && state.vouchers) {
                document.getElementById('totalVouchers').innerText = state.vouchers.length;
                document.getElementById('hotelVouchers').innerText = state.vouchers.filter(v => v.type === 'hotel').length;
                document.getElementById('transportVouchers').innerText = state.vouchers.filter(v => v.type === 'transport').length;
                document.getElementById('activityVouchers').innerText = state.vouchers.filter(v => v.type === 'activity').length;
            }
        }

        function loadFullyPaidBookings() {
            if (typeof state !== 'undefined' && state.bookings && state.leads) {
                const fullyPaidBookings = state.bookings.filter(b => b.paymentStatus === 'full');
                const select = document.getElementById('voucherBookingSelect');
                const bulkSelect = document.getElementById('bulkBookingSelect');
                const shareSelect = document.getElementById('shareVoucherSelect');
                
                if (select) {
                    select.innerHTML = '<option value="">-- Select Booking --</option>' + 
                        fullyPaidBookings.map(b => {
                            const lead = state.leads.find(l => l.id === b.leadId);
                            return `<option value="${b.id}">${b.bookingRef} - ${lead?.name} (${lead?.destination})</option>`;
                        }).join('');
                }
                
                if (bulkSelect) {
                    bulkSelect.innerHTML = '<option value="">-- Select Booking --</option>' + 
                        fullyPaidBookings.map(b => {
                            const lead = state.leads.find(l => l.id === b.leadId);
                            return `<option value="${b.id}">${b.bookingRef} - ${lead?.name}</option>`;
                        }).join('');
                }
                
                if (shareSelect) {
                    shareSelect.innerHTML = '<option value="all">All Vouchers</option>' + 
                        (state.vouchers || []).map(v => `<option value="${v.id}">${v.type.toUpperCase()} - ${v.customerName}</option>`).join('');
                }
            }
        }

        function loadVoucherBookingDetails() {
            const bookingId = document.getElementById('voucherBookingSelect').value;
            const preview = document.getElementById('voucherPreview');
            
            if (bookingId && typeof state !== 'undefined' && state.bookings && state.leads) {
                const booking = state.bookings.find(b => b.id == bookingId);
                const lead = state.leads.find(l => l.id === booking.leadId);
                if (booking && lead) {
                    preview.style.display = 'block';
                    preview.innerHTML = `
                        <div><strong>${lead.name}</strong></div>
                        <div>Booking: ${booking.bookingRef} | ${lead.destination}</div>
                        <div>Travel Date: ${booking.travelDate || lead.travelDate}</div>
                        <div>Amount Paid: ₹${(booking.paidAmount || 0).toLocaleString()}</div>
                    `;
                    document.getElementById('serviceStartDate').value = booking.travelDate || lead.travelDate || '';
                    if (document.getElementById('serviceEndDate')) {
                        const endDate = new Date(booking.travelDate || lead.travelDate);
                        endDate.setDate(endDate.getDate() + 5);
                        document.getElementById('serviceEndDate').value = endDate.toISOString().split('T')[0];
                    }
                }
            } else {
                preview.style.display = 'none';
            }
        }

        function generateCustomVoucher() {
            const bookingId = document.getElementById('voucherBookingSelect').value;
            const type = document.getElementById('voucherType').value;
            const serviceName = document.getElementById('serviceName').value;
            const startDate = document.getElementById('serviceStartDate').value;
            const endDate = document.getElementById('serviceEndDate').value;
            const details = document.getElementById('voucherDetails').value;
            
            if (!bookingId) {
                showToast('Error', 'Please select a booking', 'error');
                return;
            }
            
            if (typeof state !== 'undefined' && state.bookings && state.leads) {
                const booking = state.bookings.find(b => b.id == bookingId);
                const lead = state.leads.find(l => l.id === booking.leadId);
                
                if (booking && lead) {
                    const newVoucher = {
                        id: `VCH-${Date.now()}`,
                        bookingId: booking.id,
                        bookingRef: booking.bookingRef,
                        customerName: lead.name,
                        customerEmail: lead.email,
                        customerPhone: lead.phone,
                        destination: lead.destination,
                        type: type,
                        serviceName: serviceName || (type === 'hotel' ? 'Hotel To Be Confirmed' : type === 'transport' ? 'Transport Service' : 'Activity Ticket'),
                        startDate: startDate,
                        endDate: endDate,
                        details: details,
                        amount: booking.paidAmount,
                        generatedDate: new Date().toISOString().split('T')[0],
                        status: 'active'
                    };
                    
                    if (!state.vouchers) state.vouchers = [];
                    state.vouchers.push(newVoucher);
                    
                    renderVouchers();
                    updateVoucherStats();
                    loadFullyPaidBookings();
                    
                    // Clear form
                    document.getElementById('serviceName').value = '';
                    document.getElementById('voucherDetails').value = '';
                    
                    showToast('Voucher Generated', `${type.toUpperCase()} voucher for ${lead.name} has been created`);
                    
                    // Preview the voucher
                    previewVoucher(newVoucher);
                }
            }
        }

        function generateAllVouchers() {
            const bookingId = document.getElementById('bulkBookingSelect').value;
            
            if (!bookingId) {
                showToast('Error', 'Please select a booking', 'error');
                return;
            }
            
            if (typeof state !== 'undefined' && state.bookings && state.leads) {
                const booking = state.bookings.find(b => b.id == bookingId);
                const lead = state.leads.find(l => l.id === booking.leadId);
                
                if (booking && lead) {
                    const voucherTypes = ['hotel', 'transport', 'activity', 'flight', 'insurance'];
                    let generated = 0;
                    
                    voucherTypes.forEach(type => {
                        const existing = state.vouchers?.find(v => v.bookingId == bookingId && v.type === type);
                        if (!existing) {
                            const newVoucher = {
                                id: `VCH-${Date.now()}-${type}`,
                                bookingId: booking.id,
                                bookingRef: booking.bookingRef,
                                customerName: lead.name,
                                customerEmail: lead.email,
                                customerPhone: lead.phone,
                                destination: lead.destination,
                                type: type,
                                serviceName: getDefaultServiceName(type),
                                startDate: booking.travelDate || lead.travelDate,
                                endDate: getEndDate(booking.travelDate || lead.travelDate, type),
                                details: getDefaultDetails(type, lead.destination),
                                amount: booking.paidAmount,
                                generatedDate: new Date().toISOString().split('T')[0],
                                status: 'active'
                            };
                            if (!state.vouchers) state.vouchers = [];
                            state.vouchers.push(newVoucher);
                            generated++;
                        }
                    });
                    
                    renderVouchers();
                    updateVoucherStats();
                    loadFullyPaidBookings();
                    showToast('Bulk Generation', `${generated} vouchers generated for ${lead.name}`);
                }
            }
        }

        function getDefaultServiceName(type) {
            const names = {
                'hotel': 'Premium Hotel Accommodation',
                'transport': 'Private AC Vehicle Transfer',
                'activity': 'Sightseeing & Activities Package',
                'flight': 'Round Trip Flight Tickets',
                'insurance': 'Travel Insurance Policy'
            };
            return names[type] || 'Service Voucher';
        }

        function getEndDate(startDate, type) {
            const date = new Date(startDate);
            if (type === 'hotel') date.setDate(date.getDate() + 5);
            else if (type === 'transport') date.setDate(date.getDate() + 5);
            else if (type === 'activity') date.setDate(date.getDate() + 1);
            else date.setDate(date.getDate() + 1);
            return date.toISOString().split('T')[0];
        }

        function getDefaultDetails(type, destination) {
            const details = {
                'hotel': `Standard room with breakfast included. Check-in: 2 PM, Check-out: 11 AM.`,
                'transport': `Airport pickup and drop, all sightseeing as per itinerary.`,
                'activity': `Entry tickets, guide charges, and lunch included.`,
                'flight': `Economy class round trip. 15kg check-in baggage.`,
                'insurance': `Coverage includes medical emergency, trip cancellation, lost luggage.`
            };
            return details[type] || `Service for ${destination} destination.`;
        }

        function filterVouchers(type) {
            currentFilter = type;
            renderVouchers();
            
            // Update tab styles
            document.querySelectorAll('[id^="tab"]').forEach(btn => {
                btn.style.background = '';
                btn.style.color = '';
            });
            if (type === 'all') document.getElementById('tabAll').style.background = '#e94560';
            else if (type === 'hotel') document.getElementById('tabHotel').style.background = '#e94560';
            else if (type === 'transport') document.getElementById('tabTransport').style.background = '#e94560';
            else if (type === 'activity') document.getElementById('tabActivity').style.background = '#e94560';
            else if (type === 'flight') document.getElementById('tabFlight').style.background = '#e94560';
            else if (type === 'insurance') document.getElementById('tabInsurance').style.background = '#e94560';
        }

        function renderVouchers() {
            const container = document.getElementById('vouchersContainer');
            if (!container) return;
            
            let vouchers = state.vouchers || [];
            if (currentFilter !== 'all') {
                vouchers = vouchers.filter(v => v.type === currentFilter);
            }
            
            if (vouchers.length === 0) {
                container.innerHTML = `
                    <div class="table-container" style="text-align: center; padding: 40px;">
                        <i class="fas fa-receipt" style="font-size: 48px; color: #cbd5e1;"></i>
                        <p style="margin-top: 15px; color: #64748b;">No vouchers generated yet</p>
                        <p style="font-size: 13px;">Complete full payment and generate vouchers for your customers</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = vouchers.map(v => `
                <div class="table-container" style="margin-bottom: 15px; border-left: 4px solid #e94560;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;">
                        <div style="flex: 1;">
                            <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                                <span class="status-badge status-${v.type === 'hotel' ? 'won' : v.type === 'transport' ? 'quotation' : 'partial'}" style="font-size: 11px;">
                                    ${v.type.toUpperCase()}
                                </span>
                                <strong style="font-size: 16px;">${v.serviceName}</strong>
                            </div>
                            <div style="margin-top: 12px;">
                                <div><strong>${v.customerName}</strong> | ${v.destination}</div>
                                <div style="font-size: 13px; color: #64748b; margin-top: 5px;">
                                    <i class="fas fa-calendar"></i> ${v.startDate} to ${v.endDate || v.startDate}
                                </div>
                                <div style="font-size: 13px; color: #64748b;">
                                    <i class="fas fa-hashtag"></i> Booking: ${v.bookingRef}
                                </div>
                                ${v.details ? `<div style="font-size: 12px; margin-top: 8px; background: #f1f5f9; padding: 8px; border-radius: 8px;">📝 ${v.details}</div>` : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: 10px;">
                            <button class="btn-outline" style="padding: 6px 12px;" data-onclick="previewVoucherById('${v.id}')">
                                <i class="fas fa-eye"></i> Preview
                            </button>
                            <button class="btn-primary" style="padding: 6px 12px;" data-onclick="downloadVoucherById('${v.id}')">
                                <i class="fas fa-download"></i> PDF
                            </button>
                            <button class="btn-outline" style="padding: 6px 12px;" data-onclick="emailVoucher('${v.id}')">
                                <i class="fas fa-envelope"></i> Email
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function previewVoucherById(voucherId) {
            const voucher = state.vouchers?.find(v => v.id === voucherId);
            if (voucher) {
                previewVoucher(voucher);
            }
        }

        function previewVoucher(voucher) {
            currentPreviewVoucher = voucher;
            
            const voucherHtml = `
                <div style="border: 2px solid #e94560; border-radius: 16px; padding: 25px; max-width: 500px; margin: 0 auto;">
                    <div style="text-align: center;">
                        <h2 style="color: #e94560;">SOLVONIX TRAVELS</h2>
                        <h3>${voucher.type.toUpperCase()} VOUCHER</h3>
                        <hr>
                    </div>
                    <div style="margin-top: 20px;">
                        <p><strong>Voucher ID:</strong> ${voucher.id}</p>
                        <p><strong>Booking Reference:</strong> ${voucher.bookingRef}</p>
                        <p><strong>Customer Name:</strong> ${voucher.customerName}</p>
                        <p><strong>Destination:</strong> ${voucher.destination}</p>
                        <p><strong>Service:</strong> ${voucher.serviceName}</p>
                        <p><strong>Date:</strong> ${voucher.startDate} ${voucher.endDate ? `to ${voucher.endDate}` : ''}</p>
                        <p><strong>Details:</strong> ${voucher.details || 'As per itinerary'}</p>
                        <p><strong>Amount Paid:</strong> ₹${(voucher.amount || 0).toLocaleString()}</p>
                        <hr>
                        <div style="text-align: center; font-size: 12px;">
                            <p>For any assistance, contact: support@solvonix.com | +91 98765 43210</p>
                            <p>Please carry a valid ID proof at check-in</p>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('voucherPreviewContent').innerHTML = voucherHtml;
            document.getElementById('voucherPreviewModal').classList.add('show');
        }

        function downloadCurrentVoucher() {
            if (currentPreviewVoucher) {
                downloadVoucherById(currentPreviewVoucher.id);
            }
        }

        function downloadVoucherById(voucherId) {
            const voucher = state.vouchers?.find(v => v.id === voucherId);
            if (voucher) {
                const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${voucher.type.toUpperCase()} Voucher - ${voucher.customerName}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 40px; }
                            .voucher { border: 2px solid #e94560; border-radius: 16px; padding: 30px; max-width: 600px; margin: 0 auto; }
                            .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 15px; margin-bottom: 20px; }
                            .header h1 { color: #e94560; }
                            .details { margin: 20px 0; }
                            .footer { text-align: center; font-size: 12px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; }
                        </style>
                    </head>
                    <body>
                        <div class="voucher">
                            <div class="header">
                                <h1>SOLVONIX TRAVELS</h1>
                                <h2>${voucher.type.toUpperCase()} VOUCHER</h2>
                            </div>
                            <div class="details">
                                <p><strong>Voucher ID:</strong> ${voucher.id}</p>
                                <p><strong>Booking Reference:</strong> ${voucher.bookingRef}</p>
                                <p><strong>Customer Name:</strong> ${voucher.customerName}</p>
                                <p><strong>Destination:</strong> ${voucher.destination}</p>
                                <p><strong>Service:</strong> ${voucher.serviceName}</p>
                                <p><strong>Date:</strong> ${voucher.startDate} ${voucher.endDate ? `to ${voucher.endDate}` : ''}</p>
                                <p><strong>Details:</strong> ${voucher.details || 'As per itinerary'}</p>
                                <p><strong>Amount Paid:</strong> ₹${(voucher.amount || 0).toLocaleString()}</p>
                            </div>
                            <div class="footer">
                                <p>For assistance: support@solvonix.com | +91 98765 43210</p>
                                <p>Please carry valid ID proof</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;
                
                const blob = new Blob([html], { type: 'text/html' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${voucher.type}_voucher_${voucher.customerName.replace(/\s/g, '_')}.html`;
                link.click();
                URL.revokeObjectURL(link.href);
                showToast('Download Started', 'Voucher is being downloaded');
            }
        }

        function emailCurrentVoucher() {
            if (currentPreviewVoucher) {
                emailVoucher(currentPreviewVoucher.id);
            }
        }

        function emailVoucher(voucherId) {
            const voucher = state.vouchers?.find(v => v.id === voucherId);
            if (voucher) {
                showToast('Email Sent', `Voucher has been sent to ${voucher.customerEmail}`);
            }
        }

        function shareDocuments() {
            const email = document.getElementById('shareEmail').value;
            if (!email) {
                showToast('Error', 'Please enter customer email', 'error');
                return;
            }
            showToast('Documents Shared', `All documents sent to ${email}`);
            document.getElementById('shareEmail').value = '';
        }

        // Override renderVouchers from main js
        const originalRenderVouchers = window.renderVouchers;
        window.renderVouchers = function() {
            if (getCurrentPage() === 'vouchers') {
                renderVouchers();
                updateVoucherStats();
                loadFullyPaidBookings();
            } else if (originalRenderVouchers) {
                originalRenderVouchers();
            }
        };

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            if (getCurrentPage() === 'vouchers') {
                renderVouchers();
                updateVoucherStats();
                loadFullyPaidBookings();
            }
        });