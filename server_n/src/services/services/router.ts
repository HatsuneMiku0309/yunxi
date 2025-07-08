import * as Router from 'koa-router';
import { ServiceService } from './service';
import { IPgDb } from '../../db.interface';
import { IMyRouterOptions } from '../utils.interface';
import { Utils } from '../utils';
import { ServicePayService } from './service_pay';
// import { Next, ParameterizedContext } from 'koa';

export class ServiceRouter {
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
        const service = new ServiceService(pgDb);
        const servicePay = new ServicePayService(pgDb);
        this._utils.registController('service', service);
        this._utils.registController('servicePay', servicePay);
        this._router.get('/service/:id/service_pays', async (ctx) => {
            try {
                const id = ctx.params.id;
                const datas = await servicePay.getByServiceId(id);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
                throw err;
            }
        })

        this._router.get('/services', async (ctx) => {
            try {
                const datas = await service.getAll();

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
