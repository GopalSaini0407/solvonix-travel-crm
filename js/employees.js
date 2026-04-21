let employees = [];
let filteredEmployees = [];
let activeEmployeeId = null;

function employeeCurrency(value) {
    return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function employeeInitials(name = '') {
    return String(name)
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join('') || 'NA';
}

function statusLabel(status = 'active') {
    const map = {
        active: 'Active',
        on_leave: 'On Leave',
        inactive: 'Inactive'
    };
    return map[status] || 'Active';
}

function statusChipClass(status = 'active') {
    if (status === 'active') return 'success';
    if (status === 'on_leave') return 'warning';
    return '';
}

function buildEmployees() {
    employees = Array.isArray(window.state?.employees) ? [...window.state.employees] : [];
    filteredEmployees = [...employees];
}

function populateEmployeeFilters() {
    const departmentFilter = document.getElementById('employeeDepartmentFilter');
    const roleFilter = document.getElementById('employeeRoleFilter');
    if (!departmentFilter || !roleFilter) return;

    const departments = Array.from(new Set(employees.map(item => item.department).filter(Boolean))).sort();
    const roles = Array.from(new Set(employees.map(item => item.role).filter(Boolean))).sort();

    const selectedDepartment = departmentFilter.value;
    const selectedRole = roleFilter.value;

    departmentFilter.innerHTML = '<option value="">All Departments</option>' + departments.map(item => `<option value="${item}">${item}</option>`).join('');
    roleFilter.innerHTML = '<option value="">All Roles</option>' + roles.map(item => `<option value="${item}">${item}</option>`).join('');

    departmentFilter.value = selectedDepartment;
    roleFilter.value = selectedRole;
}

function updateEmployeeStats() {
    const total = employees.length;
    const active = employees.filter(item => item.status === 'active').length;
    const sales = employees.filter(item => item.department === 'Sales').length;
    const avgPerformance = total
        ? Math.round(employees.reduce((sum, item) => sum + Number(item.performance || 0), 0) / total)
        : 0;

    document.getElementById('employeeTotalCount').textContent = total;
    document.getElementById('employeeActiveCount').textContent = active;
    document.getElementById('employeeSalesCount').textContent = sales;
    document.getElementById('employeeAvgPerformance').textContent = `${avgPerformance}%`;
}

function renderEmployeeDirectory() {
    const container = document.getElementById('employeeDirectory');
    const count = document.getElementById('employeeDirectoryCount');
    if (!container || !count) return;

    count.textContent = `Showing ${filteredEmployees.length} employee${filteredEmployees.length === 1 ? '' : 's'}`;

    if (!filteredEmployees.length) {
        container.innerHTML = `
            <div class="employee-empty">
                <div>
                    <i class="fas fa-user-slash"></i>
                    <h3>No employees found</h3>
                    <p>Try adjusting the filters or add a new team member.</p>
                </div>
            </div>
        `;
        renderEmployeeDetail();
        return;
    }

    container.innerHTML = filteredEmployees.map(employee => `
        <article class="employee-card ${employee.id === activeEmployeeId ? 'active' : ''}" data-onclick="showEmployeeDetail(${employee.id})">
            <div class="employee-card-main">
                <div class="employee-avatar">${employeeInitials(employee.name)}</div>
                <div class="employee-card-copy">
                    <h4>${employee.name}</h4>
                    <p>${employee.role} • ${employee.department}</p>
                    <p>${employee.email} • ${employee.phone}</p>
                    <div class="employee-card-meta">
                        <span class="employee-chip primary"><i class="fas fa-location-dot"></i> ${employee.location || 'Location pending'}</span>
                        <span class="employee-chip ${statusChipClass(employee.status)}"><i class="fas fa-circle"></i> ${statusLabel(employee.status)}</span>
                        <span class="employee-chip"><i class="fas fa-chart-line"></i> ${employee.performance || 0}% score</span>
                    </div>
                </div>
            </div>
            <div class="table-actions">
                <button class="btn-outline btn-sm btn-icon" data-onclick="openEmployeeModal(${employee.id}); event.stopPropagation();"><i class="fas fa-pen"></i></button>
                <button class="btn-outline btn-danger-outline btn-sm btn-icon" data-onclick="deleteEmployee(${employee.id}); event.stopPropagation();"><i class="fas fa-trash"></i></button>
            </div>
        </article>
    `).join('');
}

function renderEmployeeDetail(id = activeEmployeeId) {
    const panel = document.getElementById('employeeDetailPanel');
    if (!panel) return;

    const employee = employees.find(item => item.id === id);
    if (!employee) {
        panel.innerHTML = `
            <div class="employee-empty">
                <div>
                    <i class="fas fa-user-tie"></i>
                    <h3>Select an employee</h3>
                    <p>Profile, workload, department details and quick actions will appear here.</p>
                </div>
            </div>
        `;
        return;
    }

    panel.innerHTML = `
        <div class="employee-side-hero">
            <div class="employee-avatar">${employeeInitials(employee.name)}</div>
            <h2>${employee.name}</h2>
            <p>${employee.role} • ${employee.department}</p>
            <div class="employee-card-meta">
                <span class="employee-chip ${statusChipClass(employee.status)}"><i class="fas fa-circle"></i> ${statusLabel(employee.status)}</span>
                <span class="employee-chip primary"><i class="fas fa-user-shield"></i> Manager: ${employee.manager || 'Not assigned'}</span>
            </div>
        </div>
        <div class="employee-side-body">
            <div class="employee-stat-grid">
                <div class="employee-stat-tile">
                    <strong>${employee.performance || 0}%</strong>
                    <span>Performance</span>
                </div>
                <div class="employee-stat-tile">
                    <strong>${employee.activeLeads || 0}</strong>
                    <span>Active Leads</span>
                </div>
                <div class="employee-stat-tile">
                    <strong>${employee.activeBookings || 0}</strong>
                    <span>Active Bookings</span>
                </div>
            </div>
            <div class="employee-info-list">
                <div class="employee-info-item">
                    <span class="label">Email</span>
                    <span class="value">${employee.email || 'Not available'}</span>
                </div>
                <div class="employee-info-item">
                    <span class="label">Phone</span>
                    <span class="value">${employee.phone || 'Not available'}</span>
                </div>
                <div class="employee-info-item">
                    <span class="label">Joining Date</span>
                    <span class="value">${employee.joiningDate || 'Not added'}</span>
                </div>
                <div class="employee-info-item">
                    <span class="label">Work Location</span>
                    <span class="value">${employee.location || 'Not available'}</span>
                </div>
                <div class="employee-info-item">
                    <span class="label">Monthly Salary</span>
                    <span class="value">${employeeCurrency(employee.salary)}</span>
                </div>
                <div class="employee-info-item">
                    <span class="label">Notes</span>
                    <span class="value">${employee.notes || 'No notes added yet.'}</span>
                </div>
            </div>
            <div class="table-actions">
                <button class="btn-primary" data-onclick="openEmployeeModal(${employee.id})"><i class="fas fa-pen"></i> Edit</button>
                <button class="btn-outline btn-danger-outline" data-onclick="deleteEmployee(${employee.id})"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `;
}

function applyEmployeeFilters() {
    const search = document.getElementById('employeeSearch').value.trim().toLowerCase();
    const department = document.getElementById('employeeDepartmentFilter').value;
    const status = document.getElementById('employeeStatusFilter').value;
    const role = document.getElementById('employeeRoleFilter').value;

    filteredEmployees = employees.filter(employee => {
        const searchTarget = `${employee.name} ${employee.email} ${employee.phone} ${employee.role} ${employee.department}`.toLowerCase();
        const matchesSearch = !search || searchTarget.includes(search);
        const matchesDepartment = !department || employee.department === department;
        const matchesStatus = !status || employee.status === status;
        const matchesRole = !role || employee.role === role;
        return matchesSearch && matchesDepartment && matchesStatus && matchesRole;
    });

    if (activeEmployeeId && !filteredEmployees.some(item => item.id === activeEmployeeId)) {
        activeEmployeeId = null;
    }

    renderEmployeeDirectory();
    renderEmployeeDetail();
}

function resetEmployeeFilters() {
    document.getElementById('employeeSearch').value = '';
    document.getElementById('employeeDepartmentFilter').value = '';
    document.getElementById('employeeStatusFilter').value = '';
    document.getElementById('employeeRoleFilter').value = '';
    filteredEmployees = [...employees];
    renderEmployeeDirectory();
    renderEmployeeDetail();
}

function showEmployeeDetail(id) {
    activeEmployeeId = id;
    renderEmployeeDirectory();
    renderEmployeeDetail(id);
}

function openEmployeeModal(id = null) {
    const modalTitle = document.getElementById('employeeModalTitle');
    const employee = employees.find(item => item.id === id);

    document.getElementById('employeeId').value = employee?.id || '';
    document.getElementById('employeeName').value = employee?.name || '';
    document.getElementById('employeeEmail').value = employee?.email || '';
    document.getElementById('employeePhone').value = employee?.phone || '';
    document.getElementById('employeeRole').value = employee?.role || '';
    document.getElementById('employeeDepartment').value = employee?.department || 'Sales';
    document.getElementById('employeeStatus').value = employee?.status || 'active';
    document.getElementById('employeeJoiningDate').value = employee?.joiningDate || '';
    document.getElementById('employeeLocation').value = employee?.location || '';
    document.getElementById('employeeManager').value = employee?.manager || '';
    document.getElementById('employeeSalary').value = employee?.salary || '';
    document.getElementById('employeeActiveLeads').value = employee?.activeLeads || 0;
    document.getElementById('employeeActiveBookings').value = employee?.activeBookings || 0;
    document.getElementById('employeePerformance').value = employee?.performance || 0;
    document.getElementById('employeeNotes').value = employee?.notes || '';

    modalTitle.innerHTML = employee
        ? '<i class="fas fa-user-pen"></i> Edit Employee'
        : '<i class="fas fa-user-plus"></i> Add Employee';

    openModal('employeeModal');
}

function saveEmployee() {
    const id = Number(document.getElementById('employeeId').value || 0);
    const name = document.getElementById('employeeName').value.trim();
    const email = document.getElementById('employeeEmail').value.trim();
    const phone = document.getElementById('employeePhone').value.trim();
    const role = document.getElementById('employeeRole').value.trim();

    if (!name || !email || !phone || !role) {
        showToast('Missing details', 'Name, email, phone and role are required.', 'warning');
        return;
    }

    const payload = window.normalizeEmployee({
        id: id || Math.max(100, ...employees.map(item => Number(item.id || 0))) + 1,
        name,
        email,
        phone,
        role,
        department: document.getElementById('employeeDepartment').value,
        status: document.getElementById('employeeStatus').value,
        joiningDate: document.getElementById('employeeJoiningDate').value,
        location: document.getElementById('employeeLocation').value.trim(),
        manager: document.getElementById('employeeManager').value.trim(),
        salary: Number(document.getElementById('employeeSalary').value || 0),
        activeLeads: Number(document.getElementById('employeeActiveLeads').value || 0),
        activeBookings: Number(document.getElementById('employeeActiveBookings').value || 0),
        performance: Number(document.getElementById('employeePerformance').value || 0),
        notes: document.getElementById('employeeNotes').value.trim()
    });

    if (id) {
        window.state.employees = window.state.employees.map(item => item.id === id ? payload : item);
        showToast('Employee updated', `${name} profile has been updated.`);
    } else {
        window.state.employees.unshift(payload);
        showToast('Employee added', `${name} has been added to the directory.`);
    }

    closeModal('employeeModal');
    initializeEmployeePage(payload.id);
}

function deleteEmployee(id) {
    const employee = employees.find(item => item.id === id);
    if (!employee) return;

    window.state.employees = window.state.employees.filter(item => item.id !== id);
    if (activeEmployeeId === id) {
        activeEmployeeId = null;
    }

    showToast('Employee deleted', `${employee.name} has been removed from the directory.`, 'warning');
    initializeEmployeePage();
}

function initializeEmployeePage(nextActiveId = activeEmployeeId) {
    buildEmployees();
    populateEmployeeFilters();
    updateEmployeeStats();
    activeEmployeeId = nextActiveId && employees.some(item => item.id === nextActiveId)
        ? nextActiveId
        : employees[0]?.id || null;
    filteredEmployees = [...employees];
    renderEmployeeDirectory();
    renderEmployeeDetail(activeEmployeeId);
}

document.addEventListener('DOMContentLoaded', () => initializeEmployeePage());

window.applyEmployeeFilters = applyEmployeeFilters;
window.resetEmployeeFilters = resetEmployeeFilters;
window.showEmployeeDetail = showEmployeeDetail;
window.openEmployeeModal = openEmployeeModal;
window.saveEmployee = saveEmployee;
window.deleteEmployee = deleteEmployee;
