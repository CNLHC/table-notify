import nextConnect, { NextHandler } from "next-connect";
import { NextApiRequest, NextApiResponse } from "next/types";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { BaseTokenInfo, getDatasource, UserModel } from "./models";
import { CfgRuntime, CfgServer } from "./config";
import { ErrNoBlob, ErrWPSRefreshError } from "./errors";
import moment from "moment";
import { refresh_token } from "./wps";

export default function GetConnect() {
    return nextConnect<NextApiRequest, NextApiResponse>({
        onError: (err, req, res, next) => {
            if (err instanceof Error) {
                if (err.message == "没有找到用户身份") {
                    res.status(401).json({ msg: err.message })
                    return
                }
                if (err.message == ErrNoBlob.message) {
                    res.status(404).json({ msg: err.message })
                    return
                }
            }
            console.error(err)
            res.status(500).end(err.message)
        }
    })
}

export async function refresh_wpss_token(user: UserModel, info?: BaseTokenInfo) {
    const tx = await getDatasource()
    const wps_token = user.token_store.wps_token
    if (!wps_token) throw ErrNoAuth
    if (moment(wps_token.expire_at).diff(moment(), 'hour') >= 5) return

    if (!info) {
        try {
            const resp = await refresh_token({
                appid: CfgRuntime.appid,
                appkey: CfgServer.appkey,
                refresh_token: wps_token.refresh_token ?? ''
            })
            info = {
                access_token: resp.token.access_token,
                refresh_token: resp.token.refresh_token,
                expire_at: moment().add(resp.token.expires_in, 's').toISOString()
            }
        } catch (e: any) {
            throw ErrWPSRefreshError
        }
    }
    await tx.createQueryBuilder(UserModel, 'um')
        .update()
        .where("uuid = :uuid", { uuid: user.uuid })
        .set({ token_store: () => `jsonb_set(token_store, '{wps_token}', '${JSON.stringify(info)}')` })
        .execute()
}

export const ErrNoAuth = Error("没有找到用户身份")
export function AuthMiddleware() {
    return async (req: NextApiRequest, resp: NextApiResponse, next: NextHandler) => {
        const key = req.headers.authorization
        const db = await getDatasource()
        if (!key) throw ErrNoAuth
        try {
            const res = await jwt_verify(key)
            const user = await db.createQueryBuilder(UserModel, 'um').where(`uuid=:uuid`, { uuid: res.uuid }).getOneOrFail()
            req.user = user
            await refresh_wpss_token(user);
            next()
        } catch (e) {
            console.error(e)
            throw ErrNoAuth
        }
    }
}

type TokenClaim = {
    uuid: string
} & JwtPayload
async function jwt_verify(token: string): Promise<TokenClaim> {
    return new Promise<TokenClaim>((res, rej) => {
        jwt.verify(token, CfgServer.jwtkey as string, function (err, decoded) {
            if (err) rej(err)
            res(decoded as TokenClaim)
        });
    })
}

export function jwt_sign(uuid: string) {
    return jwt.sign({ uuid } as TokenClaim, CfgServer.jwtkey, { expiresIn: '48h' })
}
