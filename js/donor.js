// Load camps with optional filter
async function loadCamps() {
    const location = document.getElementById('search-location').value;
    const campsList = document.getElementById('camps-list');
    
    try {
        const url = new URL(`${API_URL}/donor/camps`);
        if (location) url.searchParams.append('location', location);

        const response = await fetch(url, { headers: authHeaders() });
        const camps = await response.json();

        campsList.innerHTML = camps.length === 0 ? '<p>No camps found.</p>' : '';
        
        camps.forEach(camp => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <h3>${camp.title}</h3>
                    <span class="badge ${camp.currentDonors >= camp.maxDonors ? 'badge-pending' : 'badge-approved'}">
                        ${camp.currentDonors}/${camp.maxDonors} Slots
                    </span>
                </div>
                <p><i class="fas fa-map-marker-alt"></i> ${camp.location}</p>
                <p><i class="fas fa-calendar"></i> ${new Date(camp.date).toLocaleDateString()}</p>
                <p style="margin: 1rem 0; font-size: 0.9rem; color: #666;">
                    Groups: ${camp.requiredBloodGroups.join(', ')}
                </p>
                <button onclick="bookSlot('${camp._id}')" class="btn btn-primary" style="width: 100%;" 
                    ${camp.currentDonors >= camp.maxDonors ? 'disabled' : ''}>
                    ${camp.currentDonors >= camp.maxDonors ? 'Full' : 'Register Now'}
                </button>
            `;
            campsList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading camps:', error);
    }
}

// Register for a camp
async function bookSlot(campId) {
    try {
        const response = await fetch(`${API_URL}/donor/bookings`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ campId })
        });
        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! Please wait for hospital approval.');
            loadCamps();
        } else {
            alert(data.message || 'Failed to register');
        }
    } catch (error) {
        alert('Server error');
    }
}

// Load personal bookings
async function loadBookings() {
    const bookingsList = document.getElementById('bookings-list');
    try {
        const response = await fetch(`${API_URL}/donor/bookings/my`, { headers: authHeaders() });
        const bookings = await response.json();

        bookingsList.innerHTML = bookings.length === 0 ? '<tr><td colspan="4">No history found.</td></tr>' : '';

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.campId.title}</td>
                <td>${new Date(booking.campId.date).toLocaleDateString()}</td>
                <td>${booking.campId.location}</td>
                <td><span class="badge badge-${booking.status}">${booking.status}</span></td>
            `;
            bookingsList.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// Load profile info
function loadProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    const profileInfo = document.getElementById('profile-info');
    if (user) {
        profileInfo.innerHTML = `
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Blood Group:</strong> ${user.bloodGroup || 'N/A'}</p>
            <p><strong>Location:</strong> ${user.location}</p>
        `;
    }
}
