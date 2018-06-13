import 'isomorphic-fetch';
import * as http from 'http';
import logger from '../../util/logger';

const throttledQueue = require('throttled-queue');

declare const fetch: any;

const throttle = throttledQueue(5, 1000, true);

function fetching(url: string, fallback: boolean = false) {
    const fetchOptions = {
        agent: new http.Agent({ keepAlive: true }),
        timeout: 15000,
    };
    return fetch(url, fetchOptions)
        .then((response) => {
            logger.log(`${url} - ${response.status}`);
            if (response.status === 429) {
                logger.log('Limit reached to TVmaze.');
                if (fallback) {
                    return undefined;
                }
                setTimeout(() => fetching(url, true), 10000);
            } else if (response.status >= 400) {
                return undefined;
            } else {
                return response.json();
            }
        });
}

function getCast(show) {
    return new Promise((resolve, reject) => {
        try {
            if (!show) return reject('Show data unavailable.');
            const { id, name, _embedded } = show;
            let cast = [];
            if (_embedded && _embedded.cast) {
                cast = _embedded.cast.map(cast => {
                    const { person: { id, name, birthday } } = cast;
                    return { id, name, birthday };
                }).sort((a, b) => {
                    const previous = Date.parse(a.birthday || '1000-01-01');
                    const next = Date.parse(b.birthday || '1000-01-01');
                    return next - previous;
                });
            }
            resolve( { id, name, cast } );
        } catch (error) {
            reject(error);
        }
    });
}

export function getShow(id: string, addToDatabase) {
    throttle(() => {
        return fetching(`http://api.tvmaze.com/shows/${id}?embed=cast`)
            .then(getCast)
            .then((data) => {
                return addToDatabase('show', data);
            })
            .catch(error => {
                logger.log(error);
                logger.log(`Error while getting show ${id}`);
                return Promise.resolve({ id });
            });
    });
}

export function getShows(addToDatabase) {
    return fetching('http://api.tvmaze.com/updates/shows')
        .then(data => {
            const ids = Object.keys(data);
            if (ids.length) {
                return Promise.all(ids.map((id) => {
                    return getShow(id, addToDatabase);
                }));
            }
            return Promise.reject('No shows found.');
        })
        .catch(error => {
            logger.log(error);
        });
}