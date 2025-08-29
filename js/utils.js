export const Utils = {
    formatDate: (dateInput) => new Date(dateInput).toLocaleDateString('sv-SE'),

    createElement: (tag, options = {}) => {
        const el = document.createElement(tag);
        if (options.className) el.className = options.className;
        if (options.id) el.id = options.id;
        if (options.innerHTML) el.innerHTML = options.innerHTML;
        for (const key in options.dataset) {
            el.dataset[key] = options.dataset[key];
        }
        return el;
    },

    loadJSON: async (url) => {
        try {
            const response = await fetch(`${url}?v=${Date.now()}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.warn(`Не удалось прочитать JSON из ${url}:`, error);
            return null;
        }
    }
};
