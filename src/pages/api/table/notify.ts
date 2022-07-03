
import GetConnect, { AuthMiddleware } from "../../../libs/nextconnect";
import * as XLSX from "xlsx";
import { check_should_send, extract_data_from_xlsx, get_blob_or_fail, TDataRow } from "../../../libs/thu";
import { send_msg_thu } from "../../../libs/sms";
import { EndpointUserModel, getDatasource, NotificationLog, UserModel } from "../../../libs/models";
import { PromisePool } from '@supercharge/promise-pool'


export async function send_msg_and_log(r: TDataRow, caller: UserModel): Promise<boolean> {
    const db = await getDatasource()
    const people = await db.createQueryBuilder(EndpointUserModel, "endpoint_user")
        .where("nature_key = :nature_key", { nature_key: r.id })
        .getOne()
    const save_log = async (log: NotificationLog) =>
        await db.createQueryBuilder(NotificationLog, "notification_log")
            .insert()
            .into(NotificationLog)
            .values(log)
            .execute()

    const log = new NotificationLog()
    log.tenant = caller
    log.created_at = new Date()

    try {
        if (!people || people.phone_number.length !== 11) {
            log.type = "sms_error"
            log.context = {
                input: r,
                reason: "NoValidPhoneNumber"
            }
            await save_log(log)
            return false
        }
        const res2 = await send_msg_thu({ name: people.name, phone: people.phone_number })
        if (res2.body.code?.toLowerCase() != "ok") {
            log.type = "sms_error"
            log.context = {
                input: r,
                reason: "SMSServiceError",
                context: res2.body
            }
            await save_log(log)
            return false
        }

        log.type = "sms_send"
        log.user = people
        await db.createQueryBuilder(NotificationLog, "notification_log").insert().into(NotificationLog).values(log).execute()
        return true
    } catch (e: any) {
        log.type = "sms_send"
        log.context = {
            input: r,
            reason: "Unknown",
            error: e.toString()
        }
        await save_log(log)
        return false
    }

}
const handler = GetConnect()
    .use(AuthMiddleware()).post(async (req, resp) => {
        const session = req.body.session
        const blob = await get_blob_or_fail(session)
        const book = XLSX.read(blob, { type: 'buffer' })
        const data = extract_data_from_xlsx(book)
        const should_send = data.filter(check_should_send)
        const { results, errors } = await PromisePool
            .for(should_send)
            .withConcurrency(50)
            .process(async row => {
                return await send_msg_and_log(row, req.user)
            })
        resp.json({
            status: 'ok',
            success: results.filter(e => e).length,
            failed: results.filter(e => !e).length,
        })
        return
    })

export default handler