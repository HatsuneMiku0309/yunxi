import * as Router from 'koa-router';
import { WorkerRecordService } from './work_record';
import { IPgDb } from '../../db.interface';
import { IMyRouterOptions } from '../utils.interface';
import { Utils } from '../utils';
import { Next, ParameterizedContext } from 'koa';

export class WorkRecordRouter {
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
        const workerRecord = new WorkerRecordService(pgDb, this._utils);
        this._utils.registController('work_record', workerRecord);
        this._router.get('/work_records', async (ctx) => {
            const query = ctx.request.query;
            const user = ctx.state.user;

            try {
                const datas = await workerRecord.getAll(query, { user });

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });
        
        this._router.post('/work_record/action/clock_in', async (ctx) => {
            const body = <any> ctx.request.body;
            try {
                const datas = await workerRecord.clockIn(body);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });
        this._router.post('/work_record/:id/action/clock_out', async (ctx) => {
            const id = ctx.params.id;
            const user = ctx.state.user;
            try {
                const datas = await workerRecord.clockOut(id, { user });

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        
        this._router.post('/work_record/:id/action/pay', this._checkAdmin, async (ctx) => {
            const id = ctx.params.id;
            const body = <any> ctx.request.body;
            const user = ctx.state.user;
            try {
                if (!user.is_admin) {
                    throw new Error('该操作只允许Admin操作!');
                }
                const datas = await workerRecord.actionPay(id, body);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.post('/work_record/:id/action/cancel', this._checkAdmin, async (ctx) => {
            const id = ctx.params.id;
            try {
                const datas = await workerRecord.actionCancel(id);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.post('/work_record', this._checkAdmin, async (ctx) => {
            const body = <any> ctx.request.body;
            try {
                const datas = await workerRecord.create(body);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
                throw err;
            }
        });

        this._router.put('/work_record/:id', this._checkAdmin, async (ctx) => {
            const id = ctx.params.id;
            const body = <any> ctx.request.body;
            try {
                const datas = await workerRecord.update(id, body);

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
