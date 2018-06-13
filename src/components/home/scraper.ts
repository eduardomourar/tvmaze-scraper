import 'isomorphic-fetch';
import logger from '../../util/logger';

const throttledQueue = require('throttled-queue');

declare const fetch: any;

const throttle = throttledQueue(10, 1000, true); // at most make 10 requests every second, but evenly spaced.

function fetching(url: string) {
    return fetch(url)
        .then((response) => {
            if (response.status === 429) {
                logger.log(`Limit reached ${url} - ${response.status}`);
                setTimeout(() => fetching(url), 10000);
            } else {
                logger.log(`${url} - ${response.status}`);
                return response.json();
            }
        });
}

function getCast({id, name, _embedded}) {
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
    return { id, name, cast };
}

export function getShow(id: string) {
    throttle(() => {
        return fetching(`http://api.tvmaze.com/shows/${id}?embed=cast`)
            .then(getCast)
            .catch(error => {
                logger.log(error);
                logger.log(`Error while getting show ${id}`);
                return Promise.resolve({ id });
            });
    });
}

export function getShows() {
    return fetching('http://api.tvmaze.com/updates/shows')
        .then(data => {
            const ids = Object.keys(data);
            if (ids.length) {
                return Promise.all(ids.map((id) => {
                    return getShow(id);
                }));
            }
            return Promise.reject('No shows found.');
        })
        .catch(error => {
            logger.log(error);
        });
}