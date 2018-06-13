import * as express from 'express';
import HomeController from './home/home-controller';
import { redisExpressCache } from '../util/redis';

const controllers = [
    HomeController
];

/**
 * Bootstrap all the routes by initializing all the controllers.
 *
 * @param app Express application
 */
export function initRoutes(app: express.Application) {
    for (const controller of controllers) {
        new controller(app, redisExpressCache());
    }
}
