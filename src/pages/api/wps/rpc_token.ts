import { CfgRuntime } from "../../../libs/config"
import GetConnect, { AuthMiddleware } from "../../../libs/nextconnect"
import { get_rpc_token } from "../../../libs/wps"


const handler = GetConnect().use(AuthMiddleware()).get(async (req, res) => {
    const ak = req.user.token_store.wps_token?.access_token

    const rpc_token = await get_rpc_token({
        appid: CfgRuntime.appid,
        token: ak ?? ""
    })
    res.json(rpc_token)
    return
})
export default handler
