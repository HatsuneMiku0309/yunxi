import * as Koa from 'koa';
import { IPgDb } from '../db.interface';
import { LoginRouter } from './login/router';
import * as Router from 'koa-router';
import { IConfig } from '../config.interface';
import { Authentication } from './authentication/authentication';
import { MediaRouter } from './media/router';
import { AuthenticationRouter } from './authentication/router';
import { UserRouter } from './user/router';
import { WorkerRouter } from './workers/router';
import { RoomRouter } from './rooms/router';
import { ServiceRouter } from './services/router';
import { WorkRecordRouter } from './work_records/router';
import { SettingRouter } from './setting/router';
import { SalaryRouter } from './salarys/router';
import { IncomeReportRouter } from './income_reports/router';
import { Utils } from './utils';

export class Service {
    private readonly _app: Koa;
    private readonly _pgDb: IPgDb;
    private readonly _mainRouter: Router;
    private readonly _nAuthRouter: Router;
    private readonly _config: IConfig
    private readonly _utils: Utils;
    constructor(app: Koa, pgDb: IPgDb, config: IConfig) {
        this._app = app;
        this._pgDb = pgDb;
        this._config = config;
        this._mainRouter = new Router();
        this._nAuthRouter = new Router();
        this._utils = new Utils();
    }

    registerService() {
        const routers: any[] = [
            new MediaRouter(this._pgDb, { utils: this._utils }),
            new UserRouter(this._pgDb, { utils: this._utils }),
            new WorkerRouter(this._pgDb, { utils: this._utils }),
            new RoomRouter(this._pgDb, { utils: this._utils }),
            new WorkRecordRouter(this._pgDb, { utils: this._utils }),
            new SettingRouter(this._pgDb, { utils: this._utils }),
            new SalaryRouter(this._pgDb, { utils: this._utils }),
            new IncomeReportRouter(this._pgDb, { utils: this._utils })
        ];
        const nAuthRouters: any[] = [
            new LoginRouter(this._pgDb, this._config),
            new AuthenticationRouter(this._pgDb, this._config),
            new ServiceRouter(this._pgDb, { utils: this._utils }),
        ];
        routers.forEach((router) => {
            this._mainRouter.use('/api', Authentication.passport(this._pgDb, this._config), router.router.routes(), router.router.allowedMethods());
        });
        nAuthRouters.forEach((router) => {
            this._nAuthRouter.use('/api', async (ctx, next) => {
                try {
                    await next();
                } catch (err: any) {
                    ctx.status = 500;
                    ctx.body = {
                        errMsg: err.message
                    };
                }
            }, router.router.routes(), router.router.allowedMethods());
        });

        this._app.use(this._mainRouter.routes()).use(this._mainRouter.allowedMethods());
        this._app.use(this._nAuthRouter.routes()).use(this._nAuthRouter.allowedMethods());
    }
}