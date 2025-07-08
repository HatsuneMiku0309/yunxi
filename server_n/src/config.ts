import path = require('path');
import { IServerConfig, IDbConfig, IConfig, IJWTConfig } from './config.interface';
import * as fs from 'fs';
import { SignOptions } from 'jsonwebtoken';

type a = SignOptions['expiresIn'];
const {
    APP_PORT = '3000',
    DB_IP = 'localhost',
    DB_PORT = '5432',
    DB_USER = 'cosmo_dai',
    DB_PASS = 'youcanloginin01!',
    DB_NAME = 'postgres',
    EXPIRES_IN = '1D',
    ASSETS_PATH
} = process.env;

export class Config implements IConfig {
    private readonly _ServerConfig: IServerConfig = {
        APP_PORT: Number(APP_PORT)
    };
    private readonly _DbConfig: IDbConfig = {
        DB_IP,
        DB_PORT: Number(DB_PORT),
        DB_USER,
        DB_PASS,
        DB_NAME
    };
    private readonly _JWTConfig: IJWTConfig;
    constructor() {
        let { privateKey, publicKey } = this._getKeyFile();
        this._JWTConfig = {
            algorithm: 'RS512',
            privateKey,
            publicKey,
            expiresIn: <a> EXPIRES_IN
        }
    }

    private _getKeyFile() {
        try {
            const { ASSETS_PATH } = this._checkJWTEnv();
            const privateKey = fs.readFileSync(path.join(ASSETS_PATH, 'private_key.pem')).toString();
            const publicKey = fs.readFileSync(path.join(ASSETS_PATH, `public_key.pem`)).toString();

            return {
                privateKey,
                publicKey
            }
        } catch (err) {
            throw err;
        }
    }

    private _checkJWTEnv() {
        if (ASSETS_PATH === undefined) {
            throw new Error('[ASSETS_PATH] not setting');
        }

        return {
            ASSETS_PATH
        }
    }

    getJWTConfig() {
        return this._JWTConfig;
    }

    getServerConfig() {
        return this._ServerConfig;
    }

    getDbConfig() {
        return this._DbConfig;
    }
}
