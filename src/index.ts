import * as express from 'express';
import { initRoutes } from './components/bootstrap';
import logger from './util/logger';

const app: express.Application = express();
const port: string = process.env.PORT || '3000';

initRoutes(app);

app.listen(port, () => {
    logger.info(`-  Port    :  ${port}`);
    logger.info('---------------------------------------------------');
});