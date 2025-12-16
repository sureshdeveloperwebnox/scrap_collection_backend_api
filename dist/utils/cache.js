"use strict";
/**
 * Cache Service
 * Provides in-memory caching with TTL support for improved API performance
 * Can be easily extended to use Redis for distributed caching
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
class CacheService {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
    }
    /**
     * Get cached data by key
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        // Check if entry has expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    /**
     * Set cached data with optional TTL
     */
    set(key, data, ttl) {
        const expiresAt = Date.now() + (ttl || this.defaultTTL);
        this.cache.set(key, { data, expiresAt });
    }
    /**
     * Delete cached data by key
     */
    delete(key) {
        return this.cache.delete(key);
    }
    /**
     * Delete all cache entries matching a pattern
     */
    deletePattern(pattern) {
        let deletedCount = 0;
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                deletedCount++;
            }
        }
        return deletedCount;
    }
    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Generate cache key from object
     */
    generateKey(prefix, params) {
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}:${JSON.stringify(params[key])}`)
            .join('|');
        return `${prefix}:${sortedParams}`;
    }
    /**
     * Clean expired entries (should be called periodically)
     */
    cleanExpired() {
        let cleanedCount = 0;
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                cleanedCount++;
            }
        }
        return cleanedCount;
    }
    /**
     * Get cache statistics
     */
    getStats() {
        const now = Date.now();
        let expiredCount = 0;
        let activeCount = 0;
        for (const entry of this.cache.values()) {
            if (now > entry.expiresAt) {
                expiredCount++;
            }
            else {
                activeCount++;
            }
        }
        return {
            total: this.cache.size,
            active: activeCount,
            expired: expiredCount,
        };
    }
}
// Singleton instance
exports.cacheService = new CacheService();
// Clean expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        exports.cacheService.cleanExpired();
    }, 5 * 60 * 1000);
}
