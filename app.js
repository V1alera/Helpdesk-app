const authScreen = document.getElementById('auth-screen');
const registerScreen = document.getElementById('register-screen');
const mainScreen = document.getElementById('main-screen');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const guestLoginBtn = document.getElementById('guest-login');

const goToRegister = document.getElementById('go-to-register');
const goToLogin = document.getElementById('go-to-login');
const logoutBtn = document.getElementById('logout-btn');

const newTicketForm = document.getElementById('new-ticket-form');
const ticketsList = document.getElementById('tickets-list');

let currentUser = null;
const saveTickets = () => localStorage.setItem('tickets', JSON.stringify(tickets));
const loadTickets = () => JSON.parse(localStorage.getItem('tickets')) || [];
let tickets = loadTickets();

const renderTickets = () => {
    ticketsList.innerHTML = '';
    const sortedTickets = [...tickets].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    sortedTickets.forEach(ticket => {
        const ticketEl = document.createElement('div');
        ticketEl.className = 'ticket';
        ticketEl.innerHTML = `
            <h3>${ticket.title}</h3>
            <div class="ticket-meta">
                <span>ID: #${ticket.id}</span>
                <span class="status-badge status-${ticket.status.replace('_', '-')}">${ticket.status.replace('_', ' ')}</span>
                <span>${new Date(ticket.created_at).toLocaleString('ru-RU')}</span>
            </div>
            <p class="ticket-desc">${ticket.description}</p>
            
            <div class="actions">
                <button class="btn-status" data-id="${ticket.id}" data-status="in_progress">Взять в работу</button>
                <button class="btn-status" data-id="${ticket.id}" data-status="closed">Закрыть</button>
            </div>

            <div class="comments">
                <h4>Комментарии:</h4>
                <div id="comments-${ticket.id}"></div>
                <input type="text" class="comment-input" placeholder="Написать комментарий..." data-id="${ticket.id}">
            </div>
        `;
        ticketsList.appendChild(ticketEl);

        ticket.comments.forEach(c => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.innerHTML = `<p>${c.text}</p><small>${new Date(c.date).toLocaleTimeString('ru-RU')}</small>`;
            document.getElementById(`comments-${ticket.id}`).appendChild(commentDiv);
        });
    });
};

const checkAuth = () => {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        authScreen.style.display = 'none';
        registerScreen.style.display = 'none';
        mainScreen.style.display = 'block';
        renderTickets();
    } else {
        mainScreen.style.display = 'none';
        authScreen.style.display = 'block';
    }
};

goToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    authScreen.style.display = 'none';
    registerScreen.style.display = 'block';
});
goToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerScreen.style.display = 'none';
    authScreen.style.display = 'block';
});

guestLoginBtn.addEventListener('click', () => {
    currentUser = { email: 'demo@uni.ru' };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    checkAuth();
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentUser = { email: loginForm.login_email.value };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    loginForm.reset();
    checkAuth();
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentUser = { email: registerForm.register_email.value };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    registerForm.reset();


checkAuth();
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('tickets');
    currentUser = null;
    tickets = [];
    checkAuth();
});

newTicketForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTicket = {
        id: Date.now(),
        title: newTicketForm.ticket_title.value,
        description: newTicketForm.ticket_desc.value,
        status: 'new',
        created_at: new Date().toISOString(),
        comments: []
    };
    tickets.push(newTicket);
    saveTickets();
    newTicketForm.reset();
    renderTickets();
});

ticketsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-status')) {
        const id = parseInt(e.target.dataset.id);
        const status = e.target.dataset.status;
        const ticket = tickets.find(t => t.id === id);
        if (ticket) {
            ticket.status = status;
            saveTickets();
            renderTickets();
        }
    }
});

ticketsList.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const input = e.target;
        if (input.classList.contains('comment-input')) {
            const id = parseInt(input.dataset.id);
            const text = input.value.trim();
            if (text) {
                const ticket = tickets.find(t => t.id === id);
                if (ticket) {
                    ticket.comments.push({
                        text: text,
                        date: new Date().toISOString()
                    });
                    saveTickets();
                    renderTickets();
                }
            }
            input.value = '';
        }
    }
});

checkAuth();