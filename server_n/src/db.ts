import { Client, Pool, PoolClient } from 'pg';
import { IConfig } from './config.interface';
import { IPgDb, OptionalProperties } from './db.interface';

export class PgDb implements IPgDb {
    private _pool?: Pool;
    private _client?: Client;
    private readonly _config: IConfig;
    constructor(config: IConfig) {
        this._config = config;
    }

    async setTransaction(conn: PoolClient) {
        await conn.query('BEGIN');
    }

    async setCommit(conn: PoolClient) {
        await conn.query('COMMIT');
    }

    async setRollback(conn: PoolClient) {
        await conn.query('ROLLBACK');
    }

    getPool() {
        if (this._pool) {
            return this._pool;
        }

        let { DB_IP, DB_PORT, DB_USER, DB_PASS, DB_NAME } = this._config.getDbConfig();
        this._pool = new Pool({
            database: DB_NAME,
            user: DB_USER,
            password: DB_PASS,
            port: DB_PORT,
            host: DB_IP,
            max: 10
        });

        return this._pool;
    }

    private _setDefault<T>(body: T, defaultValue: any) {
        for (let key in defaultValue) {
            if (defaultValue[key] !== undefined) {
                body[<keyof T> key] = defaultValue[key];
            }
        }

        return body;
    }

    grantInsertSql<T extends object, U extends OptionalProperties<T>>(body: T, defaultValue?: U) {
        let values: any[] = [];
        let fieldSql: string[] = [];
        let valuesSql: string[] = [];
        let i = 0;
        body = this._setDefault(body, defaultValue);
        for(let key in body) {
            if (body[key] !== undefined) {
                fieldSql.push(key);
                values.push(body[key]);
                valuesSql.push(`$${++i}`);
            }
        }

        return {
            fields: fieldSql,
            values: values,
            fieldSql: `(${fieldSql.join(', ')})`,
            valuesSql: `(${valuesSql.join(', ')})`
        }
    }

    grantInsertBatchSql<T extends Array<object>, U extends OptionalProperties<T[0]>>(body: T, defaultValue?: U) {
        let tValues: any[][] = [];
        let fieldSql: string[] = [];
        let tValuesSql: string[] = [];
        let i = 0;
        body.forEach((b, index) => {
            b = this._setDefault(b, defaultValue)
            let values: any[] =[];
            let valuesSql: string[] = [];
            for (let key in b) {
                let value = b[<keyof typeof b> key];
                if (value !== undefined) {
                    if (index === 0) {
                        fieldSql.push(key);
                    }
                    values.push(value);
                    valuesSql.push(`$${++i}`);
                }
            }
            tValues.push(...values);
            tValuesSql.push(`(${valuesSql.join(', ')})`)
        });

        return {
            fields: fieldSql,
            values: tValues,
            fieldSql: `(${fieldSql.join(', ')})`,
            valuesSql: `${tValuesSql.join(', ')}`
        }
    }

    grantUpdateSql<T extends object>(body: T, ignores?: (keyof T)[]) {
        let sets: any[] = [];
        let setSql: string[] = [];
        let i = 0;
        let _ignores = ignores || [];
        for (let key in body) {
            if (body[key] !== undefined && !_ignores.includes(key)) {
                sets.push(body[key]);
                setSql.push(`"${key}" = $${++i}`);
            }
        }

        return {
            sets,
            setSql: setSql.join(', '),
            nextIndex: i
        };
    }

    getClient() {
        if (this._client) {
            this._client;
        }

        let { DB_IP, DB_PORT, DB_USER, DB_PASS, DB_NAME } = this._config.getDbConfig();
        this._client = new Client({
            database: DB_NAME,
            user: DB_USER,
            password: DB_PASS,
            port: DB_PORT,
            host: DB_IP
        });

        return this._client;
    }
}
