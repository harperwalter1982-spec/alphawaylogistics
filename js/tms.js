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

const REQUIRED_DOCUMENTS = {
    'Carrier Setup': [
        {
            name: 'Carrier Agreement',
            description: 'Standard operating agreement for hauling services and dispatch coordination.',
            signed: false
        },
        {
            name: 'W-9 Form',
            description: 'Required for vendor setup and payment processing.',
            signed: false
        },
        {
            name: 'Authority / MC Setup',
            description: 'Legal authority and operating approval needed before booking loads.',
            signed: false
        }
    ],
    'Broker Packet': [
        {
            name: 'Broker Carrier Agreement',
            description: 'Agreement covering booking terms, rate structure, and dispatch responsibilities.',
            signed: false
        },
        {
            name: 'Rate Confirmation Acknowledgment',
            description: 'Confirms the accepted rate and pickup/delivery details for each load.',
            signed: false
        },
        {
            name: 'Load Booking Confirmation',
            description: 'Final booking approval for dispatch and customer communication.',
            signed: false
        }
    ],
    'Compliance': [
        {
            name: 'Driver Qualification File',
            description: 'Driver profile, license, and onboarding documentation required to move freight.',
            signed: false
        },
        {
            name: 'Safety Policy Acknowledgment',
            description: 'Confirms driver and carrier compliance with safety standards and procedures.',
            signed: false
        },
        {
            name: 'HOS / Hours of Service Compliance',
            description: 'Required for legal and operational compliance across all booked loads.',
            signed: false
        }
    ],
    'Insurance': [
        {
            name: 'Certificate of Insurance',
            description: 'Primary proof of coverage before load acceptance and active dispatch.',
            signed: false
        },
        {
            name: 'Cargo Coverage Verification',
            description: 'Confirms cargo protection limits and active insurance coverage.',
            signed: false
        },
        {
            name: 'Accident Reporting Procedure',
            description: 'Required incident and after-hours contact process for all dispatch activity.',
            signed: false
        }
    ]
};

const DOC_STORAGE_KEY = 'alphaway_required_documents';

function getRequiredDocuments() {
    const saved = localStorage.getItem(DOC_STORAGE_KEY);

    if (!saved) {
        return REQUIRED_DOCUMENTS;
    }

    try {
        const parsed = JSON.parse(saved);
        const normalized = JSON.parse(JSON.stringify(REQUIRED_DOCUMENTS));

        Object.keys(normalized).forEach(group => {
            const groupDocs = normalized[group] || [];
            const savedGroup = parsed[group] || [];

            groupDocs.forEach((doc, index) => {
                const savedDoc = savedGroup[index];
                if (savedDoc) {
                    doc.signed = Boolean(savedDoc.signed);
                }
            });
        });

        return normalized;
    } catch (error) {
        console.error('Unable to read required documents:', error);
        return REQUIRED_DOCUMENTS;
    }
}

function persistRequiredDocuments(docGroups) {
    localStorage.setItem(DOC_STORAGE_KEY, JSON.stringify(docGroups));
}

function getDocGroupSummary(docGroups) {
    let signedCount = 0;
    let totalCount = 0;

    Object.values(docGroups).forEach(group => {
        group.forEach(doc => {
            totalCount += 1;
            if (doc.signed) {
                signedCount += 1;
            }
        });
    });

    return { signedCount, totalCount };
}

function renderDocTabs() {
    const docTabs = document.getElementById('doc-tabs');
    const docPanel = document.getElementById('doc-panel');
    const docGroups = getRequiredDocuments();
    const groupNames = Object.keys(docGroups);
    const activeTab = localStorage.getItem('alphaway_active_doc_tab') || groupNames[0];

    docTabs.innerHTML = groupNames.map(groupName => `
        <button class="doc-tab ${groupName === activeTab ? 'active' : ''}" data-doc-group="${groupName}">
            ${groupName}
        </button>
    `).join('');

    const activeGroup = groupNames.includes(activeTab) ? activeTab : groupNames[0];
    const activeDocs = docGroups[activeGroup];
    const summary = getDocGroupSummary(docGroups);
    const progressText = `${summary.signedCount} of ${summary.totalCount} signed`;

    document.getElementById('doc-progress').textContent = progressText;

    docPanel.innerHTML = activeDocs.map(doc => `
        <article class="doc-card">
            <div class="doc-card-header">
                <h3>${doc.name}</h3>
                <span class="doc-status ${doc.signed ? 'signed' : 'pending'}">
                    ${doc.signed ? 'Signed' : 'Pending'}
                </span>
            </div>
            <p>${doc.description}</p>
            <button class="doc-toggle" data-doc-name="${doc.name}" data-doc-group="${activeGroup}">
                ${doc.signed ? 'Mark unsigned' : 'Mark signed'}
            </button>
        </article>
    `).join('');

    docTabs.querySelectorAll('.doc-tab').forEach(button => {
        button.addEventListener('click', () => {
            const tabGroup = button.dataset.docGroup;
            localStorage.setItem('alphaway_active_doc_tab', tabGroup);
            renderDocTabs();
        });
    });

    docPanel.querySelectorAll('.doc-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const groupName = button.dataset.docGroup;
            const documentName = button.dataset.docName;
            const docGroupsState = getRequiredDocuments();
            const targetDoc = docGroupsState[groupName].find(doc => doc.name === documentName);

            if (targetDoc) {
                targetDoc.signed = !targetDoc.signed;
                persistRequiredDocuments(docGroupsState);
                renderDocTabs();
            }
        });
    });
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
    renderDocTabs();
    renderTmsDashboard();
    renderTmsTable();
    bindTmsEvents();
});
