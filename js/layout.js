function setSidebarState(isOpen) {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (!sidebar || !overlay) return;

    const mobileView = window.innerWidth <= 1024;
    const shouldOpen = mobileView && isOpen;

    sidebar.classList.toggle('is-open', shouldOpen);
    overlay.classList.toggle('is-active', shouldOpen);
    document.body.classList.toggle('sidebar-open', shouldOpen);
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar || window.innerWidth > 1024) return;

    setSidebarState(!sidebar.classList.contains('is-open'));
}

function normalizeNavPath(pathname) {
    const cleaned = String(pathname || '')
        .replace(/index\.html$/i, '')
        .replace(/\.html$/i, '')
        .replace(/\/+$/, '');

    return cleaned || '/';
}

function injectSidebarLogout(sidebar) {
    if (!sidebar || sidebar.querySelector('.sidebar-footer')) return;

    const navMenu = sidebar.querySelector('.nav-menu');
    if (!navMenu) return;

    const footer = document.createElement('div');
    footer.className = 'sidebar-footer';
    footer.innerHTML = `
        <a href="login.html" class="sidebar-logout">
            <i class="fas fa-right-from-bracket"></i>
            <span>Logout</span>
        </a>
    `;

    sidebar.appendChild(footer);
}

function injectUserDropdown(topBar) {
    const userArea = topBar?.querySelector('.user-area');
    const avatar = userArea?.querySelector('.avatar');
    if (!userArea || !avatar || userArea.querySelector('.user-menu')) return;

    const avatarLabel = avatar.textContent.trim() || 'RK';
    const menu = document.createElement('div');
    menu.className = 'user-menu';
    menu.innerHTML = `
        <div class="user-dropdown" id="userDropdown">
            <div class="user-dropdown-head">
                <strong>Rajesh Kumar</strong>
                <span>Admin • Travel CRM Workspace</span>
            </div>
            <a href="profile.html" class="user-dropdown-link">
                <i class="fas fa-user-circle"></i>
                <span>Profile</span>
            </a>
            <a href="login.html" class="user-dropdown-link logout-link">
                <i class="fas fa-right-from-bracket"></i>
                <span>Logout</span>
            </a>
        </div>
    `;
    avatar.classList.add('avatar-btn');
    avatar.setAttribute('role', 'button');
    avatar.setAttribute('tabindex', '0');
    avatar.setAttribute('aria-label', 'Open user menu');
    avatar.setAttribute('aria-expanded', 'false');

    userArea.appendChild(menu);
    menu.prepend(avatar);

    const toggle = avatar;
    const closeMenu = () => {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', event => {
        event.stopPropagation();
        const open = menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    toggle.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const open = menu.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
    });

    document.addEventListener('click', event => {
        if (!menu.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });
}

function syncActiveNavigation() {
    const currentPath = normalizeNavPath(window.location.pathname);

    document.querySelectorAll('.nav-menu .nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.nav-menu a[href]').forEach(link => {
        const linkPath = normalizeNavPath(new URL(link.getAttribute('href'), window.location.origin).pathname);
        if (linkPath === currentPath) {
            link.closest('.nav-item')?.classList.add('active');
        }
    });
}

function initializeResponsiveLayout() {
    const sidebar = document.querySelector('.sidebar');
    const topBar = document.querySelector('.top-bar');

    if (!sidebar || !topBar) return;
    injectSidebarLogout(sidebar);
    injectUserDropdown(topBar);
    syncActiveNavigation();

    let overlay = document.getElementById('sidebarOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'sidebarOverlay';
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    if (!document.getElementById('menuToggle')) {
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.id = 'menuToggle';
        toggleButton.className = 'menu-toggle-btn';
        toggleButton.setAttribute('aria-label', 'Toggle sidebar');
        toggleButton.innerHTML = '<i class="fas fa-bars"></i>';

        const pageTitle = topBar.querySelector('.page-title');
        if (pageTitle) {
            let topBarLeft = topBar.querySelector('.top-bar-left');
            if (!topBarLeft) {
                topBarLeft = document.createElement('div');
                topBarLeft.className = 'top-bar-left';
                topBar.insertBefore(topBarLeft, topBar.firstChild);
                topBarLeft.appendChild(toggleButton);
                topBarLeft.appendChild(pageTitle);
            }
        } else {
            topBar.insertBefore(toggleButton, topBar.firstChild);
        }
    }

    document.getElementById('menuToggle')?.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', () => setSidebarState(false));

    sidebar.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => setSidebarState(false));
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            setSidebarState(false);
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            setSidebarState(false);
        }
    });

    setSidebarState(false);
}

document.addEventListener('DOMContentLoaded', initializeResponsiveLayout);

window.toggleSidebar = toggleSidebar;
window.setSidebarState = setSidebarState;
