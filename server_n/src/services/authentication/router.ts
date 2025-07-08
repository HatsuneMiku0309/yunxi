import * as Router from 'koa-router';
import { Authentication } from './authentication';
import { IPgDb } from '../../db.interface';
import { IConfig } from '../../config.interface';
import { IContextState } from '../utils.interface';

export class AuthenticationRouter {
    private readonly _router: Router<IContextState>;
    constructor(pgDb: IPgDb, config: IConfig) {
        this._router = new Router();
        this.registerAPIs(pgDb, config);
    }

    get router() {
        return this._router;
    }

    registerAPIs(pgDb: IPgDb, config: IConfig) {
      this._router.get('/authen', Authentication.passport(pgDb, config), async (ctx, next) => {
        ctx.body = {
          data: ctx.state.user
        };
      });

      return this._router;
    }
}
