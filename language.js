/* =========================================================
   CLOUD PROJECT PLATFORM
   LANDING PAGE JAVASCRIPT
========================================================= */


/* =========================================================
   GLOBAL STATE
   IMPORTANT:
   currentLanguage MUST be initialized BEFORE
   functions that use it.
========================================================= */

let currentLanguage =
    localStorage.getItem("language") || "en";

let currentTheme =
    localStorage.getItem("theme") || "dark";


/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {

    en: {

        navPlatform: "Platform",
        navFeatures: "Features",
        navArchitecture: "Architecture",
        navSecurity: "Security",
        navDevelopers: "Developers",

        login: "Login",
        getStarted: "Get Started",

        systemOperational:
            "All Systems Operational",

        heroTitle:
            "Build. Store. Manage.",

        heroTitleHighlight:
            "Scale.",

        heroDescription:
            "A complete cloud project platform for managing projects, files, storage, users, APIs, security, data, email and system infrastructure.",

        createAccount:
            "Create Account →",

        explorePlatform:
            "Explore Platform",

        coreModules:
            "Core Modules",

        apiServices:
            "API Services",

        possibilities:
            "Possibilities",

        platformTitle:
            "Everything your projects need",

        platformDescription:
            "One unified infrastructure for your entire project lifecycle.",

        projects:
            "Projects",

        files:
            "Files",

        storage:
            "Cloud Storage",

        security:
            "Security"
    },


    fr: {

        navPlatform:
            "Plateforme",

        navFeatures:
            "Fonctionnalités",

        navArchitecture:
            "Architecture",

        navSecurity:
            "Sécurité",

        navDevelopers:
            "Développeurs",

        login:
            "Connexion",

        getStarted:
            "Commencer",

        systemOperational:
            "Tous les systèmes sont opérationnels",

        heroTitle:
            "Construisez. Stockez. Gérez.",

        heroTitleHighlight:
            "Développez.",

        heroDescription:
            "Une plateforme cloud complète pour gérer les projets, fichiers, stockage, utilisateurs, API, sécurité, données, e-mails et infrastructures système.",

        createAccount:
            "Créer un compte →",

        explorePlatform:
            "Explorer la plateforme",

        coreModules:
            "Modules principaux",

        apiServices:
            "Services API",

        possibilities:
            "Possibilités",

        platformTitle:
            "Tout ce dont vos projets ont besoin",

        platformDescription:
            "Une infrastructure unifiée pour tout le cycle de vie de vos projets.",

        projects:
            "Projets",

        files:
            "Fichiers",

        storage:
            "Stockage Cloud",

        security:
            "Sécurité"
    }

};


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeLandingPage
);


/* =========================================================
   INITIALIZATION
========================================================= */

function initializeLandingPage() {

    applyTheme();

    applyLanguage();

    setupLanguageSelector();

    setupThemeToggle();

    setupMobileMenu();

    setupSmoothScrolling();

    setupRevealAnimations();

    setupDashboardHover();

    setupKeyboardAccessibility();

}


/* =========================================================
   LANGUAGE
========================================================= */

function setupLanguageSelector() {

    const selector =
        document.getElementById(
            "languageSelector"
        );

    if (!selector) {
        return;
    }

    selector.value =
        currentLanguage;

    selector.addEventListener(
        "change",
        function (event) {

            const language =
                event.target.value;

            if (
                language !== "en" &&
                language !== "fr"
            ) {
                return;
            }

            currentLanguage =
                language;

            localStorage.setItem(
                "language",
                currentLanguage
            );

            applyLanguage();

        }
    );
}


/* =========================================================
   APPLY LANGUAGE
========================================================= */

function applyLanguage() {

    const dictionary =
        translations[currentLanguage] ||
        translations.en;


    document.documentElement.lang =
        currentLanguage;


    document
        .querySelectorAll("[data-i18n]")
        .forEach(function (element) {

            const key =
                element.dataset.i18n;

            if (
                Object.prototype.hasOwnProperty.call(
                    dictionary,
                    key
                )
            ) {

                element.textContent =
                    dictionary[key];

            }

        });


    const selector =
        document.getElementById(
            "languageSelector"
        );

    if (selector) {
        selector.value =
            currentLanguage;
    }

}


/* =========================================================
   THEME
========================================================= */

function setupThemeToggle() {

    const button =
        document.getElementById(
            "themeToggle"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        toggleTheme
    );

    updateThemeButton();

}


function toggleTheme() {

    currentTheme =
        currentTheme === "dark"
            ? "light"
            : "dark";

    localStorage.setItem(
        "theme",
        currentTheme
    );

    applyTheme();

}


function applyTheme() {

    document.body.classList.toggle(
        "light",
        currentTheme === "light"
    );

    updateThemeButton();

}


function updateThemeButton() {

    const button =
        document.getElementById(
            "themeToggle"
        );

    if (!button) {
        return;
    }

    button.textContent =
        currentTheme === "dark"
            ? "☀"
            : "☾";

    button.setAttribute(
        "aria-label",
        currentTheme === "dark"
            ? "Switch to light mode"
            : "Switch to dark mode"
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

    const button =
        document.getElementById(
            "mobileMenuButton"
        );

    const menu =
        document.getElementById(
            "mobileMenu"
        );

    if (!button || !menu) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            menu.classList.toggle(
                "active"
            );

            const isOpen =
                menu.classList.contains(
                    "active"
                );

            button.textContent =
                isOpen
                    ? "×"
                    : "☰";

            button.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        }
    );


    menu
        .querySelectorAll("a")
        .forEach(function (link) {

            link.addEventListener(
                "click",
                function () {

                    menu.classList.remove(
                        "active"
                    );

                    button.textContent =
                        "☰";

                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        });

}


/* =========================================================
   SMOOTH SCROLLING
========================================================= */

function setupSmoothScrolling() {

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            targetId
                        );

                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    const navbar =
                        document.querySelector(
                            ".navbar"
                        );

                    const offset =
                        navbar
                            ? navbar.offsetHeight
                            : 0;


                    const position =
                        target.getBoundingClientRect()
                            .top
                        +
                        window.scrollY
                        -
                        offset
                        -
                        10;


                    window.scrollTo({
                        top: position,
                        behavior: "smooth"
                    });

                }
            );

        });

}


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

function setupRevealAnimations() {

    const elements =
        document.querySelectorAll(
            ".section, .module-card, " +
            ".architecture-layer, " +
            ".feature-item, " +
            ".security-grid div, " +
            ".developer-box, .cta-box"
        );


    elements.forEach(function (element) {

        element.classList.add(
            "reveal"
        );

    });


    if (
        !("IntersectionObserver" in window)
    ) {

        elements.forEach(
            function (element) {

                element.classList.add(
                    "visible"
                );

            }
        );

        return;
    }


    const observer =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(
                    function (entry) {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.10
            }
        );


    elements.forEach(
        function (element) {

            observer.observe(
                element
            );

        }
    );

}


/* =========================================================
   DASHBOARD INTERACTION
========================================================= */

function setupDashboardHover() {

    const dashboard =
        document.querySelector(
            ".dashboard-window"
        );

    if (!dashboard) {
        return;
    }


    dashboard.addEventListener(
        "mousemove",
        function (event) {

            if (
                window.innerWidth < 900
            ) {
                return;
            }


            const rect =
                dashboard.getBoundingClientRect();


            const x =
                event.clientX -
                rect.left;


            const y =
                event.clientY -
                rect.top;


            const rotateY =
                ((x / rect.width) - 0.5)
                * 5;


            const rotateX =
                ((y / rect.height) - 0.5)
                * -4;


            dashboard.style.transform =
                `perspective(1000px)
                 rotateY(${rotateY}deg)
                 rotateX(${rotateX}deg)`;

        }
    );


    dashboard.addEventListener(
        "mouseleave",
        function () {

            dashboard.style.transform =
                "perspective(1000px) " +
                "rotateY(-4deg) " +
                "rotateX(2deg)";

        }
    );

}


/* =========================================================
   KEYBOARD ACCESSIBILITY
========================================================= */

function setupKeyboardAccessibility() {

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeMobileMenu();

            }

        }
    );

}


/* =========================================================
   CLOSE MOBILE MENU
========================================================= */

function closeMobileMenu() {

    const menu =
        document.getElementById(
            "mobileMenu"
        );

    const button =
        document.getElementById(
            "mobileMenuButton"
        );


    if (!menu) {
        return;
    }


    menu.classList.remove(
        "active"
    );


    if (button) {

        button.textContent =
            "☰";

        button.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/* =========================================================
   RESIZE HANDLING
========================================================= */

window.addEventListener(
    "resize",
    function () {

        if (
            window.innerWidth > 1100
        ) {

            closeMobileMenu();

        }

    }
);


/* =========================================================
   PUBLIC API
   Useful later when connecting
   the landing page to your backend.
========================================================= */

window.CloudPlatform = {

    getLanguage: function () {
        return currentLanguage;
    },

    setLanguage: function (language) {

        if (
            language !== "en" &&
            language !== "fr"
        ) {
            return false;
        }

        currentLanguage =
            language;

        localStorage.setItem(
            "language",
            language
        );

        applyLanguage();

        return true;
    },


    getTheme: function () {
        return currentTheme;
    },

    setTheme: function (theme) {

        if (
            theme !== "dark" &&
            theme !== "light"
        ) {
            return false;
        }

        currentTheme =
            theme;

        localStorage.setItem(
            "theme",
            theme
        );

        applyTheme();

        return true;
    }

};