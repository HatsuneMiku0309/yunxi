import { Context } from "koa";

export interface ILoginBody {
    account: string;
    password: string;
}

export interface ILoginService {
    login(body: ILoginBody): Promise<{ data: Omit<ILoginBody, 'password'>, token: string }>;
    logout(ctx: Context): Promise<void>;
}
