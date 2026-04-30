let travelerDocumentProfiles = [];
let filteredTravelerProfiles = [];
let selectedTravelerId = null;
let editingDocumentId = null;
let previewingDocumentId = null;

const documentTypeCatalog = {
    aadhaar: { label: 'Aadhaar Card', category: 'identity', scope: 'domestic', icon: 'fa-id-card', usedFor: 'Hotel and airline identity validation', priority: 'high' },
    pan: { label: 'PAN Card', category: 'finance', scope: 'all', icon: 'fa-money-check-dollar', usedFor: 'Payment, invoicing and TCS/forex support', priority: 'medium' },
    passport: { label: 'Passport Front & Back', category: 'identity', scope: 'international', icon: 'fa-passport', usedFor: 'Visa processing and international ticketing', priority: 'critical' },
    visa: { label: 'Visa Copy', category: 'compliance', scope: 'international', icon: 'fa-stamp', usedFor: 'Immigration clearance and airline compliance', priority: 'critical' },
    passport_photo: { label: 'Passport Size Photo', category: 'compliance', scope: 'international', icon: 'fa-camera', usedFor: 'Visa filing and supplier paperwork', priority: 'medium' },
    flight_ticket: { label: 'Flight Ticket', category: 'travel', scope: 'all', icon: 'fa-ticket', usedFor: 'Airport check-in and PNR sharing', priority: 'high' },
    hotel_voucher: { label: 'Hotel Booking Voucher', category: 'travel', scope: 'all', icon: 'fa-hotel', usedFor: 'Check-in desk handoff and stay confirmation', priority: 'high' },
    travel_insurance: { label: 'Travel Insurance', category: 'compliance', scope: 'international', icon: 'fa-shield-heart', usedFor: 'Emergency support and visa compliance', priority: 'medium' },
    payment_receipt: { label: 'Payment Receipt', category: 'finance', scope: 'all', icon: 'fa-receipt', usedFor: 'Accounts audit and traveler handoff', priority: 'medium' },
    minor_id: { label: 'Minor ID / Birth Certificate', category: 'compliance', scope: 'all', icon: 'fa-child', usedFor: 'Age proof for child fare and hotel record', priority: 'medium' }
};

function getDocumentPartOptions(type) {
    return ['aadhaar', 'passport'].includes(type)
        ? ['Single File', 'Front', 'Back']
        : ['Document'];
}

function normalizeDocumentAttachments(doc = {}) {
    if (Array.isArray(doc.attachments) && doc.attachments.length) {
        return doc.attachments;
    }

    if (doc.fileName) {
        return [{
            label: 'Document',
            fileName: doc.fileName,
            fileSize: doc.fileSize || '',
            previewUrl: doc.previewUrl || '',
            mimeType: doc.mimeType || '',
            uploadedOn: doc.uploadedOn || ''
        }];
    }

    return [];
}

function isDocumentUploadComplete(doc = {}) {
    const attachments = normalizeDocumentAttachments(doc);
    const labels = new Set(attachments.map(item => item.label));

    if (['aadhaar', 'passport'].includes(doc.type)) {
        return labels.has('Single File') || (labels.has('Front') && labels.has('Back'));
    }

    return attachments.length > 0;
}

function getEffectiveDocumentStatus(doc = {}) {
    if (doc.status === 'verified') return 'verified';
    if (doc.status === 'rejected') return 'rejected';

    const attachments = normalizeDocumentAttachments(doc);
    if (!attachments.length) return 'missing';
    if (!isDocumentUploadComplete(doc)) return 'pending';
    return 'uploaded';
}

function escapeDocumentHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getDocumentStatusClass(status) {
    return ({ verified: 'won', uploaded: 'quotation', pending: 'new', missing: 'new', rejected: 'negotiation' })[status] || 'new';
}

function getDocumentStatusLabel(status) {
    return ({ verified: 'Verified', uploaded: 'Uploaded', pending: 'Pending', missing: 'Pending', rejected: 'Needs Correction' })[status] || 'Pending';
}

function getPriorityLabel(priority) {
    return ({ critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' })[priority] || 'Medium';
}

function formatDocumentDate(value) {
    if (!value) return 'Not set';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getDaysUntil(dateValue) {
    if (!dateValue) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateValue);
    date.setHours(0, 0, 0, 0);
    return Math.round((date - today) / 86400000);
}

function getDepartureLabel(dateValue) {
    const days = getDaysUntil(dateValue);
    if (days === null) return 'Travel date pending';
    if (days < 0) return 'Travel date passed';
    if (days === 0) return 'Departure today';
    if (days === 1) return 'Departure tomorrow';
    return `${days} days left`;
}

function getDueDateForLead(lead, offsetDays) {
    if (!lead?.travelDate || typeof window.getDateAfterDays !== 'function') return '';
    return window.getDateAfterDays(lead.travelDate, offsetDays);
}

function buildDocumentTemplatesForLead(lead) {
    const isInternational = lead.tripType === 'international';
    const templates = [];

    if (isInternational) {
        templates.push({ type: 'passport', dueDate: getDueDateForLead(lead, -30) });
        templates.push({ type: 'visa', dueDate: getDueDateForLead(lead, -20) });
        templates.push({ type: 'passport_photo', dueDate: getDueDateForLead(lead, -22) });
        templates.push({ type: 'travel_insurance', dueDate: getDueDateForLead(lead, -10) });
    } else {
        templates.push({ type: 'aadhaar', dueDate: getDueDateForLead(lead, -7) });
    }

    templates.push({ type: 'pan', dueDate: getDueDateForLead(lead, -10) });

    if (['contacted', 'interested', 'quotation_sent', 'negotiation', 'won'].includes(lead.status)) {
        templates.push({ type: 'flight_ticket', dueDate: getDueDateForLead(lead, -5) });
        templates.push({ type: 'hotel_voucher', dueDate: getDueDateForLead(lead, -4) });
        templates.push({ type: 'payment_receipt', dueDate: getDueDateForLead(lead, -3) });
    }

    if ((lead.travelerBreakdown?.children || 0) > 0 || (lead.travelerBreakdown?.infants || 0) > 0) {
        templates.push({ type: 'minor_id', dueDate: getDueDateForLead(lead, -12) });
    }

    return templates.map(template => {
        const meta = documentTypeCatalog[template.type];
        return {
            id: `generated-${lead.id}-${template.type}`,
            leadId: lead.id,
            type: template.type,
            label: meta.label,
            travelerName: lead.name,
            category: meta.category,
            scope: meta.scope,
            icon: meta.icon,
            usedFor: meta.usedFor,
            priority: meta.priority,
            dueDate: template.dueDate,
            status: 'pending',
            fileName: '',
            fileSize: '',
            uploadedOn: '',
            verifiedOn: '',
            verifiedBy: '',
            notes: 'Recommended as part of the pre-travel checklist.',
            previewUrl: '',
            mimeType: ''
        };
    });
}

function mergeLeadDocuments(lead) {
    const templates = buildDocumentTemplatesForLead(lead);
    const savedDocs = Array.isArray(window.state?.documents) ? window.state.documents.filter(doc => Number(doc.leadId) === Number(lead.id)) : [];
    const map = new Map();

    templates.forEach(doc => map.set(`${doc.type}-${doc.travelerName}`, doc));
    savedDocs.forEach(doc => {
        const meta = documentTypeCatalog[doc.type] || {};
        const travelerName = doc.travelerName || lead.name;
        map.set(`${doc.type}-${travelerName}`, {
            icon: meta.icon || 'fa-file-lines',
            usedFor: meta.usedFor || doc.usedFor || 'Travel documentation reference',
            priority: doc.priority || meta.priority || 'medium',
            category: doc.category || meta.category || 'travel',
            scope: doc.scope || meta.scope || 'all',
            label: doc.label || meta.label || doc.type,
            ...doc,
            attachments: normalizeDocumentAttachments(doc),
            travelerName
        });
    });

    return Array.from(map.values()).map(doc => ({
        ...doc,
        attachments: normalizeDocumentAttachments(doc),
        status: getEffectiveDocumentStatus(doc)
    })).sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const statusOrder = { missing: 0, rejected: 1, pending: 2, uploaded: 3, verified: 4 };
        const priorityDiff = (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
        if (priorityDiff !== 0) return priorityDiff;
        return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
    });
}

function buildTravelerDocumentProfiles() {
    const leads = Array.isArray(window.state?.leads) ? window.state.leads.filter(lead => lead.status !== 'lost') : [];
    const bookings = Array.isArray(window.state?.bookings) ? window.state.bookings : [];

    travelerDocumentProfiles = leads.map(lead => {
        const docs = mergeLeadDocuments(lead);
        const booking = bookings.find(item => Number(item.leadId) === Number(lead.id));
        const verifiedCount = docs.filter(doc => doc.status === 'verified').length;
        const pendingCount = docs.filter(doc => ['pending', 'missing', 'rejected'].includes(doc.status)).length;
        const uploadedCount = docs.filter(doc => doc.status === 'uploaded').length;

        return {
            id: lead.id,
            name: lead.name,
            destination: lead.destination,
            tripType: lead.tripType || 'domestic',
            assignedTo: lead.assignedTo || 'Unassigned',
            travelDate: lead.travelDate || '',
            status: lead.status,
            travelers: lead.travelers || 0,
            travelerBreakdown: lead.travelerBreakdown || {},
            bookingRef: booking?.bookingRef || 'Pre-booking',
            docs,
            verifiedCount,
            pendingCount,
            uploadedCount,
            completion: docs.length ? Math.round((verifiedCount / docs.length) * 100) : 0
        };
    }).sort((a, b) => {
        const urgentDiff = b.pendingCount - a.pendingCount;
        if (urgentDiff !== 0) return urgentDiff;
        return a.completion - b.completion;
    });

    filteredTravelerProfiles = [...travelerDocumentProfiles];
}

function updateDocumentStats() {
    const allDocs = travelerDocumentProfiles.flatMap(profile => profile.docs);
    const pendingItems = allDocs.filter(doc => ['pending', 'missing', 'rejected'].includes(doc.status)).length;
    const verifiedItems = allDocs.filter(doc => doc.status === 'verified').length;
    const completion = allDocs.length ? Math.round((verifiedItems / allDocs.length) * 100) : 0;
    const urgentDepartures = travelerDocumentProfiles.filter(profile => {
        const days = getDaysUntil(profile.travelDate);
        return days !== null && days >= 0 && days <= 7;
    }).length;

    document.getElementById('docsTotalTravelers').textContent = travelerDocumentProfiles.length;
    document.getElementById('docsPendingItems').textContent = pendingItems;
    document.getElementById('docsVerifiedItems').textContent = `${completion}%`;
    document.getElementById('docsUrgentDepartures').textContent = urgentDepartures;
}

function applyDocumentFilters() {
    const search = document.getElementById('documentSearch')?.value?.trim().toLowerCase() || '';
    const trip = document.getElementById('documentTripFilter')?.value || '';
    const status = document.getElementById('documentStatusFilter')?.value || '';
    const type = document.getElementById('documentTypeFilter')?.value || '';

    filteredTravelerProfiles = travelerDocumentProfiles.filter(profile => {
        const searchableText = `${profile.name} ${profile.destination} ${profile.bookingRef} ${profile.docs.map(doc => `${doc.label} ${doc.notes || ''}`).join(' ')}`.toLowerCase();
        const matchesSearch = !search || searchableText.includes(search);
        const matchesTrip = !trip || profile.tripType === trip;
        const matchesStatus = !status || profile.docs.some(doc => doc.status === status);
        const matchesType = !type || profile.docs.some(doc => doc.category === type);
        return matchesSearch && matchesTrip && matchesStatus && matchesType;
    });

    if (!filteredTravelerProfiles.some(profile => profile.id === selectedTravelerId)) {
        selectedTravelerId = filteredTravelerProfiles[0]?.id || null;
    }

    renderTravelerDocumentList();
    renderDocumentProfile();
}

function resetDocumentFilters() {
    ['documentSearch', 'documentTripFilter', 'documentStatusFilter', 'documentTypeFilter'].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
    applyDocumentFilters();
}

function renderTravelerDocumentList() {
    const list = document.getElementById('travelerDocumentList');
    const count = document.getElementById('documentsTravelerCount');
    if (!list || !count) return;

    count.textContent = `Showing ${filteredTravelerProfiles.length} traveler${filteredTravelerProfiles.length === 1 ? '' : 's'}`;

    if (!filteredTravelerProfiles.length) {
        list.innerHTML = `
            <div class="empty-state" style="min-height: 320px;">
                <i class="fas fa-folder-minus icon-48"></i>
                <h3>No traveler files found</h3>
                <p>Try another filter or upload the first document for a booking.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = filteredTravelerProfiles.map(profile => `
        <div class="traveler-file-row ${profile.id === selectedTravelerId ? 'active' : ''}" data-onclick="selectTravelerDocumentProfile(${profile.id})">
            <div class="traveler-file-top">
                <div>
                    <h4>${escapeDocumentHtml(profile.name)}</h4>
                    <p>${escapeDocumentHtml(profile.destination)} | ${escapeDocumentHtml(profile.bookingRef)}</p>
                </div>
                <span class="status-badge status-${profile.tripType === 'international' ? 'quotation' : 'contacted'}">${escapeDocumentHtml(profile.tripType)}</span>
            </div>
            <div class="traveler-file-meta">
                <span><i class="fas fa-user-tie"></i> ${escapeDocumentHtml(profile.assignedTo)}</span>
                <span><i class="fas fa-plane-departure"></i> ${escapeDocumentHtml(getDepartureLabel(profile.travelDate))}</span>
            </div>
            <div class="traveler-progress-line"><div class="traveler-progress-fill" style="width:${profile.completion}%;"></div></div>
            <div class="traveler-file-footer">
                <span>${profile.verifiedCount}/${profile.docs.length} verified</span>
                <span class="traveler-pending-pill ${profile.pendingCount ? 'has-issues' : ''}">${profile.pendingCount} pending</span>
            </div>
        </div>
    `).join('');
}

function renderDocumentProfile() {
    const panel = document.getElementById('documentProfilePanel');
    if (!panel) return;

    const profile = filteredTravelerProfiles.find(item => item.id === selectedTravelerId);
    if (!profile) {
        panel.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open icon-64"></i>
                <h3>Select a traveler file</h3>
                <p>Required IDs, tickets, hotel vouchers and verification notes will appear here.</p>
            </div>
        `;
        return;
    }

    const issueSummary = profile.docs.filter(doc => ['missing', 'pending', 'rejected'].includes(doc.status));
    panel.innerHTML = `
        <div class="documents-hero">
            <div>
                <div class="documents-hero-kicker">${escapeDocumentHtml(profile.bookingRef)} • ${escapeDocumentHtml(profile.tripType)} travel</div>
                <h2>${escapeDocumentHtml(profile.name)}</h2>
                <p>${escapeDocumentHtml(profile.destination)} | ${escapeDocumentHtml(profile.assignedTo)} | ${escapeDocumentHtml(window.formatTravelerBreakdown ? window.formatTravelerBreakdown(profile.travelerBreakdown) : `${profile.travelers} travelers`)}</p>
            </div>
            <div class="documents-hero-badges">
                <span class="soft-badge" style="background:#ecfeff; color:#155e75;">${escapeDocumentHtml(getDepartureLabel(profile.travelDate))}</span>
                <span class="soft-badge" style="background:#eef2ff; color:#4338ca;">${profile.completion}% complete</span>
            </div>
        </div>
        <div class="documents-summary-grid">
            <div class="documents-summary-card"><strong>${profile.verifiedCount}</strong><span>Verified</span></div>
            <div class="documents-summary-card"><strong>${profile.uploadedCount}</strong><span>Uploaded</span></div>
            <div class="documents-summary-card"><strong>${profile.pendingCount}</strong><span>Pending / Missing</span></div>
        </div>
        <div class="documents-alert ${issueSummary.length ? 'is-warning' : 'is-success'}">
            <i class="fas ${issueSummary.length ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i>
            <div>
                <strong>${issueSummary.length ? 'Action required before handoff' : 'File is travel-ready'}</strong>
                <p>${issueSummary.length ? `Still need attention on ${issueSummary.length} document item(s).` : 'Core documents are uploaded and verified for operations.'}</p>
            </div>
        </div>
        <div class="document-card-grid">
            ${profile.docs.map(doc => `
                <article class="document-card ${doc.status === 'verified' ? 'is-verified' : doc.status === 'uploaded' ? 'is-uploaded' : doc.status === 'pending' ? 'is-pending' : doc.status === 'rejected' ? 'is-rejected' : 'is-missing'}">
                    <div class="document-card-top">
                        <div class="document-icon"><i class="fas ${escapeDocumentHtml(doc.icon || 'fa-file-lines')}"></i></div>
                        <div>
                            <h4>${escapeDocumentHtml(doc.label)}</h4>
                            <p>${escapeDocumentHtml(doc.usedFor || 'Travel support')}</p>
                        </div>
                    </div>
                    <div class="document-chip-row">
                        <span class="status-badge status-${getDocumentStatusClass(doc.status)}">${escapeDocumentHtml(getDocumentStatusLabel(doc.status))}</span>
                        <span class="documents-chip">${escapeDocumentHtml(getPriorityLabel(doc.priority))}</span>
                        <span class="documents-chip">${escapeDocumentHtml(doc.category)}</span>
                    </div>
                    <div class="document-meta-list">
                        <span><strong>Traveler:</strong> ${escapeDocumentHtml(doc.travelerName || profile.name)}</span>
                        <span><strong>Due:</strong> ${escapeDocumentHtml(formatDocumentDate(doc.dueDate))}</span>
                        <span><strong>File:</strong> ${escapeDocumentHtml(normalizeDocumentAttachments(doc).map(item => item.label).join(', ') || 'Not uploaded yet')}</span>
                        <span><strong>Uploaded:</strong> ${escapeDocumentHtml(formatDocumentDate(doc.uploadedOn))}</span>
                        <span><strong>Verified By:</strong> ${escapeDocumentHtml(doc.verifiedBy || 'Pending')}</span>
                    </div>
                    <div class="document-note">${escapeDocumentHtml(doc.notes || 'No notes added yet.')}</div>
                    <div class="document-actions">
                        <button class="btn-outline btn-sm-tight" data-onclick="openUploadModal(${profile.id}, '${doc.type}', ${String(doc.id).startsWith('generated-') ? 'null' : doc.id})"><i class="fas fa-upload"></i> ${doc.fileName ? 'Replace' : 'Upload'}</button>
                        <button class="btn-outline btn-sm-tight" data-onclick="previewDocument(${String(doc.id).startsWith('generated-') ? 'null' : doc.id}, ${profile.id}, '${doc.type}')"><i class="fas fa-eye"></i> View</button>
                        <button class="btn-outline btn-sm-tight" data-onclick="setDocumentStatus(${String(doc.id).startsWith('generated-') ? 'null' : doc.id}, ${profile.id}, '${doc.type}', 'verified')"><i class="fas fa-check-circle"></i> Verify</button>
                        <button class="btn-outline btn-sm-tight" data-onclick="setDocumentStatus(${String(doc.id).startsWith('generated-') ? 'null' : doc.id}, ${profile.id}, '${doc.type}', 'rejected')"><i class="fas fa-ban"></i> Flag Issue</button>
                    </div>
                </article>
            `).join('')}
        </div>
    `;
}

function selectTravelerDocumentProfile(id) {
    selectedTravelerId = Number(id);
    renderTravelerDocumentList();
    renderDocumentProfile();
}

function ensureStateDocuments() {
    if (!Array.isArray(window.state.documents)) {
        window.state.documents = [];
    }
    return window.state.documents;
}

function populateUploadForm(leadId, docType, documentId) {
    const leadSelect = document.getElementById('uploadLeadId');
    const docTypeSelect = document.getElementById('uploadDocumentType');
    const partSelect = document.getElementById('uploadDocumentPart');
    if (!leadSelect || !docTypeSelect || !partSelect) return;

    leadSelect.innerHTML = travelerDocumentProfiles.map(profile => `
        <option value="${profile.id}" ${Number(leadId) === Number(profile.id) ? 'selected' : ''}>${escapeDocumentHtml(profile.name)} - ${escapeDocumentHtml(profile.destination)}</option>
    `).join('');

    docTypeSelect.innerHTML = Object.entries(documentTypeCatalog).map(([key, item]) => `
        <option value="${key}" ${docType === key ? 'selected' : ''}>${escapeDocumentHtml(item.label)}</option>
    `).join('');

    const currentDoc = ensureStateDocuments().find(doc => Number(doc.id) === Number(documentId));
    const activeType = docType || currentDoc?.type || 'aadhaar';
    partSelect.innerHTML = getDocumentPartOptions(activeType).map(part => `
        <option value="${part}">${escapeDocumentHtml(part)}</option>
    `).join('');
    document.getElementById('uploadTravelerName').value = currentDoc?.travelerName || travelerDocumentProfiles.find(item => Number(item.id) === Number(leadId))?.name || '';
    document.getElementById('uploadDocumentStatus').value = currentDoc?.status === 'rejected' ? 'rejected' : currentDoc?.status === 'pending' ? 'pending' : 'uploaded';
    document.getElementById('uploadDueDate').value = currentDoc?.dueDate || '';
    document.getElementById('uploadDocumentNotes').value = currentDoc?.notes || '';
    document.getElementById('uploadDocumentFile').value = '';
}

function openUploadModal(leadId, docType, documentId) {
    const defaultLeadId = Number(leadId) || selectedTravelerId || travelerDocumentProfiles[0]?.id;
    if (!defaultLeadId) {
        showToast('No traveler selected', 'Create or load a traveler file before uploading documents.', 'warning');
        return;
    }
    editingDocumentId = documentId ? Number(documentId) : null;
    populateUploadForm(defaultLeadId, docType || 'aadhaar', editingDocumentId);
    openModal('uploadDocumentModal');
}

function saveDocumentUpload() {
    const leadId = Number(document.getElementById('uploadLeadId')?.value);
    const travelerName = document.getElementById('uploadTravelerName')?.value?.trim();
    const type = document.getElementById('uploadDocumentType')?.value;
    const status = document.getElementById('uploadDocumentStatus')?.value || 'uploaded';
    const dueDate = document.getElementById('uploadDueDate')?.value || '';
    const notes = document.getElementById('uploadDocumentNotes')?.value?.trim() || '';
    const file = document.getElementById('uploadDocumentFile')?.files?.[0];
    const filePart = document.getElementById('uploadDocumentPart')?.value || 'Document';
    const stateDocuments = ensureStateDocuments();
    const meta = documentTypeCatalog[type];

    if (!leadId || !travelerName || !type || !meta) {
        showToast('Missing details', 'Please select traveler, document type and traveler name.', 'warning');
        return;
    }

    const existingDoc = editingDocumentId
        ? stateDocuments.find(doc => Number(doc.id) === Number(editingDocumentId))
        : stateDocuments.find(doc => Number(doc.leadId) === Number(leadId) && doc.type === type && (doc.travelerName || '') === travelerName);
    const now = new Date().toISOString().split('T')[0];
    const attachments = normalizeDocumentAttachments(existingDoc);
    const nextAttachments = file
        ? [
            ...attachments.filter(item => item.label !== filePart),
            {
                label: filePart,
                fileName: file.name,
                fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                previewUrl: URL.createObjectURL(file),
                mimeType: file.type || '',
                uploadedOn: now
            }
        ]
        : attachments;
    const uploadedDoc = {
        id: existingDoc?.id || Math.max(9000, ...stateDocuments.map(doc => Number(doc.id) || 0)) + 1,
        leadId,
        type,
        label: meta.label,
        travelerName,
        category: meta.category,
        scope: meta.scope,
        status: status === 'rejected' ? 'rejected' : !nextAttachments.length ? 'missing' : ['aadhaar', 'passport'].includes(type) && !isDocumentUploadComplete({ type, attachments: nextAttachments }) ? 'pending' : 'uploaded',
        priority: meta.priority,
        dueDate,
        fileName: nextAttachments[0]?.fileName || '',
        fileSize: nextAttachments[0]?.fileSize || '',
        uploadedOn: nextAttachments.length ? now : existingDoc?.uploadedOn || '',
        verifiedOn: '',
        verifiedBy: '',
        notes: notes || 'Uploaded from documents desk.',
        usedFor: meta.usedFor,
        previewUrl: nextAttachments[0]?.previewUrl || '',
        mimeType: nextAttachments[0]?.mimeType || '',
        attachments: nextAttachments
    };

    if (existingDoc) {
        Object.assign(existingDoc, uploadedDoc);
    } else {
        stateDocuments.push(uploadedDoc);
    }

    selectedTravelerId = leadId;
    closeModal('uploadDocumentModal');
    buildTravelerDocumentProfiles();
    updateDocumentStats();
    applyDocumentFilters();
    showToast('Document saved', `${meta.label} added for ${travelerName}.`);
}

function getDocumentRecord(documentId, leadId, type) {
    const stateDocuments = ensureStateDocuments();
    return documentId ? stateDocuments.find(doc => Number(doc.id) === Number(documentId)) : stateDocuments.find(doc => Number(doc.leadId) === Number(leadId) && doc.type === type);
}

function setDocumentStatus(documentId, leadId, type, status, silent = false) {
    const existingDoc = getDocumentRecord(documentId, leadId, type);
    const meta = documentTypeCatalog[type];
    const now = new Date().toISOString().split('T')[0];

    if (existingDoc) {
        if (status === 'verified' && !normalizeDocumentAttachments(existingDoc).length) {
            showToast('Upload missing', 'Please upload the document before verifying it.', 'warning');
            return;
        }
        if (status === 'verified' && !isDocumentUploadComplete(existingDoc)) {
            showToast('Upload incomplete', 'Single file or Front + Back upload complete karo, tab verify hoga.', 'warning');
            return;
        }
        existingDoc.status = status;
        existingDoc.verifiedOn = status === 'verified' ? now : '';
        existingDoc.verifiedBy = status === 'verified' ? (window.state?.users?.admin?.name || 'Admin') : '';
        if (!existingDoc.notes && status === 'rejected') {
            existingDoc.notes = 'Please re-upload a clearer copy or correct the mismatch.';
        }
    } else {
        showToast('Upload missing', 'Please upload the document before changing its status.', 'warning');
        return;
    }

    selectedTravelerId = Number(leadId);
    buildTravelerDocumentProfiles();
    updateDocumentStats();
    applyDocumentFilters();
    if (!silent) {
        showToast('Status updated', `${meta?.label || 'Document'} marked as ${getDocumentStatusLabel(status).toLowerCase()}.`);
    }
}

function previewDocument(documentId, leadId, type) {
    const doc = getDocumentRecord(documentId, leadId, type);
    const fallbackMeta = documentTypeCatalog[type] || {};
    const profile = travelerDocumentProfiles.find(item => Number(item.id) === Number(leadId));
    const body = document.getElementById('previewDocumentBody');
    if (!body) return;

    previewingDocumentId = doc?.id || null;
    const footer = document.getElementById('previewDocumentFooter');
    if (footer) {
        footer.innerHTML = `
            <button class="btn-outline" data-onclick="closeModal('previewDocumentModal')">Close</button>
            <button class="btn-outline" data-onclick="verifyPreviewDocument()"><i class="fas fa-check-circle"></i> Verify</button>
        `;
    }

    if (!doc) {
        body.innerHTML = `
            <div class="documents-preview-empty">
                <i class="fas fa-file-circle-question icon-64"></i>
                <h3>${escapeDocumentHtml(fallbackMeta.label || 'Document')}</h3>
                <p>No uploaded file yet. Staff can still track this requirement from the checklist.</p>
            </div>
        `;
        openModal('previewDocumentModal');
        return;
    }

    const previewMarkup = normalizeDocumentAttachments(doc).map(item => {
        if (item.previewUrl && item.mimeType.startsWith('image/')) {
            return `
                <div class="documents-preview-part">
                    <strong>${escapeDocumentHtml(item.label)}</strong>
                    <img src="${item.previewUrl}" alt="${escapeDocumentHtml(doc.label)}" class="documents-preview-image">
                </div>
            `;
        }
        if (item.previewUrl && item.mimeType === 'application/pdf') {
            return `
                <div class="documents-preview-part">
                    <strong>${escapeDocumentHtml(item.label)}</strong>
                    <iframe src="${item.previewUrl}" class="documents-preview-frame" title="${escapeDocumentHtml(doc.label)}"></iframe>
                </div>
            `;
        }
        return `
            <div class="documents-preview-part">
                <strong>${escapeDocumentHtml(item.label)}</strong>
                <div class="documents-preview-placeholder"><i class="fas fa-file-lines icon-64"></i><p>${escapeDocumentHtml(item.fileName || 'Preview unavailable')}</p></div>
            </div>
        `;
    }).join('') || `<div class="documents-preview-placeholder"><i class="fas fa-file-circle-question icon-64"></i><p>No uploaded file yet.</p></div>`;

    body.innerHTML = `
        <div class="documents-preview-shell">
            <div class="documents-preview-meta">
                <div>
                    <strong>${escapeDocumentHtml(doc.label)}</strong>
                    <span>${escapeDocumentHtml(doc.travelerName || profile?.name || 'Traveler')} | ${escapeDocumentHtml(profile?.destination || '')}</span>
                </div>
                <span class="status-badge status-${getDocumentStatusClass(doc.status)}">${escapeDocumentHtml(getDocumentStatusLabel(doc.status))}</span>
            </div>
            <div class="documents-preview-grid">${previewMarkup}</div>
            <div class="documents-preview-details">
                <div><strong>File Type:</strong> ${escapeDocumentHtml(getDocumentPartOptions(doc.type).join(' / '))}</div>
                <div><strong>Uploaded Parts:</strong> ${escapeDocumentHtml(normalizeDocumentAttachments(doc).map(item => item.label).join(', ') || 'None')}</div>
                <div><strong>Due Date:</strong> ${escapeDocumentHtml(formatDocumentDate(doc.dueDate))}</div>
                <div><strong>Verified By:</strong> ${escapeDocumentHtml(doc.verifiedBy || 'Pending')}</div>
                <div><strong>Notes:</strong> ${escapeDocumentHtml(doc.notes || 'No notes added')}</div>
            </div>
        </div>
    `;
    openModal('previewDocumentModal');
}

function verifyPreviewDocument() {
    if (!previewingDocumentId) {
        showToast('Upload missing', 'Please upload the document before verifying it.', 'warning');
        return;
    }

    const doc = ensureStateDocuments().find(item => Number(item.id) === Number(previewingDocumentId));
    if (!doc) {
        showToast('Upload missing', 'Please upload the document before verifying it.', 'warning');
        return;
    }

    setDocumentStatus(doc.id, doc.leadId, doc.type, 'verified');
    closeModal('previewDocumentModal');
}

function markAllVisibleVerified() {
    const profile = filteredTravelerProfiles.find(item => item.id === selectedTravelerId);
    if (!profile) return;

    const readyDocs = profile.docs.filter(doc => doc.status === 'uploaded');
    if (!readyDocs.length) {
        showToast('Nothing to verify', 'Upload at least one document before bulk verification.', 'warning');
        return;
    }

    readyDocs.forEach(doc => {
        setDocumentStatus(String(doc.id).startsWith('generated-') ? null : doc.id, profile.id, doc.type, 'verified', true);
    });
    showToast('Verification completed', `${readyDocs.length} document(s) marked as verified.`);
}

function refreshDocumentsPage() {
    buildTravelerDocumentProfiles();
    updateDocumentStats();
    if (!selectedTravelerId) {
        selectedTravelerId = travelerDocumentProfiles[0]?.id || null;
    }
    applyDocumentFilters();
}

function initializeDocumentsPage() {
    document.getElementById('uploadDocumentType')?.addEventListener('change', event => {
        const partSelect = document.getElementById('uploadDocumentPart');
        if (!partSelect) return;
        partSelect.innerHTML = getDocumentPartOptions(event.target.value).map(part => `
            <option value="${part}">${escapeDocumentHtml(part)}</option>
        `).join('');
    });
    refreshDocumentsPage();
}

document.addEventListener('DOMContentLoaded', initializeDocumentsPage);

window.applyDocumentFilters = applyDocumentFilters;
window.resetDocumentFilters = resetDocumentFilters;
window.selectTravelerDocumentProfile = selectTravelerDocumentProfile;
window.openUploadModal = openUploadModal;
window.saveDocumentUpload = saveDocumentUpload;
window.previewDocument = previewDocument;
window.verifyPreviewDocument = verifyPreviewDocument;
window.setDocumentStatus = setDocumentStatus;
window.markAllVisibleVerified = markAllVisibleVerified;
window.refreshDocumentsPage = refreshDocumentsPage;
