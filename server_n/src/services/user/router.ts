import * as Router from 'koa-router';
import { UserService } from './user';
import { IPgDb } from '../../db.interface';
import { TRepassBody } from './user.interface';
import { IContextState, IMyRouterOptions } from '../utils.interface';
import { Utils } from '../utils';
import { Authentication } from '../authentication/authentication';

export class UserRouter {
    private readonly _router: Router<IContextState>;
    private readonly _utils: Utils;
    constructor(pgDb: IPgDb, options: IMyRouterOptions) {
        this._router = new Router();
        this._utils = options.utils;
        this.registerAPIs(pgDb);
    }

    get router() {
        return this._router;
    }

    registerAPIs(pgDb: IPgDb) {
        const user = new UserService(pgDb);
        this._utils.registController('user', user);
        
        this._router.put('/user', async (ctx) => {
            const id = ctx.state.user.id;
            const body = <TRepassBody> ctx.request.body;
            try {
                await user.repass(id, body);
                ctx.cookies.set(Authentication.C_NAME, null, {
                    maxAge: -1
                });

                ctx.body = {
                    data: 'Repass Success'
                };
            } catch (err) {
                throw err;
            }
        });

        return this._router;
    }
}
