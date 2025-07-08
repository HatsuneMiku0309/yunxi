import { JwtPayload } from "jsonwebtoken";
import { ILoginBody } from "../login/login.interface";

export type TTokenType = 'Basic' | 'Bearer';

export interface ISignupData extends Omit<ILoginBody, 'password'> {
  id: string, is_admin: boolean
}

export interface IJWTPayload extends ISignupData, JwtPayload {}