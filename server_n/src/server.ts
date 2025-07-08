import * as http from 'http';
import * as Koa from 'koa';
import { IConfig } from './config.interface';

export class HttpServer {
    public server: http.Server;
    private readonly _config: IConfig;
    constructor(app: Koa, config: IConfig) {
        this.server = http.createServer(app.callback());
        this._config = config;
    }

    runServer() {
        const { APP_PORT } = this._config.getServerConfig();
        this.server.listen(APP_PORT, () => {
            console.log(`run serve at port: ${APP_PORT}.`);
        });
    }
}
