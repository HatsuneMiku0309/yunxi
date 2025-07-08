import { Algorithm, SignOptions } from 'jsonwebtoken';
type a = SignOptions['expiresIn'];

export interface IServerConfig {
    APP_PORT: number;
}

export interface IDbConfig {
    DB_IP: string;
    DB_PORT: number;
    DB_USER: string;
    DB_PASS: string;
    DB_NAME: string;
}

export interface IJWTConfig {
    algorithm: Algorithm;
    privateKey: string;
    publicKey: string;
    expiresIn: a;
}

export interface IConfig {
    getJWTConfig(): IJWTConfig;
    getServerConfig(): IServerConfig;
    getDbConfig(): IDbConfig;
}