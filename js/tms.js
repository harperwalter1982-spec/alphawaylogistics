const TMS_STORAGE_KEY = 'alphaway_loads';

function getTmsLoads() {
    const stored = localStorage.getItem(TMS_STORAGE_KEY);
    if (!stored) {
        return loads || [];
    }

    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : loads || [];
    } catch (error) {
        console.error('Error parsing TMS loads:', error);
        return loads || [];
    }
}

function updateTmsLoads(updatedLoads) {
    localStorage.setItem(TMS_STORAGE_KEY, JSON.stringify(updatedLoads));
}

function getStatusClass(status) {
    return String(status || 'Available').trim().toLowerCase().replace(/\s+/g, '-');
}

function formatMoney(value) {
    if (typeof value === 'string') {
        value = Number(value);
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value || 0);
}

function renderTmsDashboard() {
    const loadsForBoard = getTmsLoads();
    const activeLoads = loadsForBoard.length;
    const hotLoads = loadsForBoard.filter(load => String(load.status).toLowerCase() === 'hot').length;
    const avgRate = activeLoads ? loadsForBoard.reduce((sum, load) => sum + Number(load.rate || 0), 0) / activeLoads : 0;
    const revenue = loadsForBoard.reduce((sum, load) => sum + Number(load.rate || 0), 0);

    document.getElementById('stat-active').textContent = activeLoads;
    document.getElementById('stat-hot').textContent = hotLoads;
    document.getElementById('stat-rate').textContent = formatMoney(avgRate);
    document.getElementById('stat-revenue').textContent = formatMoney(revenue);
}

function renderTmsTable() {
    const tableBody = document.getElementById('tms-table-body');
    const resultsCount = document.getElementById('results-count');
    const searchTerm = document.getElementById('tms-search').value.trim().toLowerCase();
    const statusFilter = document.getElementById('tms-status-filter').value;
    const equipmentFilter = document.getElementById('tms-equipment-filter').value;

    let currentLoads = getTmsLoads();

    if (searchTerm) {
        currentLoads = currentLoads.filter(load => {
            const searchable = [
                load.id,
                load.origin,
                load.destination,
                load.broker,
                load.driver,
                load.lane,
                load.status,
                load.equipment
            ].join(' ').toLowerCase();
            return searchable.includes(searchTerm);
        });
    }

    if (statusFilter !== 'all') {
        currentLoads = currentLoads.filter(load => load.status === statusFilter);
    }

    if (equipmentFilter !== 'all') {
        currentLoads = currentLoads.filter(load => load.equipment === equipmentFilter);
    }

    resultsCount.textContent = `${currentLoads.length} load${currentLoads.length === 1 ? '' : 's'}`;

    if (!currentLoads.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">No loads match your filters.</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = currentLoads.map(load => {
        const statusClass = getStatusClass(load.status);
        const driverName = load.driver || 'Unassigned';

        return `
            <tr>
                <td>
                    <div class="route-stack">
                        <strong>${load.id}</strong>
                        <small>${load.lane || `${load.origin} → ${load.destination}`}</small>
                    </div>
                </td>
                <td>
                    <div class="route-stack">
                        <strong>${load.origin}</strong>
                        <small>→ ${load.destination}</small>
                    </div>
                </td>
                <td>${load.equipment || 'Dry Van'}</td>
                <td>${load.broker || 'N/A'}</td>
                <td><span class="driver-chip">${driverName}</span></td>
                <td>${load.pickup || 'TBD'}</td>
                <td class="rate-cell">${formatMoney(load.rate || 0)}</td>
                <td><span class="load-pill ${statusClass}">${load.status || 'Available'}</span></td>
                <td>
                    <div class="row-actions">
                        <button data-action="assign" data-id="${load.id}">Assign</button>
                        <button data-action="status" data-id="${load.id}">Update</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateLoadStatus(loadId, nextStatus) {
    const loadsForBoard = getTmsLoads();
    const targetIndex = loadsForBoard.findIndex(load => load.id === loadId);

    if (targetIndex === -1) {
        return;
    }

    loadsForBoard[targetIndex].status = nextStatus;
    updateTmsLoads(loadsForBoard);
    renderTmsDashboard();
    renderTmsTable();
}

function assignDriverToLoad(loadId) {
    const loadsForBoard = getTmsLoads();
    const targetLoad = loadsForBoard.find(load => load.id === loadId);

    if (!targetLoad) {
        return;
    }

    const existingDriver = targetLoad.driver || 'Driver TBD';
    const driverName = prompt('Assign driver to this load:', existingDriver);

    if (!driverName) {
        return;
    }

    targetLoad.driver = driverName.trim();
    if (!targetLoad.status || targetLoad.status === 'Available') {
        targetLoad.status = 'Assigned';
    }

    updateTmsLoads(loadsForBoard);
    renderTmsDashboard();
    renderTmsTable();
}

function cycleStatus(loadId) {
    const loadsForBoard = getTmsLoads();
    const targetLoad = loadsForBoard.find(load => load.id === loadId);

    if (!targetLoad) {
        return;
    }

    const statusOrder = ['Available', 'Assigned', 'In Transit', 'Delivered'];
    const currentIndex = statusOrder.indexOf(targetLoad.status || 'Available');
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    targetLoad.status = nextStatus;

    updateTmsLoads(loadsForBoard);
    renderTmsDashboard();
    renderTmsTable();
}

function addDemoLoad() {
    const loadsForBoard = getTmsLoads();
    const nextId = `LB-${Math.floor(Math.random() * 90000) + 10000}`;

    loadsForBoard.unshift({
        id: nextId,
        origin: 'Denver, CO',
        destination: 'Salt Lake City, UT',
        equipment: 'Dry Van',
        miles: 520,
        rate: 2100,
        pickup: 'Today, 3:30 PM',
        delivery: 'Tomorrow, 10:00 AM',
        weight: '24,000 lb',
        broker: 'Front Range Logistics',
        status: 'New',
        lane: 'Denver → Salt Lake',
        driver: 'Driver TBD'
    });

    updateTmsLoads(loadsForBoard);
    renderTmsDashboard();
    renderTmsTable();
}

function bindTmsEvents() {
    const searchInput = document.getElementById('tms-search');
    const statusFilter = document.getElementById('tms-status-filter');
    const equipmentFilter = document.getElementById('tms-equipment-filter');
    const addDemoButton = document.getElementById('add-demo-load');

    if (searchInput) {
        searchInput.addEventListener('input', renderTmsTable);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', renderTmsTable);
    }

    if (equipmentFilter) {
        equipmentFilter.addEventListener('change', renderTmsTable);
    }

    if (addDemoButton) {
        addDemoButton.addEventListener('click', addDemoLoad);
    }

    document.addEventListener('click', function (event) {
        const actionTarget = event.target.closest('button[data-action]');
        if (!actionTarget) {
            return;
        }

        const loadId = actionTarget.dataset.id;
        const action = actionTarget.dataset.action;

        if (action === 'assign') {
            assignDriverToLoad(loadId);
        }

        if (action === 'status') {
            cycleStatus(loadId);
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    renderTmsDashboard();
    renderTmsTable();
    bindTmsEvents();
});
