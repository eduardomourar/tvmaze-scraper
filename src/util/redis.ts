import * as cache from 'express-redis-cache';
import logger from './logger';

const redis = cache({
    host: process.env.REDISCACHEHOSTNAME || '127.0.0.1',
    port: process.env.REDISCACHEPORT || '6379',
    auth_pass: process.env.REDISCACHEKEY,
    prefix: 'noderedis',
    expire: 60 * 60 * 24
});
redis.on('connected', () => {
    logger.info('Redis connected');
});
redis.on('disconnected', () => {
    logger.info('Redis disconnected');
});
redis.on('message', (message) => {
    logger.info(message);
});
redis.on('error', (error) => {
    logger.info('Redis error', error);
});

redis.addEntry = (prefix, entry) => {
    return new Promise((resolve, reject) => {
        const { id = 0, name = '' } = entry || {};
        if (!id) {
            logger.info(`Unable to add entry ${name}, ID not present.`);
            return resolve({});
        }
        redis.add(`${prefix}${id}`, JSON.stringify(entry), { type: 'json' }, (error, added) => {
            if (error) {
                return reject(error);
            }
            resolve(added);
        });
    });
};

redis.getEntries = (query) => {
    return new Promise((resolve, reject) => {
        redis.get(query, (error, entries) => {
            if (error) {
                return reject(error);
            }
            const data = entries.map(entry => {
                return JSON.parse(entry.body || {});
            }).sort((a, b) => a.id - b.id);
            resolve(data);
        });
    });
};

export function redisExpressCache() {
    return redis;
}