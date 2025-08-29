import { Utils } from './utils.js';

let zIndex = 10;
const openWindows = new Map();

const _makeDraggable = (element, handle) => {
    let offsetX = 0, offsetY = 0;
    const dragMove = (e) => {
        e.preventDefault();
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
    };
    const dragEnd = () => {
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
    };
    handle.onmousedown = (e) => {
        if (e.target.tagName === 'BUTTON') return;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
    };
};

export const WindowManager = {
    create(options) {
        const { id, title, content, isAppLauncher = false, isMainMenu = false, pos = { y: 100 } } = options;

        if (isAppLauncher) {
            openWindows.forEach((win, winId) => {
                if (win.dataset.isAppLauncher === 'true') this.close(winId);
            });
        }

        const existing = document.getElementById(id);
        if (existing) {
            existing.style.zIndex = ++zIndex;
            return existing;
        }

        const win = Utils.createElement('div', { id, className: 'angel-window', dataset: { isAppLauncher, isMainMenu } });
        win.style.zIndex = ++zIndex;

        const closeButtonHTML = isMainMenu ? '' : '<button class="angel-close-button">X</button>';
        const titleBar = Utils.createElement('div', {
            className: 'angel-title-bar',
            innerHTML: `<span>${title}</span>${closeButtonHTML}`
        });

        const contentWrapper = Utils.createElement('div', { className: 'angel-content', innerHTML: content });
        win.append(titleBar, contentWrapper);
        document.getElementById('desktop').appendChild(win);

        win.style.left = `calc(50% - ${win.offsetWidth / 2}px)`;
        win.style.top = `${pos.y}px`;
        
        const closeButton = titleBar.querySelector('.angel-close-button');
        if (closeButton) {
            closeButton.onclick = () => this.close(id);
        }

        win.onmousedown = () => win.style.zIndex = ++zIndex;

        if (!isMainMenu) {
            titleBar.classList.add('draggable');
            _makeDraggable(win, titleBar);
        }

        openWindows.set(id, win);
        return win;
    },

    close(id) {
        const win = openWindows.get(id);
        if (win) {
            win.remove();
            openWindows.delete(id);
        }
    }
};