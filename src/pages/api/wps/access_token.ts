import { CfgRuntime, CfgServer } from "../../../libs/config";
import GetConnect, { jwt_sign } from "../../../libs/nextconnect";
import { BaseTokenInfo, getDatasource, UserModel } from "../../../libs/models";
import { get_access_token, get_rpc_token, get_user_info } from "../../../libs/wps";
import moment from "moment";

const handler = GetConnect().get(async (req, res) => {

    const token_resp = await get_access_token({
        appid: CfgRuntime.appid,
        appkey: CfgServer.appkey,
        code: req.query.code as string
    })
    const uinfo = await get_user_info({
        appid: CfgRuntime.appid,
        access_token: token_resp.token.access_token
    })

    const db = await getDatasource()

    const existed_user = await db.createQueryBuilder(UserModel, 'um')
        .where(`external_id @@  '$.wps.oid=="${token_resp.token.openid}"'`).getOne()
    let uuid: string = ""

    const store: BaseTokenInfo = {
        access_token: token_resp.token.access_token,
        refresh_token: token_resp.token.refresh_token,
        expire_at: moment().add(token_resp.token.expires_in, 's').toISOString()
    }
    if (existed_user) {
        await db.createQueryBuilder(UserModel, 'um')
            .update()
            .where("uuid = :uuid", { uuid: existed_user.uuid })
            .set({ token_store: () => `jsonb_set(token_store, '{wps_token}', '${JSON.stringify(store)}')` })
            .execute()
        uuid = existed_user.uuid
    } else {
        const newUser = new UserModel()
        newUser.name = uinfo.user.nickname
        newUser.external_id = { wps: { oid: token_resp.token.openid } }
        newUser.token_store = { wps_token: store }
        await db.createQueryBuilder(UserModel, 'um').insert().values(newUser).execute()
        uuid = newUser.uuid
    }
    const rpc_token = await get_rpc_token({
        appid: CfgRuntime.appid,
        token: token_resp.token.access_token,
    })

    res.json({
        token: jwt_sign(uuid),
        rpc_token: rpc_token.rpc_token
    })

    return
})

export default handler