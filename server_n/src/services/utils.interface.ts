import { ParameterizedContext } from "koa";
import { IJWTPayload } from "./authentication/authentication.interface";
import { IRouterParamContext } from "koa-router";
import { Utils } from "./utils";

export interface IContextState {
  jwt: string;
  user: IJWTPayload
}

export interface ICotnext<T extends IContextState = IContextState> extends ParameterizedContext<T, IRouterParamContext<any, {}>, any> {

}

export interface IMyRouterOptions {
  utils: Utils;
}
