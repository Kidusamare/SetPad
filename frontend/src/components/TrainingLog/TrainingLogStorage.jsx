export class TrainingLogStorage {
    constructor() {
        this.prefix = 'training-log-table:';
        this.version = 1;
    }

    /**
     * Checks if there is enough storage space for the given number of bytes.
     * @param {number} neededBytes
     * @returns {boolean}
     */
    hasStorageSpace(neededBytes) {
        try {
            const testKey = `${this.prefix}storage-test`;
            localStorage.setItem(testKey, 'x'.repeat(neededBytes));
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return (
                e instanceof DOMException &&
                (e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError')
            );
        }
    }

    /**
     * Generates a normalized key for a table.
     * @param {string} tableName
     * @param {string} date
     * @returns {string}
     */
    generateKey(tableName, date) {
        if (!tableName || !date) {
            throw new Error('Table name and date are required for key generation');
        }
        return `${this.prefix}${tableName.trim().toLowerCase()}-${date}`;
    }

    /**
     * Saves a table to localStorage.
     * @param {string} tableName
     * @param {string} date
     * @param {object} data
     * @returns {boolean}
     */
    save(tableName, date, data) {
        if (!tableName || !date) {
            throw new Error('Table name and date are required');
        }
        try {
            const key = this.generateKey(tableName, date);
            const storageData = {
                ...data,
                id: key,
                tableName,
                date,
                lastModified: new Date().toISOString(),
                version: this.version
            };
            const dataString = JSON.stringify(storageData);
            if (!this.hasStorageSpace(dataString.length)) {
                throw new Error('Storage quota exceeded');
            }
            localStorage.setItem(key, dataString);
            localStorage.setItem(`${key}:lastOpened`, new Date().toISOString());
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            throw error;
        }
    }

    /**
     * Loads a table from localStorage.
     * @param {string} tableName
     * @param {string} date
     * @returns {object|null}
     */
    load(tableName, date) {
        try {
            const key = this.generateKey(tableName, date);
            const data = localStorage.getItem(key);
            if (!data) return null;
            try {
                return JSON.parse(data);
            } catch (e) {
                console.warn('Corrupt data for key:', key);
                return null;
            }
        } catch (error) {
            console.error('Storage load error:', error);
            return null;
        }
    }

    /**
     * Deletes a table and its metadata from localStorage.
     * @param {string} tableName
     * @param {string} date
     * @returns {boolean}
     */
    deleteTable(tableName, date) {
        try {
            const key = this.generateKey(tableName, date);
            localStorage.removeItem(key);
            localStorage.removeItem(`${key}:lastOpened`);
            return true;
        } catch (error) {
            console.error('Storage delete error:', error);
            throw error;
        }
    }

    /**
     * Listen for storage changes (multi-tab support).
     * @param {function} callback
     * @returns {function} Unsubscribe function
     */
    onStorageChange(callback) {
        window.addEventListener('storage', callback);
        return () => window.removeEventListener('storage', callback);
    }

    /**
     * Returns all tables in localStorage.
     * @returns {Array}
     */
    getAllTables() {
        const tables = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(this.prefix) && !key.includes(':lastOpened')) {
                    const rawData = localStorage.getItem(key);
                    if (rawData) {
                        try {
                            const data = JSON.parse(rawData);
                            if (data && data.tableName && data.date) {
                                tables.push({
                                    key,
                                    tableName: data.tableName,
                                    date: data.date,
                                    lastOpened: localStorage.getItem(`${key}:lastOpened`) || "",
                                    version: data.version || 1
                                });
                            }
                        } catch (e) {
                            console.warn('Skipping corrupt table data:', key);
                        }
                    }
                }
            }
            this.cleanupOrphanedLastOpened();
            return tables;
        } catch (error) {
            console.error('Storage getAllTables error:', error);
            return [];
        }
    }

    /**
     * Removes orphaned :lastOpened keys.
     */
    cleanupOrphanedLastOpened() {
        const validKeys = new Set();
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(this.prefix) && !key.includes(':lastOpened')) {
                validKeys.add(key);
            }
        }
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(this.prefix) && key.includes(':lastOpened')) {
                const mainKey = key.replace(':lastOpened', '');
                if (!validKeys.has(mainKey)) {
                    localStorage.removeItem(key);
                }
            }
        }
    }

    /**
     * Removes all tables and their metadata from localStorage.
     */
    clearAllTables() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(this.prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    /**
     * Exports all tables as an array.
     * @returns {Array}
     */
    exportAllTables() {
        return this.getAllTables();
    }

    /**
     * Imports tables from an array.
     * @param {Array} tablesArray
     */
    importTables(tablesArray) {
        if (!Array.isArray(tablesArray)) throw new Error('Input must be an array');
        tablesArray.forEach(table => {
            if (table.tableName && table.date) {
                this.save(table.tableName, table.date, table);
            }
        });
    }

    /**
     * Returns the storage key for a table.
     * @param {string} tableName
     * @param {string} date
     * @returns {string}
     */
    getTableKey(tableName, date) {
        return this.generateKey(tableName, date);
    }
}