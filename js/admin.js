// Admin Panel Script

const STORAGE_KEY = 'alphaway_loads';

// Initialize loads from localStorage or use defaults
function initializeLoads() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing stored loads:', e);
        }
    }
    // Return default loads if none stored
    return loads;
}

// Save loads to localStorage
function saveLoads(loadsArray) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loadsArray));
    } catch (e) {
        console.error('Error saving loads:', e);
        alert('Error saving loads to local storage');
    }
}

// Get current loads
function getLoads() {
    return initializeLoads();
}

// Add new load
function addLoad(loadData) {
    const currentLoads = getLoads();

    // Validate load data
    if (!loadData.id || !loadData.origin || !loadData.destination) {
        alert('Please fill in all required fields');
        return false;
    }

    // Check for duplicate ID
    if (currentLoads.some(l => l.id === loadData.id)) {
        alert('Load ID already exists. Use a unique ID.');
        return false;
    }

    currentLoads.push(loadData);
    saveLoads(currentLoads);
    return true;
}

// Update load
function updateLoad(loadId, updatedData) {
    const currentLoads = getLoads();
    const index = currentLoads.findIndex(l => l.id === loadId);

    if (index === -1) {
        alert('Load not found');
        return false;
    }

    currentLoads[index] = { ...currentLoads[index], ...updatedData };
    saveLoads(currentLoads);
    return true;
}

// Delete load
function deleteLoad(loadId) {
    if (!confirm('Are you sure you want to delete this load?')) {
        return false;
    }

    const currentLoads = getLoads();
    const filtered = currentLoads.filter(l => l.id !== loadId);

    if (filtered.length === currentLoads.length) {
        alert('Load not found');
        return false;
    }

    saveLoads(filtered);
    return true;
}

// Clear all loads
function clearAllLoads() {
    if (!confirm('Are you sure you want to delete ALL loads? This cannot be undone.')) {
        return false;
    }

    saveLoads([]);
    return true;
}

// Render load card
function renderLoadCard(load) {
    const statusClass = load.status.toLowerCase().replace(/\s+/g, '-');
    return `
    <div class="load-admin-card" data-load-id="${load.id}">
      <div class="load-admin-info">
        <div class="load-admin-id">${load.id}</div>
        <div class="load-admin-details">
          <div class="load-admin-route">
            <strong>${load.origin}</strong> → <strong>${load.destination}</strong>
          </div>
          <div>
            <span class="load-admin-status ${statusClass}">${load.status}</span>
          </div>
        </div>
        <div class="load-admin-rate">$${load.rate.toLocaleString()}</div>
      </div>
      <div class="load-admin-actions">
        <button class="edit-btn" onclick="editLoad('${load.id}')">Edit</button>
        <button class="delete-btn delete" onclick="deleteLoadHandler('${load.id}')">Delete</button>
      </div>
    </div>
  `;
}

// Render all loads
function renderLoadsList() {
    const container = document.getElementById('loads-admin-list');
    const countSpan = document.getElementById('load-count');
    const currentLoads = getLoads();

    if (currentLoads.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <h3>No loads yet</h3>
        <p>Add your first load using the form on the left.</p>
      </div>
    `;
        countSpan.textContent = '0';
        return;
    }

    container.innerHTML = currentLoads.map(load => renderLoadCard(load)).join('');
    countSpan.textContent = currentLoads.length;
}

// Handle form submission
function handleAddLoadSubmit(e) {
    e.preventDefault();

    const loadData = {
        id: document.getElementById('load-id').value,
        origin: document.getElementById('load-origin').value,
        destination: document.getElementById('load-destination').value,
        equipment: document.getElementById('load-equipment').value,
        miles: parseInt(document.getElementById('load-miles').value),
        rate: parseInt(document.getElementById('load-rate').value),
        pickup: document.getElementById('load-pickup').value,
        delivery: document.getElementById('load-delivery').value,
        weight: parseInt(document.getElementById('load-weight').value) + ' lb',
        broker: document.getElementById('load-broker').value,
        status: document.getElementById('load-status').value,
        lane: `${document.getElementById('load-origin').value} → ${document.getElementById('load-destination').value}`
    };

    if (addLoad(loadData)) {
        e.target.reset();
        renderLoadsList();
        alert('Load added successfully!');
    }
}

// Delete load handler
function deleteLoadHandler(loadId) {
    if (deleteLoad(loadId)) {
        renderLoadsList();
        alert('Load deleted successfully!');
    }
}

// Edit load handler
function editLoad(loadId) {
    const currentLoads = getLoads();
    const load = currentLoads.find(l => l.id === loadId);

    if (!load) return;

    // Pre-fill form with load data
    document.getElementById('load-id').value = load.id;
    document.getElementById('load-origin').value = load.origin;
    document.getElementById('load-destination').value = load.destination;
    document.getElementById('load-equipment').value = load.equipment;
    document.getElementById('load-miles').value = load.miles;
    document.getElementById('load-rate').value = load.rate;
    document.getElementById('load-weight').value = load.weight.replace(/\D/g, '');
    document.getElementById('load-pickup').value = load.pickup;
    document.getElementById('load-delivery').value = load.delivery;
    document.getElementById('load-broker').value = load.broker;
    document.getElementById('load-status').value = load.status;

    // Disable ID field (can't change ID)
    document.getElementById('load-id').disabled = true;

    // Change submit button text
    const form = document.getElementById('add-load-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Update Load';

    // Handle update submit
    form.onsubmit = function (e) {
        e.preventDefault();

        const updatedData = {
            origin: document.getElementById('load-origin').value,
            destination: document.getElementById('load-destination').value,
            equipment: document.getElementById('load-equipment').value,
            miles: parseInt(document.getElementById('load-miles').value),
            rate: parseInt(document.getElementById('load-rate').value),
            pickup: document.getElementById('load-pickup').value,
            delivery: document.getElementById('load-delivery').value,
            weight: parseInt(document.getElementById('load-weight').value) + ' lb',
            broker: document.getElementById('load-broker').value,
            status: document.getElementById('load-status').value,
            lane: `${document.getElementById('load-origin').value} → ${document.getElementById('load-destination').value}`
        };

        if (updateLoad(loadId, updatedData)) {
            // Reset form
            document.getElementById('load-id').disabled = false;
            form.reset();
            form.onsubmit = handleAddLoadSubmit;
            submitBtn.textContent = 'Add Load';
            renderLoadsList();
            alert('Load updated successfully!');
        }
    };

    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Export to JSON
function exportLoads() {
    const currentLoads = getLoads();
    const dataStr = JSON.stringify(currentLoads, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alphaway-loads-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Import from JSON
function importLoads(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const imported = JSON.parse(e.target.result);

            if (!Array.isArray(imported)) {
                alert('Invalid file format. Must be a JSON array of loads.');
                return;
            }

            if (confirm(`Import ${imported.length} loads? This will overwrite existing data.`)) {
                saveLoads(imported);
                renderLoadsList();
                alert('Loads imported successfully!');
            }
        } catch (error) {
            alert('Error parsing JSON file: ' + error.message);
        }
    };

    reader.readAsText(file);
}

// Document ready
document.addEventListener('DOMContentLoaded', function () {
    // Render initial loads
    renderLoadsList();

    // Add load form
    const form = document.getElementById('add-load-form');
    if (form) {
        form.addEventListener('submit', handleAddLoadSubmit);
    }

    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportLoads);
    }

    // Import button
    const importBtn = document.getElementById('import-btn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
    }

    // Import file handler
    const importFile = document.getElementById('import-file');
    if (importFile) {
        importFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                importLoads(e.target.files[0]);
            }
        });
    }

    // Clear all button
    const clearAllBtn = document.getElementById('clear-all-btn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            if (clearAllLoads()) {
                renderLoadsList();
                alert('All loads cleared!');
            }
        });
    }
});
