document.addEventListener('DOMContentLoaded', () => {
    // === CONFIGURATION ===
    const BLUR_ID = 'command-blur';
    const COMMAND_SELECTOR = '.quick-input-widget';
    const WORKBENCH_SELECTOR = '.monaco-workbench';
    const STICKY_WIDGETS = ['.sticky-widget', '.monaco-tree-sticky-container'];
    const DEBUG = false; // set to true to enable logging

    // === STYLES ===
    const style = document.createElement('style');
    style.id = 'command-blur-style';
    style.textContent = `
        #${BLUR_ID} {
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            z-index: 1000;
            backdrop-filter: blur(6px) brightness(0.95);
            background: rgba(40, 40, 50, 0.4);
            transition: opacity 0.2s ease-in-out;
            opacity: 1;
            cursor: pointer;
        }
        #${BLUR_ID}.fadeout {
            opacity: 0;
        }
    `;
    document.head.appendChild(style);

    // === HELPERS ===
    const log = (...args) => DEBUG && console.log('[BlurOverlay]', ...args);

    const toggleWidgets = (visible) => {
        STICKY_WIDGETS.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.opacity = visible ? 1 : 0;
            });
        });
    };

    const addBlur = () => {
        if (document.getElementById(BLUR_ID)) return;

        const target = document.querySelector(WORKBENCH_SELECTOR);
        if (!target) return log('Workbench not found');

        const blur = document.createElement('div');
        blur.id = BLUR_ID;

        blur.addEventListener('click', removeBlur);
        target.appendChild(blur);
        toggleWidgets(false);
        log('Blur added');
    };

    const removeBlur = () => {
        const blur = document.getElementById(BLUR_ID);
        if (blur) {
            blur.classList.add('fadeout');
            setTimeout(() => blur.remove(), 200);
        }
        toggleWidgets(true);
        log('Blur removed');
    };

    const handleEscape = (event) => {
        if (event.key === 'Escape' || event.key === 'Esc') {
            removeBlur();
        }
    };

    // === MAIN LOGIC ===
    const setupObserver = (dialog) => {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(m => {
                if (m.attributeName === 'style') {
                    const visible = dialog.style.display !== 'none';
                    visible ? addBlur() : removeBlur();
                }
            });
        });
        observer.observe(dialog, { attributes: true });
        log('Observer attached to command palette');
    };

    // === INIT ===
    const interval = setInterval(() => {
        const dialog = document.querySelector(COMMAND_SELECTOR);
        if (dialog) {
            clearInterval(interval);
            if (dialog.style.display !== 'none') addBlur();
            setupObserver(dialog);
        } else {
            log('Waiting for command palette...');
        }
    }, 500);

    // === KEYBOARD HANDLER ===
    document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
            event.preventDefault();
            addBlur();
        } else {
            handleEscape(event);
        }
    });
});
