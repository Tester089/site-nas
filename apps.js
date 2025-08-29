import { WindowManager } from './windowManager.js';
import { Config } from './config.js';
import { Utils } from './utils.js';

export const Apps = {
    State: null,
    sortSettings: new Map(),

    MainMenu: {
        init() {
            WindowManager.create({
                id: 'main-menu-window',
                title: 'НАЦИОНАЛЬНАЯ АКАДЕМИЯ НАУК',
                isMainMenu: true,
                pos: { y: 100 },
                content: `
                    <div class="main-menu-container">
                        <div class="main-menu-art-panel"><img src="art-1.png" alt="NAN Art"></div>
                        <div class="main-menu-grid">
                            <button class="menu-button" data-app="Rating" data-color="blue">
                                <span class="menu-button-title">РЕЙТИНГ АКАДЕМИИ</span>
                                <span class="menu-button-subtitle">Кто возглавляет науку сегодня?</span>
                            </button>
                            <button class="menu-button" data-app="Projects" data-color="green">
                                <span class="menu-button-title">НАУЧНЫЕ ПРОЕКТЫ</span>
                                <span class="menu-button-subtitle">Сегодня самое время узнать что-то новое</span>
                            </button>
                            <button class="menu-button" data-app="NPA" data-color="orange">
                                <span class="menu-button-title">Нормативно Правовые Акты</span>
                                <span class="menu-button-subtitle">Регламенты, постановления и действующие тендеры</span>
                            </button>
                            <button class="menu-button menu-button--highlight" data-app="Application" data-color="purple">
                                <span class="menu-button-title">ПРИСОЕДИНИТЬСЯ К НАН</span>
                                <span class="menu-button-subtitle">Заполните Google форму за 15 минут </span>
                            </button>
                        </div>
                    </div>`
            });
        }
    },

    Rating: {
        init() { if (!Apps.State.rating) { return Apps._showNoDataWindow("Реестр", "Данные реестра временно недоступны."); } this._createWindow(); },
        _createWindow() { const members = Apps.State.rating.members.map(p => ({ ...p, totalRating: p.history.reduce((sum, r) => sum + (r.points || 0), 0) })).sort((a, b) => b.totalRating - a.totalRating); const win = WindowManager.create({ id: 'rating-window', title: 'НАН - РЕЙТИНГ АКАДЕМИИ', isAppLauncher: true, pos: { y: 50 }, content: `<div class="rating-grid-container"><div class="rating-g2"><img src="art-2.jpg" class="rating-icon" alt="Иконка НАН"><div class="rating-sidebar-text">RATING<br>SYSTEM</div></div><div class="rating-g3"><div class="controls"><div id="toggle-charts-checkbox" class="pixel-checkbox"></div><label for="toggle-charts-checkbox">ДИАГРАММЫ</label></div><main id="rating-container">${this._renderList(members)}</main></div><div class="rating-g4">~ NAN RATING SYSTEM V4.1 ~<br>Обновлено: ${Utils.formatDate(Apps.State.rating.lastUpdated)}</div></div>` }); this._attachHandlers(win, members); },
        _renderList(members) { return members.map(person => `<div class="rating-card" data-id="${person.nickname.replace(/\s+/g, '-')}"><div class="score-block"><span class="rating">${person.totalRating.toFixed(1)}</span><svg viewBox="0 0 32 32" class="pie-chart-svg">${this._createPieChart(person)}</svg></div><div class="nickname">${person.nickname}</div></div>`).join(''); },
        _createPieChart(person) { if (person.totalRating === 0) return ''; const categoryTotals = person.history.reduce((acc, rec) => { acc[rec.type] = (acc[rec.type] || 0) + (rec.points || 0); return acc; }, {}); if (Object.keys(categoryTotals).length === 1) { const color = Config.CATEGORY_COLORS[Object.keys(categoryTotals)[0]] || Config.CATEGORY_COLORS.default; return `<circle cx="16" cy="16" r="15" fill="${color}"></circle>`; } let startAngle = -90; return Object.entries(categoryTotals).map(([type, points]) => { const angle = (points / person.totalRating) * 360; const endAngle = startAngle + angle; const toRad = a => a * Math.PI / 180; const [sx, sy] = [16 + 15 * Math.cos(toRad(startAngle)), 16 + 15 * Math.sin(toRad(startAngle))]; const [ex, ey] = [16 + 15 * Math.cos(toRad(endAngle)), 16 + 15 * Math.sin(toRad(endAngle))]; const d = `M 16,16 L ${sx},${sy} A 15,15 0 ${angle > 180 ? 1 : 0} 1 ${ex},${ey} Z`; startAngle = endAngle; return `<path d="${d}" fill="${Config.CATEGORY_COLORS[type] || Config.CATEGORY_COLORS.default}"></path>`; }).join(''); },
        _showHistory(person) { const windowId = `history-${person.nickname.replace(/\s/g, '-')}`; if (!Apps.sortSettings.has(windowId)) { Apps.sortSettings.set(windowId, { key: 'date', dir: 'desc' }); } const win = WindowManager.create({ id: windowId, title: `${person.nickname} - История`, pos: { y: 200 }, content: `<div class="history-window-content">${person.history.length > 0 ? `<div class="history-controls"><span>Сортировать по:</span><button class="sort-btn" data-sort="date">Дате</button><button class="sort-btn" data-sort="points">Баллам</button></div>` : ''}<ul class="history-list"></ul></div>` }); this._renderHistoryList(win, person); },
        _renderHistoryList(win, person) { const windowId = win.id; const sortState = Apps.sortSettings.get(windowId); const listEl = win.querySelector('.history-list'); const sortButtons = win.querySelectorAll('.sort-btn'); const sortedHistory = [...person.history].sort((a, b) => { const aVal = sortState.key === 'date' ? new Date(a.date).getTime() : a.points; const bVal = sortState.key === 'date' ? new Date(b.date).getTime() : b.points; return sortState.dir === 'desc' ? bVal - aVal : aVal - bVal; }); sortButtons.forEach(btn => { btn.classList.remove('active'); btn.textContent = btn.dataset.sort === 'date' ? 'Дате' : 'Баллам'; if (btn.dataset.sort === sortState.key) { btn.classList.add('active'); btn.textContent += sortState.dir === 'desc' ? ' ▼' : ' ▲'; } if (!btn.onclick) { btn.onclick = () => { const newKey = btn.dataset.sort; if (sortState.key === newKey) { sortState.dir = sortState.dir === 'desc' ? 'asc' : 'desc'; } else { sortState.key = newKey; sortState.dir = 'desc'; } this._renderHistoryList(win, person); }; } }); listEl.innerHTML = sortedHistory.length ? sortedHistory.map(item => `<li><span class="history-points">+${(item.points || 0).toFixed(1)}</span><span class="history-date">[${Utils.formatDate(item.date)}]</span><span class="history-title"><span style="font-weight: bold; color:${Config.CATEGORY_COLORS[item.type] || '#000'}">${item.type}</span> - ${item.title.replace(item.type + " - ", "")}</span></li>`).join('') : '<li>История активности пуста.</li>'; },
        _attachHandlers(win, members) { win.querySelector('.controls').onclick = (e) => { const checkbox = e.target.closest('.controls').querySelector('.pixel-checkbox'); if (checkbox) { document.body.classList.toggle('charts-enabled'); checkbox.classList.toggle('checked'); } }; win.querySelector('#rating-container').onclick = e => { const card = e.target.closest('.rating-card'); if (card) { const person = members.find(p => p.nickname.replace(/\s/g, '-') === card.dataset.id); if (person) this._showHistory(person); } }; }
    },

    Projects: {
        init() {
            Apps._showNoDataWindow("Проекты", "Информация о проектах временно недоступна.");
        }
    },
    
    NPA: {
        init() {
            if (!Apps.State.npa || !Apps.State.npa.documents || Apps.State.npa.documents.length === 0) {
                return Apps._showNoDataWindow("НПА", "Документы временно недоступны.");
            }
            this._createWindow(Apps.State.npa.documents);
        },

        _createWindow(documents) {
            const documentsHTML = documents.map(doc => `
                <div class="npa-card">
                    <p class="npa-description">${doc.description}</p>
                    <a href="${doc.url}" target="_blank" class="npa-link">${doc.title}</a>
                    <div class="npa-tags-container">
                        ${doc.tags.map(tag => `<span class="npa-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `).join('');

            WindowManager.create({
                id: 'npa-window',
                title: 'НАН - НПА',
                isAppLauncher: true,
                pos: { y: 50 },
                content: `
                    <div class="npa-grid-container">
                        <div class="npa-g2">
                            <img src="art-3.png" class="npa-icon" alt="Иконка Базы Знаний">
                            <div class="npa-sidebar-text">KNOWLEDGE<br>BASE</div>
                        </div>
                        <div class="npa-g3">
                            <main id="npa-list-container">${documentsHTML}</main>
                        </div>
                        <div class="npa-g4">~ NAN KNOWLEDGE BASE V1.0 ~</div>
                    </div>
                `
            });
        }
    },

    _showNoDataWindow(title, message) {
        WindowManager.create({
            id: `${title.replace(/\s/g, '-')}-no-data`,
            title: title,
            isAppLauncher: true,
            pos: { y: 50 },
            content: `<div class="no-data-message">${message}</div>`
        });
    }
};