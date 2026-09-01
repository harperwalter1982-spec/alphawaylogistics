// Alphaway Logistics Load Board and UI Script

const AWL_COMPANY_EMAIL = 'operations@alphawaylogistics.com';

const allStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'Washington DC', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const loads = [
    {
        id: 'LB-48201',
        origin: 'Denver, CO',
        destination: 'Phoenix, AZ',
        equipment: 'Dry Van',
        miles: 698,
        rate: 2540,
        pickup: 'Today, 2:00 PM',
        delivery: 'Tomorrow, 11:30 AM',
        weight: '26,000 lb',
        broker: 'Swiftline Logistics',
        status: 'Hot',
        lane: 'Denver → Phoenix'
    },
    {
        id: 'LB-48322',
        origin: 'Colorado Springs, CO',
        destination: 'Dallas, TX',
        equipment: 'Reefer',
        miles: 874,
        rate: 3185,
        pickup: 'Today, 7:15 PM',
        delivery: 'Fri, 6:00 AM',
        weight: '22,400 lb',
        broker: 'Northway Freight',
        status: 'New',
        lane: 'Colorado Springs → Dallas'
    },
    {
        id: 'LB-48190',
        origin: 'Fort Collins, CO',
        destination: 'Kansas City, MO',
        equipment: 'Flatbed',
        miles: 992,
        rate: 2950,
        pickup: 'Tomorrow, 9:45 AM',
        delivery: 'Sat, 2:15 PM',
        weight: '41,600 lb',
        broker: 'Summit Dispatch',
        status: 'Hot',
        lane: 'Fort Collins → Kansas City'
    },
    {
        id: 'LB-48246',
        origin: 'Grand Junction, CO',
        destination: 'Salt Lake City, UT',
        equipment: 'Dry Van',
        miles: 404,
        rate: 1875,
        pickup: 'Tomorrow, 1:00 PM',
        delivery: 'Fri, 9:30 AM',
        weight: '24,000 lb',
        broker: 'Interstate Express',
        status: 'New',
        lane: 'Grand Junction → Salt Lake'
    },
    {
        id: 'LB-48267',
        origin: 'Pueblo, CO',
        destination: 'Houston, TX',
        equipment: 'Reefer',
        miles: 1124,
        rate: 3640,
        pickup: 'Today, 4:30 PM',
        delivery: 'Sat, 8:00 AM',
        weight: '21,000 lb',
        broker: 'Midwest Logistics',
        status: 'Hot',
        lane: 'Pueblo → Houston'
    },
    {
        id: 'LB-48298',
        origin: 'Boulder, CO',
        destination: 'San Francisco, CA',
        equipment: 'Dry Van',
        miles: 1268,
        rate: 3920,
        pickup: 'Tomorrow, 6:00 AM',
        delivery: 'Sun, 4:00 PM',
        weight: '22,000 lb',
        broker: 'West Coast Freight',
        status: 'New',
        lane: 'Boulder → San Francisco'
    }
];

function saveSubmissionToLocalStore(form, payload) {
    const key = 'alphaway_form_submissions';
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    stored.push({
        submittedAt: new Date().toISOString(),
        formName: form.dataset.subject || 'AWL form',
        payload
    });
    localStorage.setItem(key, JSON.stringify(stored.slice(-50)));
}

function buildMailtoLink(form) {
    const email = form.dataset.mailto || AWL_COMPANY_EMAIL;
    const subject = encodeURIComponent(form.dataset.subject || 'AWL submission');
    const fields = {};

    Array.from(form.elements).forEach(element => {
        if (!element.name || element.type === 'submit' || element.type === 'button') {
            return;
        }
        if (element.type === 'file') {
            fields[element.name] = element.files && element.files.length ? Array.from(element.files).map(file => file.name).join(', ') : 'No file uploaded';
            return;
        }
        if (element.type === 'checkbox') {
            fields[element.name] = element.checked ? 'Yes' : 'No';
            return;
        }
        fields[element.name] = element.value;
    });

    const body = encodeURIComponent(Object.entries(fields)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n'));

    return `mailto:${email}?subject=${subject}&body=${body}`;
}

// Form submission handler
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form[data-mailto]').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const payload = {};
            Array.from(form.elements).forEach(element => {
                if (!element.name || element.type === 'submit' || element.type === 'button') {
                    return;
                }
                if (element.type === 'file') {
                    payload[element.name] = element.files && element.files.length ? Array.from(element.files).map(file => file.name) : [];
                    return;
                }
                if (element.type === 'checkbox') {
                    payload[element.name] = element.checked;
                    return;
                }
                payload[element.name] = element.value;
            });

            saveSubmissionToLocalStore(form, payload);
            window.location.href = buildMailtoLink(form);
            const status = document.createElement('p');
            status.className = 'form-status';
            status.textContent = 'Submission prepared and routed to AWL operations email. Please confirm the email client opens to send the form.';
            form.appendChild(status);
            form.reset();
        });
    });

    const signupForm = document.querySelector('.signup-form');
    if (signupForm) {
        signupForm.setAttribute('data-mailto', AWL_COMPANY_EMAIL);
        signupForm.setAttribute('data-subject', 'AWL business inquiry');
    }

    // Add smooth scroll behavior for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Utility function to format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(value);
}

// Utility function to format distance
function formatDistance(miles) {
    return miles.toLocaleString() + ' mi';
}

// Export for use in other pages
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        allStates,
        loads,
        formatCurrency,
        formatDistance
    };
}
