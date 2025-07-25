import * as Router from 'koa-router';
import { MemberService } from './members';
import { IPgDb } from '../../db.interface';
import { IMyRouterOptions } from '../utils.interface';
import { Utils } from '../utils';
import { Next, ParameterizedContext } from 'koa';

export class MemberRouter {
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
        const member = new MemberService(pgDb);
        this._utils.registController('member', member);
        this._router.get('/members', this._checkAdmin, async (ctx) => {
            const query = <any> ctx.request.query;
            const user = ctx.state.user;
            try {
                const datas = await member.getAll(query, { user });

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.post('/member', this._checkAdmin, async (ctx) => {
            const body = ctx.request.body;
            try {
                const datas = await member.create(body);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

         this._router.put('/member/:id', this._checkAdmin, async (ctx) => {
            const id = ctx.params.id;
            const body = ctx.request.body;
            try {
                const datas = await member.modify(id, body);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.put('/member/:id/pay_money', this._checkAdmin, async (ctx) => {
            const id = ctx.params.id;
            const body = ctx.request.body;
            try {
                const datas = await member.payMoney(id, body);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.put('/member/:id/pay_all', this._checkAdmin, async (ctx) => {
            const id = ctx.params.id;
            try {
                const datas = await member.payAll(id);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.put('/member/:id/recharge_card', this._checkAdmin, async (ctx) => {
            const id = ctx.params.id;
            const body = ctx.request.body;
            try {
                const datas = await member.rechargeCard(id, body);

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
