const API_URL = 'https://b-backends.onrender.com/api';

const authHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
        };
    }
    return { 'Content-Type': 'application/json' };
};

// Login user
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data));
            return { success: true, user: data };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        return { success: false, message: 'Server error. Please try again later.' };
    }
}

// Register user
async function register(userData) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data));
            return { success: true, user: data };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        return { success: false, message: 'Server error. Please try again later.' };
    }
}

// Logout user
function logout() {
    localStorage.removeItem('user');
    window.location.href = '../login.html';
}

// Check auth status
function checkAuth(roleRequired = null) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/login.html';
        return;
    }
    if (roleRequired && user.role !== roleRequired) {
        window.location.href = user.role === 'donor' ? '/donor/dashboard.html' : '/hospital/dashboard.html';
    }
    return user;
}
