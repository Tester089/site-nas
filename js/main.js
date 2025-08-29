import { Config } from './config.js';
import { Utils } from './utils.js';
import { Apps } from './apps.js';
import { WindowManager } from './windowManager.js';

const State = { rating: null, projects: null, npa: null };

const App = {
    async init() {
        const [ratingData, projectsData, npaData] = await Promise.all([
            Utils.loadJSON(Config.DATA_URLS.RATING), Utils.loadJSON(Config.DATA_URLS.PROJECTS), Utils.loadJSON(Config.DATA_URLS.NPA)
        ]);
        State.rating = ratingData; State.projects = projectsData; State.npa = npaData;
        Apps.State = State;
        this.initEventListeners();
        Apps.MainMenu.init();
    },

    initEventListeners() {
        document.body.addEventListener('click', (e) => {
            const menuButton = e.target.closest('.menu-button');
            if (menuButton && menuButton.dataset.app) {
                const appName = menuButton.dataset.app;
                
                if (appName === 'Application') {
                    window.open(Config.EXTERNAL_LINKS.APPLICATION_FORM, '_blank');
                    return;
                }
                
                if (Apps[appName] && typeof Apps[appName].init === 'function') {
                    Apps[appName].init();
                }
            }
            
            if (e.target.matches('.back-to-menu')) {
                WindowManager.close(e.target.closest('.angel-window').id);
            }
        });
    }
};

App.init();
