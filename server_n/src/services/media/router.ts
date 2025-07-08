import * as Router from 'koa-router';
import { MediaService } from './media';
import { IPgDb } from '../../db.interface';
import { IContextState, IMyRouterOptions } from '../utils.interface';
import { koaBody } from 'koa-body';
import { Utils } from '../utils';

export class MediaRouter {
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
        const media = new MediaService(pgDb);
        this._utils.registController('media', media);
        this._router.post('/media/upload', koaBody({
          multipart: true,
          formidable: {
              keepExtensions: false,
              maxFieldsSize: 10 * 1024 * 1024,
              uploadDir: media.uploadDir
          }
        }), async (ctx) => {
            try {
                const datas = await media.upload(ctx);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
                throw err;
            }
        });

        this._router.del('/media/:id', async(ctx) => {
            const id = ctx.params.id;
            try {
                const result = await media.removeFileById(id);

                ctx.body = {
                    data: result
                };
            } catch (err) {
                throw err;
            }
        });

        this._router.del('/medias', async(ctx) => {
            const body = <{ ids: string[] }> ctx.request.body;
            try {
                const result = await media.removeFilesByIds(body);

                ctx.body = {
                    data: result
                };
            } catch (err) {
                throw err;
            }
        });

        return this._router;
    }
}
