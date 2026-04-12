// Load camps created by this hospital
async function loadHospitalCamps() {
    const campsList = document.getElementById('hospital-camps-list');
    try {
        // We reuse the search API but filters should be handled better server-side 
        // For simplicity, let's assume we have a specific route or we filter here
        const response = await fetch(`${API_URL}/donor/camps`, { headers: authHeaders() });
        const allCamps = await response.json();
        
        // Filter by organizer (hospital)
        const user = JSON.parse(localStorage.getItem('user'));
        const myCamps = allCamps.filter(c => c.organizer._id === user._id);

        campsList.innerHTML = myCamps.length === 0 ? '<p>You haven\'t created any camps yet.</p>' : '';

        myCamps.forEach(camp => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${camp.title}</h3>
                <p><i class="fas fa-calendar"></i> ${new Date(camp.date).toLocaleDateString()}</p>
                <p><i class="fas fa-users"></i> ${camp.currentDonors} / ${camp.maxDonors}</p>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button onclick="viewDonors('${camp._id}', '${camp.title}')" class="btn btn-primary" style="flex: 1;">View Donors</button>
                    <button onclick="deleteCamp('${camp._id}')" class="btn btn-outline" style="color: red; border-color: red;"><i class="fas fa-trash"></i></button>
                </div>
            `;
            campsList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading hospital camps:', error);
    }
}

// Create new camp
document.getElementById('create-camp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const campData = {
        title: document.getElementById('camp-title').value,
        location: document.getElementById('camp-location').value,
        date: document.getElementById('camp-date').value,
        maxDonors: parseInt(document.getElementById('camp-max').value),
        requiredBloodGroups: document.getElementById('camp-groups').value.split(',').map(g => g.trim())
    };

    try {
        const response = await fetch(`${API_URL}/hospital/camps`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(campData)
        });
        if (response.ok) {
            alert('Camp created successfully!');
            showTab('manage-camps-tab', document.querySelector('.sidebar li'));
        } else {
            alert('Failed to create camp');
        }
    } catch (error) {
        alert('Server error');
    }
});

// View donors for a specific camp
async function viewDonors(campId, campTitle) {
    const donorsSection = document.getElementById('donors-section');
    const donorsList = document.getElementById('camp-donors-list');
    const donorsTitle = document.getElementById('donors-title');

    donorsSection.style.display = 'block';
    donorsTitle.textContent = `Donors for: ${campTitle}`;
    donorsList.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/hospital/camps/${campId}/donors`, { headers: authHeaders() });
        const bookings = await response.json();

        donorsList.innerHTML = bookings.length === 0 ? '<tr><td colspan="4">No registrations yet.</td></tr>' : '';

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.donorId.name}</td>
                <td>${booking.donorId.bloodGroup}</td>
                <td><span class="badge badge-${booking.status}">${booking.status}</span></td>
                <td>
                    ${booking.status === 'pending' ? `
                        <button onclick="updateStatus('${booking._id}', 'approved')" class="btn btn-primary" style="padding: 2px 8px; font-size: 0.8rem;">Approve</button>
                        <button onclick="updateStatus('${booking._id}', 'rejected')" class="btn btn-outline" style="padding: 2px 8px; font-size: 0.8rem;">Reject</button>
                    ` : ''}
                    ${booking.status === 'approved' ? `
                        <button onclick="updateStatus('${booking._id}', 'donated')" class="btn btn-primary" style="background: green; padding: 2px 8px; font-size: 0.8rem;">Mark Donated</button>
                    ` : ''}
                </td>
            `;
            donorsList.appendChild(row);
        });
    } catch (error) {
        console.error('Error viewing donors:', error);
    }
}

// Update booking status
async function updateStatus(bookingId, status) {
    try {
        const response = await fetch(`${API_URL}/hospital/bookings/${bookingId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status })
        });
        if (response.ok) {
            alert(`Status updated to ${status}`);
            // Find current active camp donors view and refresh
            const campTitle = document.getElementById('donors-title').textContent.split(': ')[1];
            // We need campId to refresh, but for simplicity let's just reload the whole manage tab concept 
            // or just the list if we store campId
            // Here I'll just reload the dashboard for now
            location.reload(); 
        }
    } catch (error) {
        alert('Error updating status');
    }
}

// Delete camp
async function deleteCamp(campId) {
    if (!confirm('Are you sure you want to delete this camp?')) return;
    try {
        const response = await fetch(`${API_URL}/hospital/camps/${campId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        if (response.ok) {
            loadHospitalCamps();
        }
    } catch (error) {
        alert('Error deleting camp');
    }
}

// Raise Blood Request
document.getElementById('raise-request-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const reqData = {
        bloodGroup: document.getElementById('req-group').value,
        quantity: parseInt(document.getElementById('req-qty').value)
    };

    try {
        const response = await fetch(`${API_URL}/hospital/requests`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(reqData)
        });
        if (response.ok) {
            alert('Blood request posted successfully!');
            document.getElementById('raise-request-form').reset();
        }
    } catch (error) {
        alert('Error posting request');
    }
});
