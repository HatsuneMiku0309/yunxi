import * as jwt from 'jsonwebtoken';
import { IConfig } from '../../config.interface';
import { IPgDb } from '../../db.interface';
import { Context, Next } from 'koa';
import { IJWTPayload, ISignupData, TTokenType } from './authentication.interface';

/**
 * MAX_AGE 應該要等於 expiresIn.
 */
export class Authentication {
  static readonly JWT_TOKEN_TYPE = 'Bearer';
  static readonly BASIC_TOKEN_TYPE = 'Basic';
  static readonly C_NAME = 'Authorization';
  static readonly MAX_AGE = 7 * 24 * 60 * 60 * 1000;
  constructor() {

  }
  
  static signup(data: ISignupData, config: IConfig) {
    try {
      const { privateKey, algorithm, expiresIn } = config.getJWTConfig();
      const token = jwt.sign(data, privateKey, {
        algorithm,
        expiresIn
      });

      return token;
    } catch (err) {
      throw err;
    }
  }

  private static _verify<T extends IJWTPayload>(token: string, config: IConfig): T {
    try {
      const { publicKey } = config.getJWTConfig();
      let data = <T> jwt.verify(token, publicKey);

      return data;
    } catch (err) {
      throw new Error('Authentication Error');
    }
  }

  static passport(pgDb: IPgDb, config: IConfig) {
    return async (ctx: Context, next: Next) => {
      try {
        let token = Authentication.resolveHeaderToken('Bearer', ctx);
        const payload = Authentication._verify(token, config);
        const conn = await pgDb.getPool().connect();
        try {
          const { rows } = await conn.query('SELECT account FROM users WHERE id = $1', [payload.id]);
          if (rows.length !== 1) {
            throw new Error('Authentication Error', {
              cause: { status: 403 }
            });
          }
        } finally {
          conn.release();
        }
        
        ctx.state.jwt = token;
        ctx.state.user = payload;

        try {
          await next();
        } catch (err: any) {
          ctx.status = 500;
          ctx.body = {
            errMsg: err.message
          };
        }
      } catch (err: any) {
        ctx.cookies.set(Authentication.C_NAME, null, {
            maxAge: -1
        });
        let status = err.cause?.status || 401;
        ctx.throw(status, err.message);
      }
    }
  }

  static resolveHeaderToken(type: TTokenType, ctx: Context): string {
    if (![Authentication.BASIC_TOKEN_TYPE, Authentication.JWT_TOKEN_TYPE].includes(type)) {
      throw new Error('Authentication Type Error');
    }

    try {
      const parts = ctx.cookies.get(Authentication.C_NAME)?.split(' ');
      if (parts === undefined || parts.length !== 2) {
        throw new Error('Not Authentication');
      }

      const scheme = parts[0];
      const credentials = parts[1];
      const re = new RegExp('^' + type + '$', 'i');
      if (re.test(scheme)) {
          return credentials;
      } else {
        throw new Error(`Bad Authentication header format. Format is "Authentication: ${type} <token>"`);
      }
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}
