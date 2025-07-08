import * as Router from 'koa-router';
import { WorkerService } from './worker';
import { IPgDb } from '../../db.interface';
import { IMyRouterOptions } from '../utils.interface';
import { Utils } from '../utils';

export class WorkerRouter {
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

    // private async _checkAdmin(ctx: ParameterizedContext<any, Router.IRouterParamContext<any, {}>, any>, next: Next) {
    //     const user = ctx.state.user;
    //     if (!user.is_admin) {
    //         throw new Error('非Admin');
    //     }
    //     await next();
    // }

    registerAPIs(pgDb: IPgDb) {
        const worker = new WorkerService(pgDb);
        this._utils.registController('worker', worker);
        this._router.get('/workers', async (ctx) => {
            const user = ctx.state.user;
            try {
                const datas = await worker.getAll({ user });

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.put('/worker/:id/action/idle', async (ctx) => {
            const id = ctx.params.id;
            try {
                const datas = await worker.actionIdle(id);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.put('/worker/:id/action/reserve', async (ctx) => {
            const id = ctx.params.id;
            try {
                const datas = await worker.actionReserve(id);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.put('/worker/:id/action/break', async (ctx) => {
            const id = ctx.params.id;
            try {
                const datas = await worker.actionBreak(id);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.put('/worker/:id/action/leave', async (ctx) => {
            const id = ctx.params.id;
            try {
                const datas = await worker.actionLeave(id);

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
