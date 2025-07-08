import { IPgDb } from "../../db.interface";
import { IUserService, TRepassBody } from "./user.interface";
import { Utils } from '../utils';

export class UserService implements IUserService {
    private readonly _pgDb: IPgDb;
    constructor(pgDb: IPgDb) {
        this._pgDb = pgDb;
    }
    
    async repass(id: string, body: TRepassBody) {
        const { password } = body;
        const conn = await this._pgDb.getPool().connect();
        try {
            const hashPassword = Utils.hashPassword(password);
            await conn.query('update users set password = $1 where id = $2', [hashPassword, id]);
        } finally {
            conn.release();
        }
    }
}