import * as express from 'express';
import { Controller } from '../controller';
import * as scraper from './scraper';
import logger from '../../util/logger';

const info = require('../../../package.json');

export default class HomeController implements Controller {
    private app: express.Application;
    private redis;

    constructor(app: express.Application, redis) {
        logger.info('---------------------------------------------------');
        logger.info(`-  Eduardo Rodrigues (c) 2018 - ${info.description}`);
        logger.info(`-  Release :  v${info.version}`);
        this.app = app;
        this.redis = redis;
        if (process.env.NODE_ENV === 'production') {
            this.scrapeShows()
                .then(() => {
                    this.initRoutes();
                });
        } else {
            this.initRoutes();
        }
    }

    /**
     * Scrape the data of shows from TVmaze.
     */
    private scrapeShows() {
        return scraper.getShows(this.redis.addEntry)
            .then((data) => {
                logger.log('Shows sucessfully retrieved.');
                return data;
            });
    }

    /**
     * Get data of shows from local storage.
     */
    private getShows(page, size) {
        return this.redis.getEntries('show*')
            .then((data) => {
                if (!data.length) return [];
                page = parseInt(page || 1);
                size = parseInt(size || 250);
                if (isNaN(size) || size < 1) {
                    size = 1;
                }
                const pageCount = Math.floor(data.length / size) + 1;
                if (isNaN(page) || page < 1) {
                    page = 1;
                } else if (page > pageCount) {
                    page = pageCount;
                }
                --page;
                return data.slice(page * size, (page + 1) * size);
            });
    }

    /**
     * Initialize the routes which should be handled by this controller.
     */
    initRoutes() {
        this.app.get('/', (req, res) => {
            logger.info('GET home');
            res.json({ message: `TVmaze scraper application v${info.version} is running.`});
        });

        this.app.get('/clear', (req, res) => {
            logger.info('GET clear');
            this.redis.del('show*', (error) => {
                if (error) throw error;
                res.json({ message: 'Cache cleared.'});
            });
        });

        this.app.get('/shows', (req, res) => {
            logger.info('GET shows');
            const { page, size } = req.query;
            this.getShows(page, size)
                .then((data) => {
                    res.json(data);
                })
                .catch(error => {
                    if (error) throw error;
                });
        });

        this.app.get('/scrape', (req, res) => {
            logger.info('GET scrape');
            this.scrapeShows()
                .then(() => {
                    logger.log('Scraping from TVmaze completed.');
                })
                .catch(error => {
                    if (error) throw error;
                });
            res.json({ message: 'Started scraping.'});
        });
    }
}