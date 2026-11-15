/* ═══════════════════════════════════════════
   CourseFlow — SPA Logic + GSAP Choreography
   ═══════════════════════════════════════════ */

(() => {
    'use strict';

    // ── API helper & Demo / Offline Engine ───────────────────────────
    const isStaticDeploy = window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:';

    const INITIAL_COURSES = [
        { id: 1, courseCode: 'CS101', title: 'Introduction to Computer Science', instructor: 'Dr. Alan Turing', capacity: 35, enrolled: 12, scheduleTime: 'Mon/Wed 9:00–10:30 AM' },
        { id: 2, courseCode: 'CS201', title: 'Data Structures & Algorithms', instructor: 'Dr. Ada Lovelace', capacity: 30, enrolled: 28, scheduleTime: 'Tue/Thu 11:00 AM–12:30 PM' },
        { id: 3, courseCode: 'CS301', title: 'Database Management Systems', instructor: 'Dr. Edgar Codd', capacity: 25, enrolled: 25, scheduleTime: 'Mon/Wed 2:00–3:30 PM' },
        { id: 4, courseCode: 'CS401', title: 'Artificial Intelligence', instructor: 'Dr. John McCarthy', capacity: 20, enrolled: 18, scheduleTime: 'Tue/Thu 9:00–10:30 AM' },
        { id: 5, courseCode: 'CS501', title: 'Software Engineering', instructor: 'Dr. Fred Brooks', capacity: 40, enrolled: 15, scheduleTime: 'Mon/Wed 11:00 AM–12:30 PM' },
        { id: 6, courseCode: 'CS601', title: 'Computer Networks', instructor: 'Dr. Vint Cerf', capacity: 30, enrolled: 9, scheduleTime: 'Tue/Thu 2:00–3:30 PM' },
        { id: 7, courseCode: 'MA101', title: 'Calculus I', instructor: 'Dr. Isaac Newton', capacity: 50, enrolled: 42, scheduleTime: 'Mon/Wed/Fri 8:00–9:00 AM' },
        { id: 8, courseCode: 'MA201', title: 'Linear Algebra', instructor: 'Dr. Carl Gauss', capacity: 35, enrolled: 20, scheduleTime: 'Tue/Thu 4:00–5:30 PM' },
        { id: 9, courseCode: 'PH101', title: 'Physics I — Mechanics', instructor: 'Dr. Richard Feynman', capacity: 40, enrolled: 22, scheduleTime: 'Mon/Wed 4:00–5:30 PM' },
        { id: 10, courseCode: 'EN101', title: 'Technical Writing', instructor: 'Dr. William Strunk', capacity: 45, enrolled: 16, scheduleTime: 'Fri 10:00 AM–12:00 PM' }
    ];

    function getStorage(key, fallback) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : fallback;
        } catch { return fallback; }
    }
    function setStorage(key, val) {
        try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    }

    // Client-side mock handler for GitHub Pages demo
    async function mockApi(path, opts = {}) {
        const method = (opts.method || 'GET').toUpperCase();
        const body = opts.body ? JSON.parse(opts.body) : {};

        let session = getStorage('cf_session', null);
        let courses = getStorage('cf_courses', null);
        if (!courses || !Array.isArray(courses) || courses.length === 0) {
            courses = JSON.parse(JSON.stringify(INITIAL_COURSES));
            setStorage('cf_courses', courses);
        }
        let enrollments = getStorage('cf_enrollments', []);
        let notifications = getStorage('cf_notifications', []);
        let users = getStorage('cf_users', [
            { id: 1, name: 'Demo Student', email: 'student@university.edu', password: 'password123' }
        ]);

        // Route: /auth/me
        if (path === '/auth/me') {
            if (session) return { success: true, message: 'Authenticated', data: session };
            return { success: false, message: 'Not authenticated' };
        }

        // Route: /auth/login
        if (path === '/auth/login' && method === 'POST') {
            const user = users.find(u => u.email.toLowerCase() === body.email.toLowerCase() && u.password === body.password);
            if (!user) return { success: false, message: 'Invalid email or password' };
            session = { id: user.id, name: user.name, email: user.email };
            setStorage('cf_session', session);
            return { success: true, message: 'Login successful', data: session };
        }

        // Route: /auth/register
        if (path === '/auth/register' && method === 'POST') {
            if (users.some(u => u.email.toLowerCase() === body.email.toLowerCase())) {
                return { success: false, message: 'An account with this email already exists' };
            }
            const newUser = { id: Date.now(), name: body.name, email: body.email, password: body.password };
            users.push(newUser);
            setStorage('cf_users', users);
            session = { id: newUser.id, name: newUser.name, email: newUser.email };
            setStorage('cf_session', session);
            return { success: true, message: 'Registration successful', data: session };
        }

        // Route: /auth/logout
        if (path === '/auth/logout' && method === 'POST') {
            localStorage.removeItem('cf_session');
            return { success: true, message: 'Logged out' };
        }

        // Route: /courses
        if (path === '/courses' && method === 'GET') {
            const withAvail = courses.map(c => ({
                ...c,
                available: Math.max(0, c.capacity - c.enrolled)
            }));
            return { success: true, message: 'Courses loaded', data: withAvail };
        }

        // Route: /enrollments
        if (path === '/enrollments') {
            if (!session) return { success: false, message: 'Not authenticated' };

            if (method === 'GET') {
                const myEnrolls = enrollments.filter(e => e.studentId === session.id);
                return { success: true, message: 'Enrollments loaded', data: myEnrolls };
            }

            if (method === 'POST') {
                const targetCourse = courses.find(c => c.id === body.courseId);
                if (!targetCourse) return { success: false, message: 'Course not found' };

                const already = enrollments.find(e => e.studentId === session.id && e.courseId === body.courseId);
                if (already) return { success: false, message: 'You are already enrolled in this course' };

                if (targetCourse.enrolled >= targetCourse.capacity) {
                    return { success: false, message: 'Course is full — no seats available' };
                }

                const myEnrolls = enrollments.filter(e => e.studentId === session.id);
                const conflict = myEnrolls.find(e => e.scheduleTime === targetCourse.scheduleTime);
                if (conflict) {
                    return { success: false, message: `Schedule conflict with ${conflict.courseCode} — ${conflict.title}` };
                }

                targetCourse.enrolled += 1;
                setStorage('cf_courses', courses);

                const newEnrollment = {
                    enrollmentId: Date.now(),
                    studentId: session.id,
                    courseId: targetCourse.id,
                    courseCode: targetCourse.courseCode,
                    title: targetCourse.title,
                    instructor: targetCourse.instructor,
                    scheduleTime: targetCourse.scheduleTime,
                    status: 'ENROLLED'
                };
                enrollments.push(newEnrollment);
                setStorage('cf_enrollments', enrollments);

                notifications.unshift({
                    id: Date.now(),
                    studentId: session.id,
                    message: `✓ Enrolled in ${targetCourse.courseCode} — ${targetCourse.title}`,
                    isRead: false,
                    timestamp: new Date().toISOString()
                });
                setStorage('cf_notifications', notifications);

                return { success: true, message: 'Enrolled successfully' };
            }
        }

        // Route: DELETE /enrollments/:id
        if (path.startsWith('/enrollments/') && method === 'DELETE') {
            if (!session) return { success: false, message: 'Not authenticated' };
            const eid = Number(path.split('/')[2]);
            const idx = enrollments.findIndex(e => e.enrollmentId === eid && e.studentId === session.id);
            if (idx === -1) return { success: false, message: 'Enrollment not found' };

            const removed = enrollments.splice(idx, 1)[0];
            setStorage('cf_enrollments', enrollments);

            const c = courses.find(item => item.id === removed.courseId);
            if (c && c.enrolled > 0) {
                c.enrolled -= 1;
                setStorage('cf_courses', courses);
            }

            notifications.unshift({
                id: Date.now(),
                studentId: session.id,
                message: `✗ Dropped ${removed.courseCode} — ${removed.title}`,
                isRead: false,
                timestamp: new Date().toISOString()
            });
            setStorage('cf_notifications', notifications);

            return { success: true, message: 'Dropped successfully' };
        }

        // Route: /notifications
        if (path === '/notifications' && method === 'GET') {
            if (!session) return { success: false, message: 'Not authenticated' };
            const myNotifs = notifications.filter(n => n.studentId === session.id);
            const unreadCount = myNotifs.filter(n => !n.isRead).length;
            return { success: true, message: 'Notifications loaded', data: { notifications: myNotifs, unreadCount } };
        }

        // Route: /notifications/:id/read
        if (path.startsWith('/notifications/') && path.endsWith('/read') && method === 'PUT') {
            const nid = Number(path.split('/')[2]);
            const notif = notifications.find(n => n.id === nid);
            if (notif) notif.isRead = true;
            setStorage('cf_notifications', notifications);
            return { success: true, message: 'Marked as read' };
        }

        return { success: false, message: 'Endpoint not found' };
    }

    const api = async (path, opts = {}) => {
        if (isStaticDeploy) {
            return mockApi(path, opts);
        }
        try {
            const res = await fetch(`/api${path}`, {
                headers: { 'Content-Type': 'application/json' },
                ...opts,
            });
            if (res.ok) {
                return await res.json();
            }
            // If backend returned 404/502 (e.g. static server without Spring Boot)
            return mockApi(path, opts);
        } catch {
            // Network failure connecting to localhost:8080 - fall back to mock
            return mockApi(path, opts);
        }
    };

    // ── DOM refs ─────────────────────────────
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const navbar        = $('#navbar');
    const navLinks      = $$('.nav-link');
    const navUser       = $('#navUser');
    const userName      = $('#userName');
    const userAvatar    = $('#userAvatar');
    const bellBtn       = $('#bellBtn');
    const bellBadge     = $('#bellBadge');
    const logoutBtn     = $('#logoutBtn');

    const viewAuth       = $('#viewAuth');
    const viewDashboard  = $('#viewDashboard');
    const viewEnrollments = $('#viewEnrollments');

    const loginForm     = $('#loginForm');
    const registerForm  = $('#registerForm');
    const authTabs      = $$('.auth-tab');
    const authTabWrap   = $('.auth-tabs');
    const authError     = $('#authError');

    const courseGrid    = $('#courseGrid');
    const courseSearch  = $('#courseSearch');
    const enrollList    = $('#enrollmentsList');
    const emptyEnroll   = $('#emptyEnrollments');

    const notifOverlay  = $('#notifOverlay');
    const notifPanel    = $('#notifPanel');
    const notifClose    = $('#notifClose');
    const notifList     = $('#notifList');
    const notifEmpty    = $('#notifEmpty');

    const modalOverlay  = $('#modalOverlay');
    const modalTitle    = $('#modalTitle');
    const modalMessage  = $('#modalMessage');
    const modalCancel   = $('#modalCancel');
    const modalConfirm  = $('#modalConfirm');

    const toastContainer = $('#toastContainer');

    // ── State ────────────────────────────────
    let currentUser  = null;
    let courses      = [];
    let enrollments  = [];
    let enrolledIds  = new Set();

    // ══════════════════════════════════════════
    //  INIT
    // ══════════════════════════════════════════
    async function init() {
        const res = await api('/auth/me');
        if (res.success) {
            currentUser = res.data;
            showApp();
        } else {
            showAuth();
        }
    }

    // ══════════════════════════════════════════
    //  AUTH
    // ══════════════════════════════════════════
    function showAuth() {
        viewAuth.classList.remove('hidden');
        viewDashboard.classList.add('hidden');
        viewEnrollments.classList.add('hidden');
        navbar.style.display = 'none';

        // GSAP entrance
        gsap.fromTo('.auth-card',
            { opacity: 0, y: 30, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
        );
    }

    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const t = tab.dataset.tab;
            authTabs.forEach(b => b.classList.remove('active'));
            tab.classList.add('active');
            authTabWrap.dataset.active = t;

            if (t === 'login') {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
            } else {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
            }
            authError.classList.add('hidden');
        });
    });

    // Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.classList.add('hidden');
        const btn = loginForm.querySelector('.btn');
        btn.style.pointerEvents = 'none';
        btn.querySelector('span').textContent = 'Signing in…';

        const res = await api('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: $('#loginEmail').value.trim(),
                password: $('#loginPassword').value,
            }),
        });

        if (res.success) {
            currentUser = res.data;
            showApp();
        } else {
            authError.textContent = res.message;
            authError.classList.remove('hidden');
            gsap.fromTo(authError, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
        }

        btn.style.pointerEvents = '';
        btn.querySelector('span').textContent = 'Sign In';
    });

    // Register
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.classList.add('hidden');
        const btn = registerForm.querySelector('.btn');
        btn.style.pointerEvents = 'none';
        btn.querySelector('span').textContent = 'Creating…';

        const res = await api('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                name: $('#regName').value.trim(),
                email: $('#regEmail').value.trim(),
                password: $('#regPassword').value,
            }),
        });

        if (res.success) {
            currentUser = res.data;
            showApp();
            toast('success', `Welcome, ${currentUser.name}! Your account is ready.`);
        } else {
            authError.textContent = res.message;
            authError.classList.remove('hidden');
            gsap.fromTo(authError, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
        }

        btn.style.pointerEvents = '';
        btn.querySelector('span').textContent = 'Create Account';
    });

    // Logout
    logoutBtn.addEventListener('click', async () => {
        await api('/auth/logout', { method: 'POST' });
        currentUser = null;
        showAuth();
    });

    // ══════════════════════════════════════════
    //  APP (post-login)
    // ══════════════════════════════════════════
    function showApp() {
        viewAuth.classList.add('hidden');
        navbar.style.display = '';

        userName.textContent = currentUser.name;
        userAvatar.textContent = currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

        // GSAP nav entrance
        gsap.to(navbar, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });

        switchView('dashboard');
    }

    // ══════════════════════════════════════════
    //  VIEW SWITCHING
    // ══════════════════════════════════════════
    function switchView(name) {
        viewDashboard.classList.add('hidden');
        viewEnrollments.classList.add('hidden');

        navLinks.forEach(l => l.classList.remove('active'));
        document.querySelector(`.nav-link[data-view="${name}"]`)?.classList.add('active');

        if (name === 'dashboard') {
            viewDashboard.classList.remove('hidden');
            loadCourses();
        } else if (name === 'enrollments') {
            viewEnrollments.classList.remove('hidden');
            loadEnrollments();
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => switchView(link.dataset.view));
    });

    // ══════════════════════════════════════════
    //  COURSES
    // ══════════════════════════════════════════
    async function loadCourses() {
        // Show skeleton loaders
        courseGrid.innerHTML = Array(6).fill('').map(() =>
            `<div class="glass-card course-card skeleton" style="height:260px"></div>`
        ).join('');

        const [courseRes, enrollRes] = await Promise.all([
            api('/courses'),
            api('/enrollments'),
        ]);

        courses     = courseRes.success ? courseRes.data : [];
        enrollments = enrollRes.success ? enrollRes.data : [];
        enrolledIds = new Set(enrollments.map(e => e.courseId));

        renderCourses(courses);
        loadNotificationBadge();
    }

    function renderCourses(list) {
        if (!list.length) {
            courseGrid.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1">
                    <h3>No courses found</h3>
                    <p>Try a different search term.</p>
                </div>`;
            return;
        }

        courseGrid.innerHTML = list.map(c => {
            const pct = c.capacity > 0 ? Math.round((c.enrolled / c.capacity) * 100) : 100;
            const barClass = pct >= 100 ? 'full' : pct >= 75 ? 'warn' : '';
            const isEnrolled = enrolledIds.has(c.id);
            const isFull = c.available <= 0;

            let btnHtml;
            if (isEnrolled) {
                btnHtml = `<button class="btn btn-sm btn-enrolled" disabled>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px"><polyline points="20 6 9 17 4 12"/></svg>
                    Enrolled</button>`;
            } else if (isFull) {
                btnHtml = `<button class="btn btn-sm btn-full-course" disabled>Course Full</button>`;
            } else {
                btnHtml = `<button class="btn btn-sm btn-enroll" data-course-id="${c.id}">Enroll Now</button>`;
            }

            return `
            <div class="glass-card course-card" data-course-id="${c.id}">
                <span class="course-code">${c.courseCode}</span>
                <h3 class="course-title">${c.title}</h3>
                <p class="course-instructor">${c.instructor}</p>
                <div class="course-meta">
                    <div class="course-meta-row">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <span>${c.scheduleTime}</span>
                    </div>
                    <div class="capacity-bar-wrap">
                        <div class="capacity-label">
                            <span>Seats</span>
                            <span>${c.enrolled}/${c.capacity}</span>
                        </div>
                        <div class="capacity-bar">
                            <div class="capacity-fill ${barClass}" style="width:${Math.min(pct, 100)}%"></div>
                        </div>
                    </div>
                </div>
                <div class="course-card-actions">
                    ${btnHtml}
                </div>
            </div>`;
        }).join('');

        // GSAP stagger entrance
        gsap.fromTo('.course-card',
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }
        );

        // Enroll click handlers
        courseGrid.querySelectorAll('.btn-enroll').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                enrollInCourse(Number(btn.dataset.courseId));
            });
        });
    }

    // Search / filter
    courseSearch.addEventListener('input', () => {
        const q = courseSearch.value.toLowerCase().trim();
        if (!q) {
            renderCourses(courses);
            return;
        }
        const filtered = courses.filter(c =>
            c.title.toLowerCase().includes(q) ||
            c.courseCode.toLowerCase().includes(q) ||
            c.instructor.toLowerCase().includes(q)
        );
        renderCourses(filtered);
    });

    // ══════════════════════════════════════════
    //  ENROLLMENT
    // ══════════════════════════════════════════
    async function enrollInCourse(courseId) {
        const btn = courseGrid.querySelector(`.btn-enroll[data-course-id="${courseId}"]`);
        if (btn) {
            btn.textContent = 'Enrolling…';
            btn.style.pointerEvents = 'none';
        }

        const res = await api('/enrollments', {
            method: 'POST',
            body: JSON.stringify({ courseId }),
        });

        if (res.success) {
            toast('success', 'Successfully enrolled!');
            // Micro-interaction: pulse the card
            const card = courseGrid.querySelector(`.course-card[data-course-id="${courseId}"]`);
            if (card) {
                gsap.fromTo(card,
                    { boxShadow: '0 0 0 0 rgba(48,209,88,0.5)' },
                    { boxShadow: '0 0 0 12px rgba(48,209,88,0)', duration: 0.6, ease: 'power2.out' }
                );
            }
            await loadCourses();
        } else {
            toast('error', res.message);
            if (btn) {
                btn.textContent = 'Enroll Now';
                btn.style.pointerEvents = '';
            }
        }
    }

    // ══════════════════════════════════════════
    //  MY ENROLLMENTS
    // ══════════════════════════════════════════
    async function loadEnrollments() {
        enrollList.innerHTML = Array(3).fill('').map(() =>
            `<div class="glass-card enrollment-card skeleton" style="height:80px"></div>`
        ).join('');

        const res = await api('/enrollments');
        enrollments = res.success ? res.data : [];

        if (!enrollments.length) {
            enrollList.innerHTML = '';
            emptyEnroll.classList.remove('hidden');
            gsap.fromTo(emptyEnroll, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 });
            return;
        }

        emptyEnroll.classList.add('hidden');
        enrollList.innerHTML = enrollments.map(e => `
            <div class="glass-card enrollment-card" data-enrollment-id="${e.enrollmentId}">
                <div class="enrollment-info">
                    <span class="enrollment-code">${e.courseCode}</span>
                    <div class="enrollment-details">
                        <h4>${e.title}</h4>
                        <p>${e.instructor} · ${e.scheduleTime}</p>
                    </div>
                </div>
                <span class="enrollment-status">${e.status}</span>
                <button class="btn-drop" data-eid="${e.enrollmentId}" data-label="${e.courseCode} — ${e.title}">
                    Drop Course
                </button>
            </div>
        `).join('');

        gsap.fromTo('.enrollment-card',
            { opacity: 0, x: -16 },
            { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
        );

        enrollList.querySelectorAll('.btn-drop').forEach(btn => {
            btn.addEventListener('click', () => {
                showModal(
                    'Drop Course?',
                    `Are you sure you want to drop ${btn.dataset.label}?`,
                    async () => {
                        const r = await api(`/enrollments/${btn.dataset.eid}`, { method: 'DELETE' });
                        if (r.success) {
                            toast('info', 'Course dropped.');
                            // Animate out
                            const card = enrollList.querySelector(
                                `.enrollment-card[data-enrollment-id="${btn.dataset.eid}"]`);
                            if (card) {
                                gsap.to(card, {
                                    opacity: 0, x: 40, height: 0, padding: 0, marginBottom: 0,
                                    duration: 0.35, ease: 'power2.in',
                                    onComplete: () => loadEnrollments(),
                                });
                            } else {
                                loadEnrollments();
                            }
                        } else {
                            toast('error', r.message);
                        }
                    }
                );
            });
        });
    }

    // ══════════════════════════════════════════
    //  NOTIFICATIONS
    // ══════════════════════════════════════════
    bellBtn.addEventListener('click', openNotifications);
    notifClose.addEventListener('click', closeNotifications);
    notifOverlay.addEventListener('click', closeNotifications);

    function openNotifications() {
        notifOverlay.classList.remove('hidden');
        requestAnimationFrame(() => notifOverlay.classList.add('visible'));
        notifPanel.classList.add('open');
        loadNotifications();
    }

    function closeNotifications() {
        notifOverlay.classList.remove('visible');
        notifPanel.classList.remove('open');
        setTimeout(() => notifOverlay.classList.add('hidden'), 300);
    }

    async function loadNotifications() {
        const res = await api('/notifications');
        if (!res.success) return;

        const { notifications, unreadCount } = res.data;
        updateBadge(unreadCount);

        if (!notifications.length) {
            notifList.classList.add('hidden');
            notifEmpty.classList.remove('hidden');
            return;
        }

        notifEmpty.classList.add('hidden');
        notifList.classList.remove('hidden');
        notifList.innerHTML = notifications.map(n => `
            <div class="notif-item ${n.isRead ? '' : 'unread'}" data-nid="${n.id}">
                <p class="notif-message">${n.message}</p>
                <span class="notif-time">${formatTime(n.timestamp)}</span>
            </div>
        `).join('');

        gsap.fromTo('.notif-item',
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out' }
        );

        // Mark as read on click
        notifList.querySelectorAll('.notif-item.unread').forEach(item => {
            item.addEventListener('click', async () => {
                await api(`/notifications/${item.dataset.nid}/read`, { method: 'PUT' });
                item.classList.remove('unread');
                const badge = parseInt(bellBadge.textContent) - 1;
                updateBadge(Math.max(0, badge));
            });
        });
    }

    async function loadNotificationBadge() {
        const res = await api('/notifications');
        if (res.success) updateBadge(res.data.unreadCount);
    }

    function updateBadge(count) {
        bellBadge.textContent = count;
        if (count > 0) {
            bellBadge.classList.add('visible');
            // Micro-interaction: bell wiggle
            gsap.fromTo(bellBtn, { rotation: 0 },
                { rotation: 15, duration: 0.1, yoyo: true, repeat: 3, ease: 'power1.inOut' });
        } else {
            bellBadge.classList.remove('visible');
        }
    }

    // ══════════════════════════════════════════
    //  MODAL
    // ══════════════════════════════════════════
    let modalCallback = null;

    function showModal(title, message, onConfirm) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalCallback = onConfirm;
        modalOverlay.classList.remove('hidden');
        requestAnimationFrame(() => modalOverlay.classList.add('visible'));
    }

    function hideModal() {
        modalOverlay.classList.remove('visible');
        setTimeout(() => modalOverlay.classList.add('hidden'), 250);
        modalCallback = null;
    }

    modalCancel.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) hideModal();
    });
    modalConfirm.addEventListener('click', () => {
        if (modalCallback) modalCallback();
        hideModal();
    });

    // ══════════════════════════════════════════
    //  TOAST
    // ══════════════════════════════════════════
    function toast(type, message) {
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        };

        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
        toastContainer.appendChild(el);

        gsap.fromTo(el,
            { opacity: 0, x: 40, scale: 0.95 },
            { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: 'power3.out' }
        );

        setTimeout(() => {
            gsap.to(el, {
                opacity: 0, x: 40, duration: 0.3, ease: 'power2.in',
                onComplete: () => el.remove(),
            });
        }, 4000);
    }

    // ══════════════════════════════════════════
    //  HELPERS
    // ══════════════════════════════════════════
    function formatTime(isoStr) {
        try {
            const d = new Date(isoStr);
            const now = new Date();
            const diff = now - d;
            if (diff < 60000)       return 'Just now';
            if (diff < 3600000)     return `${Math.floor(diff / 60000)}m ago`;
            if (diff < 86400000)    return `${Math.floor(diff / 3600000)}h ago`;
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        } catch {
            return '';
        }
    }

    // Keyboard shortcut: Escape closes panels
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!modalOverlay.classList.contains('hidden')) hideModal();
            else if (notifPanel.classList.contains('open')) closeNotifications();
        }
    });

    // ── Boot ─────────────────────────────────
    init();
})();
