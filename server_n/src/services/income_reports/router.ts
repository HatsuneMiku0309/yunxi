import * as Router from 'koa-router';
import { IncomeReportService } from './income_reports';
import { IPgDb } from '../../db.interface';
import { IMyRouterOptions } from '../utils.interface';
import { Utils } from '../utils';
import { Next, ParameterizedContext } from 'koa';

export class IncomeReportRouter {
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
        const incomeReport = new IncomeReportService(pgDb);
        this._utils.registController('incomeReport', incomeReport);
        this._router.get('/income_reports', this._checkAdmin, async (ctx) => {
            const query = <any> ctx.request.query;
            const user = ctx.state.user;
            try {
                const datas = await incomeReport.getAll(query, { user });

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
