
import { IncomingMessage } from "http";
import { UserModel } from "./models";
declare module 'next' {
    export interface NextApiRequest extends IncomingMessage {
        user: UserModel
    }
}