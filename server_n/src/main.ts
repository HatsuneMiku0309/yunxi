require('dotenv').config();

import * as Koa from 'koa';
import { HttpServer } from './server';
import { MiddleWare } from './middleware';
import { Config } from './config';
import { PgDb } from './db';
import { Service } from './services/main';

const app = new Koa();

async function main() {
    const config = new Config();
    const pgDb = new PgDb(config);
    const middleware = new MiddleWare(app);
    middleware.registerMiddleWare();
    const service = new Service(app, pgDb, config);
    service.registerService();
    const server = new HttpServer(app, config);
    server.runServer();
}

main();