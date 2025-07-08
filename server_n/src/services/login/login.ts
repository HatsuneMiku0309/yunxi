import { ILoginService, ILoginBody } from "./login.interface";
import { IPgDb } from "../../db.interface";
import { Context } from "koa";
import { Authentication } from "../authentication/authentication";
import { IConfig } from "../../config.interface";
import { Utils } from '../utils';

export class LoginService implements ILoginService {
    private readonly _pgDb: IPgDb;
    private readonly _config: IConfig;
    constructor(pgDB: IPgDb, config: IConfig) {
        this._pgDb = pgDB;
        this._config = config;
    }

    // IRouterParamContext<any, {}> & { request: Request & { body: ILoginBody } }
    async login(body: ILoginBody) {
        const { account, password } = body;
        const pool = this._pgDb.getPool();
        const client = await pool.connect();
        try {
            const hashPassword = Utils.hashPassword(password);
            const { rows } = await client.query<{ id: number, account: string, is_admin: boolean }>('SELECT id, account, is_admin FROM users WHERE account = $1 and password = $2', [account, hashPassword]);
            if (rows.length !== 1) {
                throw new Error('Account or Password wrong!');
            }
            const row = rows[0];
            let token = Authentication.signup({
                id: row.id.toString(),
                account: row.account,
                is_admin: row.is_admin
            }, this._config);

            return {
                data: row,
                token
            };
        } finally {
            client.release();
        }
    }

    async logout(ctx: Context) {
        ctx.cookies.set(Authentication.C_NAME, null, {
            maxAge: -1
        });
    }
}
