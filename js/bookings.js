// Bookings page specific JavaScript
        let currentReceiptData = null;

        function formatBookingDate(value) {
            if (!value) return '-';
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return value;
            return date.toISOString().split('T')[0];
        }

        function getBookingTransactions(bookingId) {
            return (state.transactions || [])
                .filter(transaction => transaction.bookingId === bookingId)
                .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        }

        function getAdvancePaymentInfo(booking) {
            const transactions = getBookingTransactions(booking.id);
            const firstTransaction = transactions[0] || null;
            const lastTransaction = transactions[transactions.length - 1] || null;

            return {
                firstDate: booking.advancePaymentDate || booking.firstPaymentDate || firstTransaction?.date || booking.paymentDate || null,
                lastDate: booking.lastPaymentDate || lastTransaction?.date || booking.paymentDate || null,
                firstAmount: firstTransaction?.amount || Number(booking.paidAmount || 0),
                lastAmount: lastTransaction?.amount || Number(booking.paidAmount || 0),
                transactions
            };
        }

        function formatAdvanceCell(paymentInfo) {
            if (!paymentInfo.firstDate && !paymentInfo.firstAmount) return '-';
            return `₹${Number(paymentInfo.firstAmount || 0).toLocaleString()}<br><small style="color: #64748b;">${formatBookingDate(paymentInfo.firstDate)}</small>`;
        }

        function formatLastPaymentCell(paymentInfo) {
            if (!paymentInfo.lastDate && !paymentInfo.lastAmount) return '-';
            return `₹${Number(paymentInfo.lastAmount || 0).toLocaleString()}<br><small style="color: #64748b;">${formatBookingDate(paymentInfo.lastDate)}</small>`;
        }

        function getNormalizedBookingStatus(booking) {
            const rawStatus = String(booking.bookingStatus || booking.status || '').toLowerCase().replace(/_/g, ' ');
            if (rawStatus.includes('completed')) return 'Completed';
            if (rawStatus.includes('confirm')) return 'Confirm';
            if (rawStatus.includes('process') || rawStatus.includes('balance')) return 'In Process';
            if (rawStatus.includes('pending')) return 'Pending';
            if (booking.paymentStatus === 'full') return 'Completed';
            if (booking.paymentStatus === 'partial') return 'In Process';
            return 'Pending';
        }

        function getBookingStatusBadgeClass(status) {
            if (status === 'Completed') return 'status-won';
            if (status === 'Confirm') return 'status-partial';
            if (status === 'In Process') return 'status-processing';
            return 'status-new';
        }

        function getEmptyVoucherDetails() {
            return {
                pickupDrop: {
                    pickupRequired: 'Yes',
                    pickupTaxiNo: '',
                    pickupCabType: '',
                    pickupTime: '',
                    dropRequired: 'Yes',
                    dropTaxiNo: '',
                    dropCabType: '',
                    dropTime: ''
                },
                transport: {
                    transportMode: 'Flight',
                    transportInfo: '',
                    transportReference: '',
                    transportNotes: '',
                    transportDocumentName: '',
                    transportDocumentType: '',
                    transportDocumentData: ''
                },
                hotelStays: [],
                sightseeing: []
            };
        }

        function initializeBookingOperationsData() {
            if (typeof state === 'undefined' || !Array.isArray(state.bookings)) return;

            state.bookings.forEach(booking => {
                if (!booking.bookingStatus) {
                    if (booking.id === 2001) booking.bookingStatus = 'Completed';
                    else if (booking.id === 2002) booking.bookingStatus = 'Confirm';
                    else if (booking.id === 2003) booking.bookingStatus = 'In Process';
                    else booking.bookingStatus = getNormalizedBookingStatus(booking);
                }

                if (!booking.voucherDetails && booking.id === 2001) {
                    booking.voucherDetails = {
                        pickupDrop: {
                            pickupRequired: 'Yes',
                            pickupTaxiNo: 'HR29 AZ1234',
                            pickupCabType: 'Sedan',
                            pickupTime: '2026-05-24T06:45',
                            dropRequired: 'Yes',
                            dropTaxiNo: 'UAE 517',
                            dropCabType: 'SUV',
                            dropTime: '2026-05-24T10:10'
                        },
                        transport: {
                            transportMode: 'Flight',
                            transportInfo: 'Flight 6E-214 | Delhi to Srinagar',
                            transportReference: 'PNR SX82KQ',
                            transportNotes: 'Driver contacts guest 30 minutes before pickup.'
                        },
                        hotelStays: [
                            {
                                hotelName: 'Sunrise Villa',
                                hotelType: '3 Star',
                                roomCount: '2',
                                roomType: 'Deluxe',
                                stayFor: '2 Night',
                                hotelLocation: 'Srinagar',
                                mealType: 'Breakfast'
                            },
                            {
                                hotelName: 'Lake Resort',
                                hotelType: '4 Star',
                                roomCount: '2',
                                roomType: 'Suite',
                                stayFor: '2 Night',
                                hotelLocation: 'Gulmarg',
                                mealType: 'Breakfast + Dinner'
                            }
                        ],
                        sightseeing: [
                            {
                                dateTime: '2026-05-25T09:00',
                                details: 'Dal Lake shikara ride and Mughal garden visit'
                            }
                        ]
                    };
                }
            });
        }

        function getTransportModeConfig(mode) {
            const normalizedMode = mode || 'Flight';
            if (normalizedMode === 'Train') {
                return {
                    infoLabel: 'Train Number / Sector',
                    infoPlaceholder: 'Train 22436 | Delhi to Katra',
                    referenceLabel: 'Train PNR / Ticket No.',
                    referencePlaceholder: 'Train PNR / Ticket no.',
                    documentLabel: 'Upload Train Ticket',
                    showReference: true,
                    showDocument: true
                };
            }
            if (normalizedMode === 'Flight') {
                return {
                    infoLabel: 'Flight Number / Sector',
                    infoPlaceholder: 'Flight 6E-214 | Delhi to Srinagar',
                    referenceLabel: 'Flight PNR / E-ticket No.',
                    referencePlaceholder: 'Flight PNR / E-ticket no.',
                    documentLabel: 'Upload Flight Ticket',
                    showReference: true,
                    showDocument: true
                };
            }
            if (normalizedMode === 'Bus') {
                return {
                    infoLabel: 'Bus Operator / Route',
                    infoPlaceholder: 'Volvo Sleeper | Jaipur to Udaipur',
                    referenceLabel: 'Bus Ticket Reference',
                    referencePlaceholder: 'Bus ticket reference',
                    documentLabel: 'Upload Bus Ticket',
                    showReference: true,
                    showDocument: true
                };
            }
            if (normalizedMode === 'Cruise') {
                return {
                    infoLabel: 'Cruise Name / Route',
                    infoPlaceholder: 'Cordelia Cruise | Mumbai route',
                    referenceLabel: 'Cruise Booking Ref',
                    referencePlaceholder: 'Cruise booking reference',
                    documentLabel: 'Upload Cruise Ticket',
                    showReference: true,
                    showDocument: true
                };
            }
            if (normalizedMode === 'Self Drive') {
                return {
                    infoLabel: 'Vehicle / Rental Details',
                    infoPlaceholder: 'Creta self-drive | Goa airport pickup',
                    referenceLabel: 'Rental Booking Ref',
                    referencePlaceholder: 'Rental booking reference',
                    documentLabel: 'Upload Rental Voucher',
                    showReference: true,
                    showDocument: false
                };
            }
            return {
                infoLabel: 'Transport Details',
                infoPlaceholder: 'Local transfer / vehicle details',
                referenceLabel: 'Trip Reference',
                referencePlaceholder: 'Reference no.',
                documentLabel: 'Upload Transport Voucher',
                showReference: false,
                showDocument: false
            };
        }

        function setFieldVisibility(elementId, isVisible) {
            const element = document.getElementById(elementId);
            if (!element) return;
            element.classList.toggle('hidden', !isVisible);
        }

        function updateTransportDocumentStatus(fileName) {
            const status = document.getElementById('transportDocumentStatus');
            if (!status) return;
            const hasFile = Boolean(fileName);
            status.classList.toggle('hidden', !hasFile);
            status.textContent = hasFile ? `Current file: ${fileName}` : '';
        }

        function updatePickupDropVisibility() {
            const pickupRequired = document.getElementById('pickupRequired')?.value || 'Yes';
            const dropRequired = document.getElementById('dropRequired')?.value || 'Yes';

            setFieldVisibility('pickupTaxiNoGroup', pickupRequired === 'Yes');
            setFieldVisibility('pickupCabTypeGroup', pickupRequired === 'Yes');
            setFieldVisibility('pickupTimeGroup', pickupRequired === 'Yes');
            setFieldVisibility('dropTaxiNoGroup', dropRequired === 'Yes');
            setFieldVisibility('dropCabTypeGroup', dropRequired === 'Yes');
            setFieldVisibility('dropTimeGroup', dropRequired === 'Yes');

            if (pickupRequired !== 'Yes') {
                ['pickupTaxiNo', 'pickupCabType', 'pickupTime'].forEach(id => {
                    const field = document.getElementById(id);
                    if (field) field.value = '';
                });
            }

            if (dropRequired !== 'Yes') {
                ['dropTaxiNo', 'dropCabType', 'dropTime'].forEach(id => {
                    const field = document.getElementById(id);
                    if (field) field.value = '';
                });
            }
        }

        function updateVoucherTransportVisibility() {
            const transportMode = document.getElementById('transportMode')?.value || 'Flight';
            const modeConfig = getTransportModeConfig(transportMode);

            setFieldVisibility('transportReferenceGroup', modeConfig.showReference);
            setFieldVisibility('transportDocumentGroup', modeConfig.showDocument);

            const transportInfoLabel = document.getElementById('transportInfoLabel');
            const transportInfo = document.getElementById('transportInfo');
            const transportReferenceLabel = document.getElementById('transportReferenceLabel');
            const transportReference = document.getElementById('transportReference');
            const transportDocumentLabel = document.getElementById('transportDocumentLabel');

            if (transportInfoLabel) transportInfoLabel.textContent = modeConfig.infoLabel;
            if (transportInfo) transportInfo.placeholder = modeConfig.infoPlaceholder;
            if (transportReferenceLabel) transportReferenceLabel.textContent = modeConfig.referenceLabel;
            if (transportReference) transportReference.placeholder = modeConfig.referencePlaceholder;
            if (transportDocumentLabel) transportDocumentLabel.textContent = modeConfig.documentLabel;
            if (modeConfig.showDocument && !document.getElementById('transportDocument')?.files?.[0]) {
                updateTransportDocumentStatus(document.getElementById('transportDocument')?.dataset.existingName || '');
            }

            if (!modeConfig.showReference) {
                const reference = document.getElementById('transportReference');
                if (reference) reference.value = '';
            }

            if (!modeConfig.showDocument) {
                const fileInput = document.getElementById('transportDocument');
                if (fileInput) fileInput.value = '';
                updateTransportDocumentStatus('');
            }
        }

        function readFileAsDataUrl(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result || '');
                reader.onerror = () => reject(new Error('Unable to read file'));
                reader.readAsDataURL(file);
            });
        }

        function getHotelStayOptions() {
            return {
                hotelTypes: ['3 Star', '4 Star', '5 Star', 'Budget', 'Boutique', 'Luxury Resort'],
                roomCounts: Array.from({ length: 10 }, (_, index) => String(index + 1)),
                roomTypes: ['Standard', 'Deluxe', 'Premium', 'Suite', 'Family Room', 'Villa Room'],
                stayFor: Array.from({ length: 10 }, (_, index) => `${index + 1} Night`),
                mealTypes: ['Breakfast', 'Lunch', 'Dinner', 'Breakfast + Dinner', 'Lunch + Dinner', 'Breakfast + Lunch + Dinner', 'No Meal']
            };
        }

        function buildOptions(options, value, placeholder) {
            return [`<option value="">${placeholder}</option>`].concat(
                options.map(option => `<option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>`)
            ).join('');
        }

        function getHotelStayCardTemplate(index, stay = {}) {
            const options = getHotelStayOptions();
            return `
                <div class="voucher-repeat-card" data-hotel-stay-index="${index}">
                    <div class="voucher-repeat-card-head">
                        <strong>Hotel Day ${index + 1}</strong>
                        ${index > 0 ? `<button type="button" class="btn-outline btn-sm" data-onclick="removeHotelStayForm(${index})">Remove</button>` : ''}
                    </div>
                    <div class="grid-2-form">
                        <div class="form-group">
                            <label>Hotel Name</label>
                            <input type="text" class="form-control" data-hotel-field="hotelName" value="${stay.hotelName || ''}" placeholder="Hotel / Property name">
                        </div>
                        <div class="form-group">
                            <label>Hotel Type</label>
                            <select class="form-control" data-hotel-field="hotelType">${buildOptions(options.hotelTypes, stay.hotelType || '', 'Select hotel type')}</select>
                        </div>
                        <div class="form-group">
                            <label>No. of Room</label>
                            <select class="form-control" data-hotel-field="roomCount">${buildOptions(options.roomCounts, stay.roomCount || '', 'Select rooms')}</select>
                        </div>
                        <div class="form-group">
                            <label>Room Type</label>
                            <select class="form-control" data-hotel-field="roomType">${buildOptions(options.roomTypes, stay.roomType || '', 'Select room type')}</select>
                        </div>
                        <div class="form-group">
                            <label>Stay For</label>
                            <select class="form-control" data-hotel-field="stayFor">${buildOptions(options.stayFor, stay.stayFor || '', 'Select stay duration')}</select>
                        </div>
                        <div class="form-group">
                            <label>Hotel Location</label>
                            <input type="text" class="form-control" data-hotel-field="hotelLocation" value="${stay.hotelLocation || ''}" placeholder="Area / city / destination">
                        </div>
                        <div class="form-group form-group-span-2">
                            <label>Meal Type</label>
                            <select class="form-control" data-hotel-field="mealType">${buildOptions(options.mealTypes, stay.mealType || '', 'Select meal type')}</select>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderHotelStayForms(stays = []) {
            const container = document.getElementById('hotelStayContainer');
            if (!container) return;
            const values = stays.length ? stays : [{}];
            container.innerHTML = values.map((stay, index) => getHotelStayCardTemplate(index, stay)).join('');
        }

        function addHotelStayForm() {
            const stays = getHotelStayFormValues();
            stays.push({});
            renderHotelStayForms(stays);
        }

        function removeHotelStayForm(index) {
            const stays = getHotelStayFormValues().filter((_, currentIndex) => currentIndex !== index);
            renderHotelStayForms(stays.length ? stays : [{}]);
        }

        function getHotelStayFormValues() {
            return Array.from(document.querySelectorAll('[data-hotel-stay-index]')).map(card => ({
                hotelName: card.querySelector('[data-hotel-field="hotelName"]')?.value.trim() || '',
                hotelType: card.querySelector('[data-hotel-field="hotelType"]')?.value.trim() || '',
                roomCount: card.querySelector('[data-hotel-field="roomCount"]')?.value.trim() || '',
                roomType: card.querySelector('[data-hotel-field="roomType"]')?.value.trim() || '',
                stayFor: card.querySelector('[data-hotel-field="stayFor"]')?.value.trim() || '',
                hotelLocation: card.querySelector('[data-hotel-field="hotelLocation"]')?.value.trim() || '',
                mealType: card.querySelector('[data-hotel-field="mealType"]')?.value.trim() || ''
            })).filter(stay => Object.values(stay).some(Boolean));
        }

        function getSightseeingCardTemplate(index, item = {}) {
            return `
                <div class="voucher-repeat-card" data-sightseeing-index="${index}">
                    <div class="voucher-repeat-card-head">
                        <strong>Sightseeing ${index + 1}</strong>
                        ${index > 0 ? `<button type="button" class="btn-outline btn-sm" data-onclick="removeSightseeingForm(${index})">Remove</button>` : ''}
                    </div>
                    <div class="grid-2-form">
                        <div class="form-group">
                            <label>Date & Time</label>
                            <input type="datetime-local" class="form-control" data-sightseeing-field="dateTime" value="${item.dateTime || ''}">
                        </div>
                        <div class="form-group form-group-span-2">
                            <label>Details</label>
                            <textarea class="form-control" rows="3" data-sightseeing-field="details" placeholder="Sightseeing details">${item.details || ''}</textarea>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderSightseeingForms(items = []) {
            const container = document.getElementById('sightseeingContainer');
            if (!container) return;
            const values = items.length ? items : [{}];
            container.innerHTML = values.map((item, index) => getSightseeingCardTemplate(index, item)).join('');
        }

        function addSightseeingForm() {
            const items = getSightseeingFormValues();
            items.push({});
            renderSightseeingForms(items);
        }

        function removeSightseeingForm(index) {
            const items = getSightseeingFormValues().filter((_, currentIndex) => currentIndex !== index);
            renderSightseeingForms(items.length ? items : [{}]);
        }

        function getSightseeingFormValues() {
            return Array.from(document.querySelectorAll('[data-sightseeing-index]')).map(card => ({
                dateTime: card.querySelector('[data-sightseeing-field="dateTime"]')?.value.trim() || '',
                details: card.querySelector('[data-sightseeing-field="details"]')?.value.trim() || ''
            })).filter(item => item.dateTime || item.details);
        }

        async function getVoucherTransportDocument(existingTransport = {}) {
            const fileInput = document.getElementById('transportDocument');
            const selectedFile = fileInput?.files?.[0] || null;
            const transportMode = document.getElementById('transportMode')?.value || 'Flight';
            const modeConfig = getTransportModeConfig(transportMode);

            if (!modeConfig.showDocument) {
                return {
                    transportDocumentName: '',
                    transportDocumentType: '',
                    transportDocumentData: ''
                };
            }

            if (!selectedFile) {
                return {
                    transportDocumentName: existingTransport.transportDocumentName || '',
                    transportDocumentType: existingTransport.transportDocumentType || '',
                    transportDocumentData: existingTransport.transportDocumentData || ''
                };
            }

            return {
                transportDocumentName: selectedFile.name,
                transportDocumentType: selectedFile.type || '',
                transportDocumentData: await readFileAsDataUrl(selectedFile)
            };
        }

        function switchVoucherTab(tabName) {
            document.querySelectorAll('.voucher-tab').forEach(button => {
                button.classList.toggle('is-active', button.dataset.tab === tabName);
            });
            document.querySelectorAll('.voucher-tab-panel').forEach(panel => {
                panel.classList.toggle('is-active', panel.dataset.panel === tabName);
            });
        }

        function setVoucherFieldValues(voucherDetails) {
            const details = voucherDetails || getEmptyVoucherDetails();
            const pickupDrop = details.pickupDrop || details.transport || {};
            const transport = details.transport || {};
            const fieldMap = {
                pickupRequired: pickupDrop.pickupRequired || 'Yes',
                pickupTaxiNo: pickupDrop.pickupTaxiNo || '',
                pickupCabType: pickupDrop.pickupCabType || '',
                pickupTime: pickupDrop.pickupTime || '',
                dropRequired: pickupDrop.dropRequired || 'Yes',
                dropTaxiNo: pickupDrop.dropTaxiNo || '',
                dropCabType: pickupDrop.dropCabType || '',
                dropTime: pickupDrop.dropTime || '',
                transportMode: transport.transportMode || 'Flight',
                transportInfo: transport.transportInfo || '',
                transportReference: transport.transportReference || '',
                transportNotes: transport.transportNotes || ''
            };

            Object.entries(fieldMap).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) element.value = value;
            });

            const fileInput = document.getElementById('transportDocument');
            if (fileInput) {
                fileInput.value = '';
                fileInput.dataset.existingName = transport.transportDocumentName || '';
            }
            updateTransportDocumentStatus(transport.transportDocumentName || '');
            renderHotelStayForms(details.hotelStays || []);
            renderSightseeingForms(details.sightseeing || []);
            updatePickupDropVisibility();
            updateVoucherTransportVisibility();
        }

        function getVoucherFieldValues() {
            const pickupRequired = document.getElementById('pickupRequired')?.value || 'Yes';
            const dropRequired = document.getElementById('dropRequired')?.value || 'Yes';
            const transportMode = document.getElementById('transportMode')?.value || 'Flight';
            const modeConfig = getTransportModeConfig(transportMode);

            return {
                pickupDrop: {
                    pickupRequired,
                    pickupTaxiNo: pickupRequired === 'Yes' ? document.getElementById('pickupTaxiNo')?.value.trim() || '' : '',
                    pickupCabType: pickupRequired === 'Yes' ? document.getElementById('pickupCabType')?.value.trim() || '' : '',
                    pickupTime: pickupRequired === 'Yes' ? document.getElementById('pickupTime')?.value.trim() || '' : '',
                    dropRequired,
                    dropTaxiNo: dropRequired === 'Yes' ? document.getElementById('dropTaxiNo')?.value.trim() || '' : '',
                    dropCabType: dropRequired === 'Yes' ? document.getElementById('dropCabType')?.value.trim() || '' : '',
                    dropTime: dropRequired === 'Yes' ? document.getElementById('dropTime')?.value.trim() || '' : ''
                },
                transport: {
                    transportMode,
                    transportInfo: document.getElementById('transportInfo')?.value.trim() || '',
                    transportReference: modeConfig.showReference ? document.getElementById('transportReference')?.value.trim() || '' : '',
                    transportNotes: document.getElementById('transportNotes')?.value.trim() || ''
                },
                hotelStays: getHotelStayFormValues(),
                sightseeing: getSightseeingFormValues()
            };
        }

        function openVoucherModal(bookingId) {
            const booking = state.bookings.find(b => b.id === bookingId);
            if (!booking) return;
            const lead = state.leads.find(l => l.id === booking.leadId);
            document.getElementById('voucherBookingId').value = bookingId;
            document.getElementById('voucherBookingSummary').innerHTML = `
                <div class="fw-600 mb-10">${lead?.name || 'Customer'}</div>
                <div class="text-13">Booking Ref: ${booking.bookingRef}</div>
                <div class="text-13">Destination: ${lead?.destination || '-'}</div>
                <div class="text-13">Travel Date: ${booking.travelDate || lead?.travelDate || '-'}</div>
            `;
            setVoucherFieldValues(booking.voucherDetails || getEmptyVoucherDetails());
            switchVoucherTab('pickupdrop');
            document.getElementById('voucherModal').classList.add('show');
        }

        async function saveVoucherDetails() {
            const bookingId = Number(document.getElementById('voucherBookingId')?.value);
            const booking = state.bookings.find(b => b.id === bookingId);
            if (!booking) return;

            const voucherDetails = getVoucherFieldValues();
            const existingTransport = booking.voucherDetails?.transport || {};
            voucherDetails.transport = {
                ...voucherDetails.transport,
                ...await getVoucherTransportDocument(existingTransport)
            };

            booking.voucherDetails = voucherDetails;
            if (getNormalizedBookingStatus(booking) === 'Pending') {
                booking.bookingStatus = 'In Process';
            }

            closeModal('voucherModal');
            window.renderBookingsTable();
            showToast('Details Saved', `Booking details updated for ${booking.bookingRef}`);
        }

        function createVoucherDetailRows(entries) {
            return entries.map(([label, value]) => `
                <div class="summary-row"><span>${label}</span>${String(value || '').trim().startsWith('<') ? value : `<strong>${value || '-'}</strong>`}</div>
            `).join('');
        }

        function formatVoucherDateTime(value) {
            if (!value) return '-';
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return value;
            return date.toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function createVoucherDownloadButton(bookingId, transport) {
            if (!transport.transportDocumentData || !transport.transportDocumentName) return '';
            const buttonLabel = transport.transportMode === 'Train'
                ? 'Download Train Ticket'
                : transport.transportMode === 'Flight'
                    ? 'Download Flight Ticket'
                    : 'Download Document';
            return `<button class="btn-outline btn-sm" data-onclick="downloadVoucherTransportDocument(${bookingId})">${buttonLabel}</button>`;
        }

        function createTransportDocumentSection(bookingId, transport) {
            const downloadButton = createVoucherDownloadButton(bookingId, transport);
            if (!downloadButton) {
                return `
                    <div class="voucher-inline-note mt-15">
                        <span>Uploaded Ticket / Document</span>
                        <strong>Not uploaded</strong>
                    </div>
                `;
            }
            return `
                <div class="voucher-download-card mt-15">
                    <div>
                        <div class="voucher-download-title">${transport.transportDocumentName || 'Uploaded Ticket / Document'}</div>
                        <div class="voucher-download-subtitle">${transport.transportMode || 'Transport'} document ready to download</div>
                    </div>
                    <div class="voucher-download-action">${downloadButton}</div>
                </div>
            `;
        }

        function hasHotelStayData(stay) {
            return Boolean(stay.hotelName || stay.hotelType || stay.roomCount || stay.roomType || stay.stayFor || stay.hotelLocation || stay.mealType);
        }

        function createHotelStayAccordion(title, stay, isOpen = false) {
            if (!hasHotelStayData(stay)) return '';
            return `
                <details class="voucher-accordion" ${isOpen ? 'open' : ''}>
                    <summary>
                        <span>${title}</span>
                        <strong>${stay.hotelName || 'Hotel pending'}</strong>
                    </summary>
                    <div class="voucher-accordion-body">
                        ${createVoucherDetailRows([
                            ['Hotel Name', stay.hotelName],
                            ['Hotel Type', stay.hotelType],
                            ['No. of Room', stay.roomCount],
                            ['Room Type', stay.roomType],
                            ['Stay For', stay.stayFor],
                            ['Hotel Location', stay.hotelLocation],
                            ['Meal Type', stay.mealType]
                        ])}
                    </div>
                </details>
            `;
        }

        function viewVoucherDetails(bookingId) {
            const booking = state.bookings.find(b => b.id === bookingId);
            if (!booking) return;
            if (!booking.voucherDetails) {
                showToast('Details Missing', 'Please add booking details first.', 'warning');
                return;
            }

            const lead = state.leads.find(l => l.id === booking.leadId);
            const pickupDrop = booking.voucherDetails.pickupDrop || booking.voucherDetails.transport || {};
            const transport = booking.voucherDetails.transport || {};
            const hotelStays = booking.voucherDetails.hotelStays || [];
            const sightseeing = booking.voucherDetails.sightseeing || [];

            document.getElementById('voucherViewContent').innerHTML = `
                <div class="summary-box mb-15">
                    <div class="fw-600 mb-10">${lead?.name || 'Customer'}</div>
                    <div class="text-13">Booking Ref: ${booking.bookingRef}</div>
                    <div class="text-13">Destination: ${lead?.destination || '-'}</div>
                    <div class="text-13">Booking Status: ${getNormalizedBookingStatus(booking)}</div>
                </div>
                <div class="voucher-view-grid">
                    <div class="voucher-view-card">
                        <div class="text-12 text-muted mb-10">Pick & Drop</div>
                        ${createVoucherDetailRows([
                            ['Pickup Required', pickupDrop.pickupRequired],
                            ['Pickup Taxi No.', pickupDrop.pickupRequired === 'Yes' ? pickupDrop.pickupTaxiNo : '-'],
                            ['Pickup Cab Type', pickupDrop.pickupRequired === 'Yes' ? pickupDrop.pickupCabType : '-'],
                            ['Pickup Time', pickupDrop.pickupRequired === 'Yes' ? formatVoucherDateTime(pickupDrop.pickupTime) : '-'],
                            ['Drop Required', pickupDrop.dropRequired],
                            ['Drop Taxi No.', pickupDrop.dropRequired === 'Yes' ? pickupDrop.dropTaxiNo : '-'],
                            ['Drop Cab Type', pickupDrop.dropRequired === 'Yes' ? pickupDrop.dropCabType : '-'],
                            ['Drop Time', pickupDrop.dropRequired === 'Yes' ? formatVoucherDateTime(pickupDrop.dropTime) : '-']
                        ])}
                    </div>
                    <div class="voucher-view-card">
                        <div class="text-12 text-muted mb-10">Transport</div>
                        ${createVoucherDetailRows([
                            ['Mode', transport.transportMode],
                            ['Transport Details', transport.transportInfo],
                            ['Ticket / PNR', transport.transportReference],
                            ['Notes', transport.transportNotes]
                        ])}
                        ${createTransportDocumentSection(bookingId, transport)}
                    </div>
                    <div class="voucher-view-card">
                        <div class="text-12 text-muted mb-10">Hotel</div>
                        ${(hotelStays.length ? hotelStays : [{}]).map((stay, index) => createHotelStayAccordion(`Day ${index + 1}`, stay, index === 0)).join('')}
                    </div>
                    <div class="voucher-view-card">
                        <div class="text-12 text-muted mb-10">Sightseeing</div>
                        ${sightseeing.length ? sightseeing.map((item, index) => `
                            <details class="voucher-accordion" ${index === 0 ? 'open' : ''}>
                                <summary>
                                    <span>Sightseeing ${index + 1}</span>
                                    <strong>${formatVoucherDateTime(item.dateTime)}</strong>
                                </summary>
                                <div class="voucher-accordion-body">
                                    ${createVoucherDetailRows([
                                        ['Date & Time', formatVoucherDateTime(item.dateTime)],
                                        ['Details', item.details]
                                    ])}
                                </div>
                            </details>
                        `).join('') : '<div class="voucher-inline-note"><span>Sightseeing</span><strong>Not added</strong></div>'}
                    </div>
                </div>
            `;
            document.getElementById('voucherViewModal').classList.add('show');
        }

        function downloadVoucherTransportDocument(bookingId) {
            const booking = state.bookings.find(b => b.id === bookingId);
            const transport = booking?.voucherDetails?.transport || {};
            if (!transport.transportDocumentData || !transport.transportDocumentName) {
                showToast('Document Missing', 'Travel document uploaded nahi hai.', 'warning');
                return;
            }

            const link = document.createElement('a');
            link.href = transport.transportDocumentData;
            link.download = transport.transportDocumentName;
            document.body.appendChild(link);
            link.click();
            link.remove();
        }

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
            const paymentTermPercent = paymentType === 'full' ? 100 : Number(paymentType || 25);
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
                    const advanceDueAmount = Math.round((quote.total * paymentTermPercent) / 100);
                    const newBooking = {
                        id: (state.bookings?.length || 0) + 2000,
                        bookingRef: `SOL-BK-${String((state.bookings?.length || 0) + 1).padStart(3,'0')}`,
                        leadId: quote.leadId,
                        quoteId: quote.id,
                        totalAmount: quote.total,
                        paidAmount: paymentType === 'full' ? quote.total : 0,
                        paymentStatus: paymentType === 'full' ? 'full' : 'pending',
                        paymentDate: paymentType === 'full' ? new Date().toISOString().split('T')[0] : null,
                        travelDate: travelDate || lead.travelDate,
                        status: paymentType === 'full' ? 'confirmed' : 'pending_payment',
                        paymentMode: null,
                        paymentTermPercent,
                        advanceDueAmount,
                        specialRequests: requests,
                        bookingStatus: 'Pending'
                    };
                    
                    if (!state.bookings) state.bookings = [];
                    state.bookings.push(newBooking);
                    lead.status = 'won';
                    
                    closeModal('newBookingModal');
                    renderBookingsTable();
                    updateBookingStats();
                    
                    if (paymentType === 'full') {
                        showToast('Booking Created', `Booking ${newBooking.bookingRef} confirmed with full payment`);
                    } else {
                        showToast('Booking Created', `Booking ${newBooking.bookingRef} created. Please collect ${paymentTermPercent}% advance payment.`);
                        // Open payment modal
                        setTimeout(() => openPaymentModal(newBooking.id), 500);
                    }
                }
            }
        }

        function getBookingTermAmount(booking, termValue) {
            const total = Number(booking.totalAmount || 0);
            const paid = Number(booking.paidAmount || 0);
            const pending = Math.max(total - paid, 0);
            if (termValue === 'advance') {
                return Math.min(Math.max(Number(booking.advanceDueAmount || 0) - paid, 0) || pending, pending);
            }
            if (termValue === '100') return pending;
            return Math.min(Math.round((total * Number(termValue || booking.paymentTermPercent || 25)) / 100), pending);
        }

        function applyBookingPaymentTerm() {
            const bookingId = Number(document.getElementById('paymentBookingId')?.value);
            const termValue = document.getElementById('paymentTermQuickSelect')?.value || 'advance';
            const booking = state.bookings.find(b => b.id === bookingId);
            if (!booking) return;
            document.getElementById('paymentAmount').value = getBookingTermAmount(booking, termValue);
        }

        function openPaymentModal(bookingId) {
            if (typeof state !== 'undefined' && state.bookings) {
                const booking = state.bookings.find(b => b.id == bookingId);
                const lead = state.leads.find(l => l.id === booking.leadId);
                
                if (booking && lead) {
                    const pending = booking.totalAmount - (booking.paidAmount || 0);
                    const termPercent = Number(booking.paymentTermPercent || 25);
                    const advanceDue = Number(booking.advanceDueAmount || Math.round((booking.totalAmount * termPercent) / 100));
                    document.getElementById('paymentBookingId').value = bookingId;
                    document.getElementById('paymentTermQuickSelect').value = 'advance';
                    document.getElementById('paymentAmount').value = getBookingTermAmount(booking, 'advance');
                    document.getElementById('paymentMode').value = 'UPI';
                    document.getElementById('transactionId').value = '';
                    document.getElementById('paymentNotes').value = '';
                    
                    document.getElementById('bookingPaymentDetails').innerHTML = `
                        <div><strong>${lead.name}</strong></div>
                        <div>Booking: ${booking.bookingRef} | Destination: ${lead.destination}</div>
                        <div>Total: ₹${booking.totalAmount.toLocaleString()} | Paid: ₹${(booking.paidAmount || 0).toLocaleString()}</div>
                        <div>Payment Term: ${termPercent}% advance | Advance Due: ₹${advanceDue.toLocaleString()}</div>
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
                    const paymentDate = new Date().toISOString().split('T')[0];
                    const existingPaidAmount = Number(booking.paidAmount || 0);
                    const newPaidAmount = (booking.paidAmount || 0) + amount;
                    booking.paidAmount = newPaidAmount;
                    booking.paymentStatus = newPaidAmount >= booking.totalAmount ? 'full' : 'partial';
                    if (newPaidAmount >= booking.totalAmount && getNormalizedBookingStatus(booking) === 'Pending') {
                        booking.bookingStatus = 'Confirm';
                    } else if (newPaidAmount > 0 && getNormalizedBookingStatus(booking) === 'Pending') {
                        booking.bookingStatus = 'In Process';
                    }
                    booking.paymentDate = paymentDate;
                    booking.lastPaymentDate = paymentDate;
                    if (existingPaidAmount === 0 && amount > 0) {
                        booking.firstPaymentDate = paymentDate;
                        booking.advancePaymentDate = paymentDate;
                    }
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
                        date: paymentDate
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
            if (tbody?.dataset.static === 'true') return;
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
                    if (tbody.dataset.static === 'true') {
                        renderTransactions();
                        return;
                    }
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
                        const owner = b.assignedTo || lead?.assignedTo || 'Unassigned';
                        const incentive = Number(b.incentiveAmount || 0);
                        const paymentInfo = getAdvancePaymentInfo(b);
                        const paidOnDate = formatBookingDate(paymentInfo.lastDate);
                        const bookingStatus = getNormalizedBookingStatus(b);
                        const voucherSaved = Boolean(b.voucherDetails);
                        return `
                            <tr>
                                <td><strong>${b.bookingRef}</strong></td>
                                <td>${lead?.name || 'Unknown'}</td>
                                <td>${lead?.destination || '-'}</td>
                                <td>₹${(b.totalAmount || 0).toLocaleString()}<br><small style="color: #64748b;">Booking Value</small></td>
                                <td>₹${(b.paidAmount || 0).toLocaleString()}<br><small style="color: #64748b;">Paid till ${paidOnDate}</small></td>
                                <td><span style="color: ${pending > 0 ? '#f59e0b' : '#10b981'};">₹${pending.toLocaleString()}</span><br><small style="color: #64748b;">Updated ${paidOnDate}</small></td>
                                <td><span class="status-badge status-${b.paymentStatus === 'full' ? 'won' : b.paymentStatus === 'partial' ? 'partial' : 'new'}">${b.paymentStatus}</span></td>
                                <td><span class="status-badge ${getBookingStatusBadgeClass(bookingStatus)}">${bookingStatus}</span></td>
                                <td>${owner}</td>
                                <td>₹${incentive.toLocaleString()}</td>
                                <td>${b.travelDate || '-'}</td>
                                <td>${formatAdvanceCell(paymentInfo)}</td>
                                <td>${formatLastPaymentCell(paymentInfo)}</td>
                                <td>${b.paymentStatus !== 'full' ? '<span style="color: #e94560;">Immediate</span>' : '-'}</td>
                                <td>
                                    <div class="table-actions">
                                    ${b.paymentStatus !== 'full' ? `<button class="btn-primary btn-sm" data-onclick="openPaymentModal(${b.id})">Pay Now</button>` : ''}
                                    <button class="btn-outline btn-sm btn-icon" data-onclick="viewBookingDetails(${b.id})"><i class="fas fa-eye"></i></button>
                                    </div>
                                </td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-primary btn-sm" data-onclick="openVoucherModal(${b.id})">Add</button>
                                        <button class="btn-outline btn-sm" data-onclick="viewVoucherDetails(${b.id})">View</button>
                                    </div>
                                    <small style="color: #64748b;">${voucherSaved ? 'Details saved' : 'Not added yet'}</small>
                                </td>
                            </tr>
                        `;
                    }).join('');
                    
                    if (bookings.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="16" style="text-align: center;">No bookings found</td></tr>';
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
            if (!booking) return;
            const lead = state.leads.find(l => l.id === booking.leadId);
            const pending = (booking.totalAmount || 0) - (booking.paidAmount || 0);
            const paymentInfo = getAdvancePaymentInfo(booking);
            const paymentHistoryMarkup = paymentInfo.transactions.length
                ? paymentInfo.transactions.map(transaction => `
                    <div class="summary-box mb-10">
                        <div class="summary-row"><span>Date</span><strong>${formatBookingDate(transaction.date)}</strong></div>
                        <div class="summary-row"><span>Amount</span><strong>₹${Number(transaction.amount || 0).toLocaleString()}</strong></div>
                        <div class="summary-row"><span>Mode</span><strong>${transaction.mode || 'N/A'}</strong></div>
                        <div class="summary-row"><span>Transaction ID</span><strong>${transaction.transactionId || 'N/A'}</strong></div>
                        <div class="summary-row"><span>Notes</span><strong>${transaction.notes || 'N/A'}</strong></div>
                    </div>
                `).join('')
                : '<div class="summary-box">No payment history recorded for this booking yet.</div>';
            const content = document.getElementById('bookingInfoContent');
            if (booking && lead) {
                content.innerHTML = `
                    <div class="summary-box mb-15">
                        <div class="fw-600 mb-10">${lead.name}</div>
                        <div class="text-13">Booking Ref: ${booking.bookingRef}</div>
                        <div class="text-13">Destination: ${lead.destination || '-'}</div>
                        <div class="text-13">Travel Date: ${booking.travelDate || lead.travelDate || '-'}</div>
                    </div>
                    <div class="grid-2-form mb-15">
                        <div class="summary-box">
                            <div class="text-12 text-muted mb-10">Commercial</div>
                            <div class="summary-row"><span>Total Amount</span><strong>₹${(booking.totalAmount || 0).toLocaleString()}</strong></div>
                            <div class="summary-row"><span>Paid Amount</span><strong>₹${(booking.paidAmount || 0).toLocaleString()}</strong></div>
                            <div class="summary-row"><span>Pending</span><strong>₹${pending.toLocaleString()}</strong></div>
                            <div class="summary-row"><span>Advance Paid On</span><strong>${formatBookingDate(paymentInfo.firstDate)}</strong></div>
                            <div class="summary-row"><span>Advance Amount</span><strong>₹${Number(paymentInfo.firstAmount || 0).toLocaleString()}</strong></div>
                        </div>
                        <div class="summary-box">
                        <div class="text-12 text-muted mb-10">Operations</div>
                            <div class="summary-row"><span>Payment Status</span><strong>${booking.paymentStatus}</strong></div>
                            <div class="summary-row"><span>Booking Status</span><strong>${getNormalizedBookingStatus(booking)}</strong></div>
                            <div class="summary-row"><span>Payment Mode</span><strong>${booking.paymentMode || 'Not captured'}</strong></div>
                            <div class="summary-row"><span>Last Payment On</span><strong>${formatBookingDate(paymentInfo.lastDate)}</strong></div>
                            <div class="summary-row"><span>Last Payment Amount</span><strong>₹${Number(paymentInfo.lastAmount || 0).toLocaleString()}</strong></div>
                        </div>
                    </div>
                    <div class="summary-box">
                        <div class="text-12 text-muted mb-10">Lead Context</div>
                        <div class="summary-row"><span>Assigned To</span><strong>${booking.assignedTo || lead.assignedTo || 'Unassigned'}</strong></div>
                        <div class="summary-row"><span>Package Type</span><strong>${booking.packageType || lead.packageType || 'standard'}</strong></div>
                        <div class="summary-row"><span>Trip Type</span><strong>${booking.tripType || lead.tripType || 'domestic'}</strong></div>
                        <div class="summary-row"><span>Special Requests</span><strong>${booking.specialRequests || 'None'}</strong></div>
                        <div class="summary-row"><span>Voucher</span><strong>${booking.voucherDetails ? 'Prepared' : 'Pending'}</strong></div>
                    </div>
                    <div>
                        <div class="text-12 text-muted mb-10">Payment History</div>
                        ${paymentHistoryMarkup}
                    </div>
                `;
                document.getElementById('bookingInfoModal').classList.add('show');
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
                initializeBookingOperationsData();
                document.getElementById('bookingsTableBody')?.setAttribute('data-static', 'false');
                document.getElementById('transactionsTableBody')?.setAttribute('data-static', 'false');
                updateBookingStats();
                window.renderBookingsTable();
                document.getElementById('transportDocument')?.addEventListener('change', event => {
                    updateTransportDocumentStatus(event.target?.files?.[0]?.name || '');
                });
                
                document.getElementById('searchBookings')?.addEventListener('keyup', () => window.renderBookingsTable());
                document.getElementById('filterPaymentStatus')?.addEventListener('change', () => window.renderBookingsTable());
            }
        });
