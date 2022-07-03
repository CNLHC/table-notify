import axios, { AxiosError } from "axios"
import { CfgRuntime } from "../../../libs/config"
import { ErrWPSError } from "../../../libs/errors"
import GetConnect, { AuthMiddleware } from "../../../libs/nextconnect"
import { register_blob } from "../../../libs/thu"
import { fileselector_download, get_rpc_token } from "../../../libs/wps"


const handler = GetConnect().use(AuthMiddleware()).get(async (req, res) => {
    const ak = req.user.token_store.wps_token?.access_token ?? ""
    const code = req.query.file_code as string | undefined
    if (!code) {
        res.status(400).send({ msg: "file_code is required" })
        return
    }
    try {
        const file_download = await fileselector_download({
            appid: CfgRuntime.appid,
            access_token: ak,
            file_code: code
        })
        const download_url = file_download.download_info_list[0]?.url

        const download_res = await axios.get(download_url, {
            responseType: "arraybuffer"
        })
        const session = await register_blob(download_res.data)


        res.json({ session })
        return
    } catch (e: any) {
        if (e instanceof AxiosError) {
            res.status(500).json({ msg: ErrWPSError.message, response: e.response?.data })
            return
        }

    }
    return
})
export default handler
