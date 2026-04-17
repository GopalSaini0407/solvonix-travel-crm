const itineraryTemplates = {
            1: {
                title: 'Swiss Alps Adventure',
                dates: '15-22 May 2024',
                duration: '8 Days / 7 Nights',
                traveler: 'Rahul Mehta',
                pax: '4 Adults + 1 Child',
                inclusions: ['7 nights hotel accommodation', 'Daily breakfast + 2 special dinners', 'Swiss Travel Pass (8 days)', 'Airport transfers'],
                invoice: [
                    ['Package Cost (5 pax)', '₹3,50,000'],
                    ['Flight (Mumbai-Zurich)', '₹2,25,000'],
                    ['Swiss Travel Pass', '₹85,000'],
                    ['Travel Insurance', '₹15,000'],
                    ['Total', '₹6,75,000']
                ],
                summary: [
                    ['Deposit Paid', '₹1,25,000'],
                    ['Balance Due', '₹5,50,000'],
                    ['Due Date', '10 May 2024']
                ],
                days: [
                    {
                        title: 'Arrival in Zurich',
                        date: '15 May 2024',
                        icon: 'sun',
                        activities: [
                            { time: '08:00 AM', icon: 'plane', title: 'Flight to Zurich', description: 'Swiss Air LX-147 | Mumbai to Zurich' },
                            { time: '02:00 PM', icon: 'hotel', title: 'Hotel Check-in', description: 'Zurich Marriott Hotel | 5-star' },
                            { time: '06:00 PM', icon: 'utensils', title: 'Welcome Dinner', description: 'Traditional Swiss Restaurant' }
                        ]
                    },
                    {
                        title: 'Jungfraujoch Excursion',
                        date: '16 May 2024',
                        icon: 'mountain',
                        activities: [
                            { time: '09:00 AM', icon: 'train', title: 'Train to Jungfraujoch', description: 'Scenic train journey - Top of Europe' },
                            { time: '12:00 PM', icon: 'person-hiking', title: 'Ice Palace & Sphinx Observatory', description: 'Guided tour included' }
                        ]
                    },
                    {
                        title: 'Lucerne & Departure',
                        date: '17 May 2024',
                        icon: 'city',
                        activities: [
                            { time: '10:00 AM', icon: 'bridge', title: 'Chapel Bridge Tour', description: 'Historic Lucerne walking tour' }
                        ]
                    }
                ]
            }
        };

        let currentItinerary = JSON.parse(JSON.stringify(itineraryTemplates[1]));
        let pendingDayIndex = null;

        function iconClass(name) {
            const map = {
                plane: 'fas fa-plane',
                hotel: 'fas fa-hotel',
                utensils: 'fas fa-utensils',
                train: 'fas fa-train',
                map: 'fas fa-map-marked-alt',
                mountain: 'fas fa-mountain',
                sun: 'far fa-sun',
                city: 'far fa-building',
                bridge: 'fas fa-bridge',
                'person-hiking': 'fas fa-person-hiking'
            };
            return map[name] || 'fas fa-map-marked-alt';
        }

        function renderDays() {
            const container = document.getElementById('daysContainer');
            container.innerHTML = currentItinerary.days.map((day, index) => `
                <div class="day-card">
                    <div class="day-header" data-onclick="toggleDay(${index})">
                        <div class="day-title">
                            <div class="activity-icon"><i class="${iconClass(day.icon)}"></i></div>
                            <div>
                                <strong>Day ${index + 1}: ${day.title}</strong>
                                <div style="font-size: 13px; color: var(--gray);">${day.date}</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <span class="day-badge">${day.activities.length} Activities</span>
                            <i class="fas fa-chevron-down" id="dayIcon${index}"></i>
                        </div>
                    </div>
                    <div class="activity-list" id="dayContent${index}">
                        ${day.activities.map((activity, activityIndex) => `
                            <div class="activity-item">
                                <div class="activity-time">${activity.time}</div>
                                <div class="activity-icon"><i class="${iconClass(activity.icon)}"></i></div>
                                <div class="activity-desc">
                                    <strong>${activity.title}</strong>
                                    <div style="font-size: 13px; color: var(--gray);">${activity.description}</div>
                                </div>
                                <div class="inline-actions">
                                    <i class="far fa-pen-to-square icon-btn" data-onclick="editActivity(${index}, ${activityIndex}, event)"></i>
                                    <i class="far fa-trash-can icon-btn" data-onclick="deleteActivity(${index}, ${activityIndex}, event)"></i>
                                </div>
                            </div>
                        `).join('')}
                        <button class="btn-outline" data-onclick="openAddActivityModal(${index})"><i class="fas fa-plus"></i> Add Activity</button>
                    </div>
                </div>
            `).join('');
        }

        function renderPreview() {
            const preview = document.getElementById('itineraryPreview');
            preview.innerHTML = `
                <div class="preview-header">
                    <i class="fas fa-plane-departure" style="font-size: 34px; color: var(--primary);"></i>
                    <h3>${currentItinerary.title}</h3>
                    <p style="color: var(--gray); font-size: 13px;">${currentItinerary.dates} | ${currentItinerary.duration}</p>
                </div>
                <div class="preview-list">
                    <div class="preview-line"><span><i class="far fa-user"></i> ${currentItinerary.traveler}</span><span>${currentItinerary.pax}</span></div>
                    ${currentItinerary.days.map((day, index) => `<div><strong>Day ${index + 1}:</strong> ${day.title}</div>`).join('')}
                    <div style="padding-top: 8px;"><strong>Inclusions</strong></div>
                    <ul style="padding-left: 18px; color: var(--gray);">
                        ${currentItinerary.inclusions.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        function renderInvoice() {
            const invoiceTable = document.getElementById('invoiceTable');
            const invoiceSummary = document.getElementById('invoiceSummary');

            invoiceTable.innerHTML = currentItinerary.invoice.map((row, index) => `
                <tr style="${index === currentItinerary.invoice.length - 1 ? 'font-weight: 700; color: var(--secondary);' : ''}">
                    <td>${row[0]}</td>
                    <td style="text-align: right;">${row[1]}</td>
                </tr>
            `).join('');

            invoiceSummary.innerHTML = currentItinerary.summary.map(item => `
                <div style="display: flex; justify-content: space-between;">
                    <span>${item[0]}</span>
                    <strong>${item[1]}</strong>
                </div>
            `).join('');
        }

        function renderAll() {
            renderDays();
            renderPreview();
            renderInvoice();
            currentItinerary.days.forEach((_, index) => {
                const content = document.getElementById(`dayContent${index}`);
                if (content) content.style.display = 'grid';
            });
        }

        function toggleDay(index) {
            const content = document.getElementById(`dayContent${index}`);
            const icon = document.getElementById(`dayIcon${index}`);
            if (!content || !icon) return;

            const visible = content.style.display !== 'none';
            content.style.display = visible ? 'none' : 'grid';
            icon.className = visible ? 'fas fa-chevron-right' : 'fas fa-chevron-down';
        }

        function addNewDay() {
            const dayNumber = currentItinerary.days.length + 1;
            currentItinerary.days.push({
                title: 'New Day',
                date: `Day ${dayNumber}`,
                icon: 'map',
                activities: []
            });
            renderAll();
            showToast('Day added', `Day ${dayNumber} is ready for planning.`);
        }

        function openAddActivityModal(dayIndex) {
            pendingDayIndex = dayIndex;
            document.getElementById('activityTime').value = '09:00';
            document.getElementById('activityTitle').value = '';
            document.getElementById('activityDescription').value = '';
            document.getElementById('activityIcon').value = 'map';
            openModal('addActivityModal');
        }

        function submitActivity() {
            if (pendingDayIndex === null) return;

            const title = document.getElementById('activityTitle').value.trim();
            const description = document.getElementById('activityDescription').value.trim();
            const time = document.getElementById('activityTime').value || '09:00';
            const icon = document.getElementById('activityIcon').value;

            if (!title) {
                showToast('Missing title', 'Please enter an activity title.', 'warning');
                return;
            }

            currentItinerary.days[pendingDayIndex].activities.push({
                time: formatTime(time),
                icon,
                title,
                description: description || 'Custom activity'
            });

            closeModal('addActivityModal');
            renderAll();
            showToast('Activity added', `${title} added to Day ${pendingDayIndex + 1}.`);
        }

        function editActivity(dayIndex, activityIndex, event) {
            if (event) event.stopPropagation();
            const activity = currentItinerary.days[dayIndex].activities[activityIndex];
            if (!activity) return;
            showToast('Edit ready', `Update "${activity.title}" in your next version.`);
        }

        function deleteActivity(dayIndex, activityIndex, event) {
            if (event) event.stopPropagation();
            const removed = currentItinerary.days[dayIndex].activities.splice(activityIndex, 1);
            renderAll();
            if (removed[0]) {
                showToast('Activity removed', `${removed[0].title} deleted from Day ${dayIndex + 1}.`);
            }
        }

        function loadItinerary() {
            const value = document.getElementById('bookingSelect').value;
            if (!value) return;
            currentItinerary = JSON.parse(JSON.stringify(itineraryTemplates[1]));
            renderAll();
            showToast('Itinerary loaded', 'Booking itinerary loaded into builder.');
        }

        function refreshPreview() {
            renderPreview();
            renderInvoice();
            showToast('Preview refreshed', 'Latest itinerary details are now visible.');
        }

        function exportPDF() {
            showToast('PDF exported', 'Professional itinerary PDF generated successfully.');
        }

        function downloadInvoice() {
            showToast('Invoice downloaded', 'Cost breakdown PDF downloaded.');
        }

        function shareWhatsApp() {
            showToast('WhatsApp share', 'Itinerary link copied for WhatsApp sharing.');
        }

        function shareEmail() {
            showToast('Email ready', 'Email draft prepared with itinerary details.');
        }

        function copyLink() {
            showToast('Link copied', 'Share link copied to clipboard.');
        }

        function createItinerary() {
            closeModal('newItineraryModal');
            showToast('Itinerary created', 'New itinerary draft created successfully.');
        }

        function formatTime(rawTime) {
            const [hourString, minute] = rawTime.split(':');
            const hour = Number(hourString);
            const suffix = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${String(displayHour).padStart(2, '0')}:${minute} ${suffix}`;
        }

        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.add('show');
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.remove('show');
        }

        function showToast(message, detail, type = 'success') {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = `toast ${type === 'error' ? 'error' : type === 'warning' ? 'warning' : ''}`;
            toast.innerHTML = `<i>${type === 'success' ? '✓' : type === 'error' ? '✗' : '!'}</i><div><strong>${message}</strong><br><small>${detail}</small></div>`;
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        renderAll();