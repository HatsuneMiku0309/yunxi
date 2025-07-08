import * as Router from 'koa-router';
import { LoginService } from './login';
import { ILoginBody } from './login.interface';
import { IPgDb } from '../../db.interface';
import { IConfig } from '../../config.interface';
import { Authentication } from '../authentication/authentication';

export class LoginRouter {
    private readonly _router: Router;
    constructor(pgDb: IPgDb, config: IConfig) {
        this._router = new Router();
        this.registerAPIs(pgDb, config);
    }

    get router() {
        return this._router;
    }

    registerAPIs(pgDb: IPgDb, config: IConfig) {
        const login = new LoginService(pgDb, config);
        this._router.post('/login', async (ctx) => {
            const body = <ILoginBody> ctx.request.body;
            try {
                const { data, token } = await login.login(body);
                ctx.cookies.set(Authentication.C_NAME, `${Authentication.JWT_TOKEN_TYPE} ${token}`, {
                    httpOnly: true,
                    maxAge: Authentication.MAX_AGE
                });

                ctx.body = {
                    data
                };
            } catch (err) {
                throw err;
            }
        });

        this._router.post('/logout', async (ctx) => {
            try {
                login.logout(ctx);

                ctx.body = {
                    data: 'success logout'
                };
            } catch (err) {
                throw err;
            }
        });

        return this._router;
    }
}
