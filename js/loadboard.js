// Loadboard Page Script

// Get loads from localStorage or use defaults
const STORAGE_KEY = 'alphaway_loads';

function getLoadsForBoard() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing stored loads:', e);
            return loads; // Fall back to default loads
        }
    }
    return loads; // Use default loads if nothing in storage
}

function renderLoadCard(load) {
    const statusClass = load.status.toLowerCase();
    return `
    <div class="load-card ${statusClass}">
      <div class="load-id">${load.id}</div>
      
      <div class="load-route">
        <div class="route-endpoint">
          <span class="endpoint-label">Pickup</span>
          <span class="endpoint-city">${load.origin}</span>
        </div>
        <div class="route-arrow">→</div>
        <div class="route-endpoint">
          <span class="endpoint-label">Delivery</span>
          <span class="endpoint-city">${load.destination}</span>
        </div>
      </div>

      <div class="load-details">
        <div class="detail-item">
          <span class="detail-label">Equipment</span>
          <span class="detail-value">${load.equipment}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Distance</span>
          <span class="detail-value">${load.miles.toLocaleString()} mi</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Weight</span>
          <span class="detail-value">${load.weight}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Pickup</span>
          <span class="detail-value">${load.pickup}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Delivery</span>
          <span class="detail-value">${load.delivery}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Broker</span>
          <span class="detail-value">${load.broker}</span>
        </div>
      </div>

      <div class="load-action">
        <div class="detail-item">
          <span class="detail-label">Rate</span>
          <span class="detail-value rate">$${load.rate.toLocaleString()}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Status</span>
          <span class="detail-value status ${statusClass}">${load.status}</span>
        </div>
        <button class="action-button primary">Bid Load</button>
      </div>
    </div>
  `;
}

function renderLoadsList(loadsToShow) {
    const container = document.getElementById('loads-container');
    const resultsCount = document.getElementById('results-count');

    if (loadsToShow.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <h3>No loads found</h3>
        <p>Try adjusting your filters or check back later for new opportunities.</p>
      </div>
    `;
        resultsCount.textContent = 'No Results';
        return;
    }

    container.innerHTML = loadsToShow.map(load => renderLoadCard(load)).join('');
    resultsCount.textContent = `${loadsToShow.length} Available Load${loadsToShow.length !== 1 ? 's' : ''}`;
}

function filterLoads() {
    const origin = document.getElementById('origin-search').value.toLowerCase();
    const destination = document.getElementById('destination-search').value.toLowerCase();
    const equipment = document.getElementById('equipment-filter').value;
    const minRate = parseInt(document.getElementById('rate-filter').value) || 0;

    const currentLoads = getLoadsForBoard();
    const filtered = currentLoads.filter(load => {
        const originMatch = !origin || load.origin.toLowerCase().includes(origin);
        const destMatch = !destination || load.destination.toLowerCase().includes(destination);
        const equipMatch = !equipment || load.equipment === equipment;
        const rateMatch = load.rate >= minRate;

        return originMatch && destMatch && equipMatch && rateMatch;
    });

    renderLoadsList(filtered);
}

function resetFilters() {
    document.getElementById('origin-search').value = '';
    document.getElementById('destination-search').value = '';
    document.getElementById('equipment-filter').value = '';
    document.getElementById('rate-filter').value = '';
    renderLoadsList(getLoadsForBoard());
}

function populateStatesDatalist() {
    const datalist = document.getElementById('states-list');
    datalist.innerHTML = allStates.map(state => `<option value="${state}">`).join('');
}

document.addEventListener('DOMContentLoaded', function () {
    // Initial render - get loads from localStorage or defaults
    renderLoadsList(getLoadsForBoard());

    // Populate states datalist
    populateStatesDatalist();

    // Event listeners
    document.getElementById('filter-btn').addEventListener('click', filterLoads);
    document.getElementById('reset-btn').addEventListener('click', resetFilters);

    // Allow filtering on Enter key
    ['origin-search', 'destination-search', 'equipment-filter', 'rate-filter'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem.tagName === 'INPUT') {
            elem.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    filterLoads();
                }
            });
        }
    });

    // Bid button handlers
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('action-button') && e.target.textContent.includes('Bid')) {
            const card = e.target.closest('.load-card');
            const loadId = card.querySelector('.load-id').textContent;
            alert(`Bid submitted for load ${loadId}. A dispatcher will contact you soon!`);
        }
    });
});
