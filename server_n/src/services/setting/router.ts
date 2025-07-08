import * as Router from 'koa-router';
import { SettingService } from './setting';
import { IPgDb } from '../../db.interface';
import { IMyRouterOptions } from '../utils.interface';
import { Utils } from '../utils';
import { Next, ParameterizedContext } from 'koa';

export class SettingRouter {
    private readonly _router: Router;
    private readonly _utils: Utils;
    constructor(pgDb: IPgDb, options: IMyRouterOptions) {
        this._router = new Router();
        this._utils = options.utils;
        this.registerAPIs(pgDb);
    }

    get router() {
        return this._router;
    }

    private async _checkAdmin(ctx: ParameterizedContext<any, Router.IRouterParamContext<any, {}>, any>, next: Next) {
        const user = ctx.state.user;
        if (!user.is_admin) {
            throw new Error('非Admin');
        }
        await next();
    }

    registerAPIs(pgDb: IPgDb) {
        const setting = new SettingService(pgDb);
        this._utils.registController('setting', setting);
        this._router.get('/settings', this._checkAdmin, async (ctx) => {
            try {
                const datas = await setting.getAll();

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.put('/setting', this._checkAdmin, async (ctx) => {
            const body = ctx.request.body;
            try {
                const datas = await setting.update(body);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        return this._router;
    }
}
