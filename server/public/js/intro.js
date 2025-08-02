document.addEventListener('DOMContentLoaded', function() {
    initForms();
    initSessionMessage();
});

function initSessionMessage() {
    const msg = document.getElementById('sessionMessage');
    if (msg) setTimeout(() => msg.remove(), 5000);
}

function initForms() {
    document.querySelector('.register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('userName').value.trim();
        if (name.length < 2) return showMessage('Name must be at least 2 characters', 'error');
        
        if (name.toLowerCase() === 'moshir ashraf') {
            return showPasswordPrompt(name);
        }
        
        await submitForm('/register', { userName: name });
    });
}

async function submitForm(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showMessage('Success! Redirecting...', 'success');
            setTimeout(() => window.location.href = result.redirectUrl || '/lobby', 1000);
        } else {
            if (result.message?.includes('already exists') || result.userExists) {
                showUserExistsOptions(data.userName);
            } else {
                showMessage(result.message || 'An error occurred', 'error');
            }
        }
    } catch (error) {
        console.error('Submit form error:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

function showPasswordPrompt(name) {
    clearMessages();
    
    const passwordElement = document.createElement('div');
    passwordElement.className = 'password-field-container';
    passwordElement.innerHTML = `
        <div class="admin-notice">
            <p><i class="fas fa-crown"></i> Instructor Access Required</p>
            <p>Please enter your password to continue.</p>
        </div>
        <input type="password" id="adminPassword" placeholder="Enter password" class="name-input" style="margin-top: 1rem;">
    `;
    
    document.querySelector('.input-group').appendChild(passwordElement);
    
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.innerHTML = '<span>Instructor Login</span><div class="btn-icon"><i class="fas fa-key"></i></div>';
    
    const form = document.querySelector('.register-form');
    form.removeEventListener('submit', handleFormSubmit);
    form.addEventListener('submit', handleInstructorLogin);
    
    setTimeout(() => document.getElementById('adminPassword').focus(), 100);
}

async function handleInstructorLogin(e) {
    e.preventDefault();
    
    const userName = document.getElementById('userName').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    const submitBtn = document.querySelector('.submit-btn');
    
    if (!password) {
        showMessage('Please enter your password.', 'error');
        return;
    }
    
    setButtonLoading(submitBtn, 'Authenticating...');
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ name: userName, password: password })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showMessage('Instructor login successful! Redirecting...', 'success');
            setTimeout(() => window.location.href = result.redirectUrl || '/admin', 1000);
        } else {
            showMessage(result.message || 'Invalid password. Please try again.', 'error');
            submitBtn.innerHTML = '<span>Instructor Login</span><div class="btn-icon"><i class="fas fa-key"></i></div>';
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Instructor login error:', error);
        showMessage('Network error. Please try again.', 'error');
        submitBtn.innerHTML = '<span>Instructor Login</span><div class="btn-icon"><i class="fas fa-key"></i></div>';
        submitBtn.disabled = false;
    }
}

function showUserExistsOptions(name) {
    clearMessages();
    
    const messageElement = document.createElement('div');
    messageElement.className = 'user-exists-message';
    messageElement.innerHTML = `
        <p style="margin-bottom: 1rem; color: #ff8a65;">The name "${name}" is already registered.</p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button onclick="loginExistingUser('${name}')" class="option-btn primary">Continue as ${name}</button>
            <button onclick="tryDifferentName()" class="option-btn secondary">Use Different Name</button>
        </div>
    `;
    
    document.querySelector('.input-group').appendChild(messageElement);
}

function loginExistingUser(userName) {
    clearMessages();
    
    fetch('/loginAsStudent', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ name: userName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(`Welcome back, ${userName}! Redirecting...`, 'success');
            setTimeout(() => window.location.href = data.redirectUrl || '/lobby', 1000);
        } else {
            showMessage(data.message || 'Login failed', 'error');
        }
    })
    .catch(error => {
        console.error('LoginAsStudent error:', error);
        showMessage('Network error. Please try again.', 'error');
    });
}

function tryDifferentName() {
    clearMessages();
    const nameInput = document.getElementById('userName');
    const submitBtn = document.querySelector('.submit-btn');
    
    nameInput.focus();
    nameInput.select();
    
    submitBtn.innerHTML = '<span>Start Learning</span><div class="btn-icon"><i class="fas fa-rocket"></i></div>';
    submitBtn.disabled = false;
    
    // Restore original form handler
    const form = document.querySelector('.register-form');
    form.removeEventListener('submit', handleInstructorLogin);
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Re-attach the original form handler
    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('userName').value.trim();
        if (name.length < 2) return showMessage('Name must be at least 2 characters', 'error');
        
        if (name.toLowerCase() === 'moshir ashraf') {
            return showPasswordPrompt(name);
        }
        
        await submitForm('/register', { userName: name });
    });
}

function setButtonLoading(button, text) {
    button.innerHTML = `<span>${text}</span><div class="btn-icon"><i class="fas fa-spinner fa-spin"></i></div>`;
    button.disabled = true;
}

function showMessage(text, type) {
    const existing = document.querySelector('.message');
    if (existing) existing.remove();
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    document.querySelector('.input-group').appendChild(message);
    setTimeout(() => message.remove(), 5000);
}

function clearMessages() {
    const messages = document.querySelectorAll('.message, .user-exists-message, .password-field-container');
    messages.forEach(msg => msg.remove());
}
