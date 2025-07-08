import * as Router from 'koa-router';
import { RoomService } from './room';
import { IPgDb } from '../../db.interface';
import { IMyRouterOptions } from '../utils.interface';
import { Utils } from '../utils';
import { RoomExtendsService } from './room_extends';
import { Next, ParameterizedContext } from 'koa';

export class RoomRouter {
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
        const room = new RoomService(pgDb, this._utils);
        this._utils.registController('room', room);
        const roomExtends = new RoomExtendsService(pgDb);
        this._utils.registController('roomExtends', roomExtends);
        this._router.get('/rooms', async (ctx) => {
            try {
                const datas = await room.getAll();

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.put('/room/:id/action/idle', this._checkAdmin, async (ctx) => {
            const id = ctx.params.id;
            try {
                const datas = await room.actionIdle(id);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.put('/room/:id/action/using', this._checkAdmin, async (ctx) => {
            const id = ctx.params.id;
            const body = ctx.request.body;
            try {
                const datas = await room.actionUsing(id, body);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.put('/room/:id/action/reserve', this._checkAdmin, async (ctx) => {
            const id = ctx.params.id;
            try {
                const datas = await room.actionReserve(id);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.put('/room/:id/action/clean', this._checkAdmin, async (ctx) => {
            const id = ctx.params.id;
            try {
                const datas = await room.actionClean(id);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.put('/room/:id/action/close', this._checkAdmin, async (ctx) => {
            const id = ctx.params.id;
            try {
                const datas = await room.actionClose(id);

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
