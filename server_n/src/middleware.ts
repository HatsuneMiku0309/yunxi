import * as Koa from 'koa';
import * as json from 'koa-json';
import { HttpMethodEnum, koaBody } from 'koa-body';
import * as cors from '@koa/cors';

export class MiddleWare {
    private readonly _app: Koa;
    constructor(app: Koa) {
        this._app = app;
    }

    registerMiddleWare() {
        const middle = [
            json({ pretty: false }),
            koaBody({
                parsedMethods: [HttpMethodEnum.DELETE, HttpMethodEnum.POST, HttpMethodEnum.PUT, HttpMethodEnum.GET, HttpMethodEnum.HEAD, HttpMethodEnum.PATCH],
                onError: (err, ctx) => {
                    ctx.throw('body parse error', 422);
                },
                jsonLimit: '10mb',
                textLimit: '10mb',
                formLimit: '10mb',
                jsonStrict : true
            }),
            cors({
                // origin: 'http://localhost:5173',
                credentials: true,
                maxAge: 3600 * 1000,
                exposeHeaders: ['Authorization', 'Set-Cookie'],
                allowMethods: ['GET', 'POST', 'PUT', 'DELETE']
            })
        ];

        middle.forEach((middle) => {
            this._app.use(middle);
        });
    }
}
