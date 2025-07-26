class AICache {
    constructor() {
        this.cache = new Map();
        this.lastRequestTimes = new Map();
        this.MIN_REQUEST_INTERVAL = 30000; // 30 seconds minimum between requests
        this.CACHE_DURATION = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds
    }

    // Generate cache key based on parameters
    generateCacheKey(endpoint, params = {}) {
        const sortedParams = Object.keys(params).sort().reduce((result, key) => {
            result[key] = params[key];
            return result;
        }, {});
        return `${endpoint}:${JSON.stringify(sortedParams)}`;
    }

    // Check if we should allow a new request (rate limiting)
    canMakeRequest(cacheKey) {
        const now = Date.now();
        const lastRequestTime = this.lastRequestTimes.get(cacheKey);
        
        if (!lastRequestTime) {
            return true;
        }
        
        return (now - lastRequestTime) >= this.MIN_REQUEST_INTERVAL;
    }

    // Get cached data if it exists and hasn't expired
    getCachedData(cacheKey) {
        const cachedItem = this.cache.get(cacheKey);
        
        if (!cachedItem) {
            return null;
        }
        
        const now = Date.now();
        const isExpired = (now - cachedItem.timestamp) > this.CACHE_DURATION;
        
        if (isExpired) {
            this.cache.delete(cacheKey);
            this.lastRequestTimes.delete(cacheKey);
            return null;
        }
        
        return cachedItem.data;
    }

    // Cache data with timestamp
    setCachedData(cacheKey, data) {
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
        this.lastRequestTimes.set(cacheKey, Date.now());
    }

    // Clear all expired cache entries
    clearExpiredCache() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if ((now - item.timestamp) > this.CACHE_DURATION) {
                this.cache.delete(key);
                this.lastRequestTimes.delete(key);
            }
        }
    }

    // Force refresh cache for a specific key
    forceRefreshCache(cacheKey) {
        this.cache.delete(cacheKey);
        this.lastRequestTimes.delete(cacheKey);
    }

    // Get cache info for debugging
    getCacheInfo() {
        return {
            cacheSize: this.cache.size,
            entries: Array.from(this.cache.keys()),
            lastRequestTimes: Object.fromEntries(this.lastRequestTimes)
        };
    }

    // Check if cache entry is fresh (less than 1 day old)
    isCacheFresh(cacheKey) {
        const cachedItem = this.cache.get(cacheKey);
        if (!cachedItem) return false;
        
        const now = Date.now();
        const oneDayInMs = 24 * 60 * 60 * 1000;
        return (now - cachedItem.timestamp) < oneDayInMs;
    }

    // Get time until cache expires
    getTimeUntilExpiry(cacheKey) {
        const cachedItem = this.cache.get(cacheKey);
        if (!cachedItem) return 0;
        
        const now = Date.now();
        const expiryTime = cachedItem.timestamp + this.CACHE_DURATION;
        return Math.max(0, expiryTime - now);
    }
}

// Create singleton instance
const aiCache = new AICache();

// AI API service with caching and rate limiting
export class AIService {
    static async fetchWithCache(endpoint, params = {}, options = {}) {
        const cacheKey = aiCache.generateCacheKey(endpoint, params);
        
        // Check if we have fresh cached data
        const cachedData = aiCache.getCachedData(cacheKey);
        if (cachedData && !options.forceRefresh) {
            console.log(`[AI Cache] Using cached data for ${endpoint}`);
            return {
                data: cachedData,
                fromCache: true,
                cacheAge: Date.now() - aiCache.cache.get(cacheKey).timestamp
            };
        }

        // Check rate limiting
        if (!aiCache.canMakeRequest(cacheKey) && !options.forceRefresh) {
            const lastRequestTime = aiCache.lastRequestTimes.get(cacheKey);
            const timeUntilNext = aiCache.MIN_REQUEST_INTERVAL - (Date.now() - lastRequestTime);
            throw new Error(`Rate limited. Please wait ${Math.ceil(timeUntilNext / 1000)} seconds before making another request.`);
        }

        try {
            // Make API request
            const url = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${endpoint}`;
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: params && Object.keys(params).length > 0 ? JSON.stringify(params) : undefined,
                ...options
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Cache the response
            aiCache.setCachedData(cacheKey, data);
            console.log(`[AI Cache] Cached new data for ${endpoint}`);
            
            return {
                data,
                fromCache: false,
                cached: true
            };
        } catch (error) {
            console.error(`[AI Service] Error fetching ${endpoint}:`, error);
            throw error;
        }
    }

    // Insights API with caching
    static async getInsights(forceRefresh = false) {
        return this.fetchWithCache('/ai-coaching/workout-analysis', {}, { 
            forceRefresh,
            method: 'GET' 
        });
    }

    // AI Coaching chat with rate limiting
    static async sendChatMessage(request, forceRefresh = false) {
        // Ensure request matches backend AICoachingRequest schema
        const requestBody = {
            message: request.message || request,
            conversation_history: request.conversation_history || [],
            user_data: request.user_data || null
        };
        
        return this.fetchWithCache('/ai-coaching', requestBody, { 
            forceRefresh,
            method: 'POST' 
        });
    }

    // Exercise suggestions with caching
    static async getExerciseSuggestions(muscleGroup, currentExercise, forceRefresh = false) {
        return this.fetchWithCache('/ai-coaching/exercise-suggestions', {
            muscle_group: muscleGroup,
            current_exercise: currentExercise
        }, { 
            forceRefresh,
            method: 'POST' 
        });
    }

    // Get cache status
    static getCacheStatus() {
        return aiCache.getCacheInfo();
    }

    // Clear specific cache
    static clearCache(endpoint, params = {}) {
        const cacheKey = aiCache.generateCacheKey(endpoint, params);
        aiCache.forceRefreshCache(cacheKey);
    }

    // Clear all cache
    static clearAllCache() {
        aiCache.cache.clear();
        aiCache.lastRequestTimes.clear();
    }

    // Clean expired cache entries
    static cleanExpiredCache() {
        aiCache.clearExpiredCache();
    }
}

// Automatically clean expired cache every hour
setInterval(() => {
    AIService.cleanExpiredCache();
    console.log('[AI Cache] Cleaned expired cache entries');
}, 60 * 60 * 1000); // 1 hour

export default AIService;