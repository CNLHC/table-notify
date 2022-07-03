
import { getDatasource, NotificationLog } from "../../../libs/models";
import GetConnect, { AuthMiddleware } from "../../../libs/nextconnect";


const handler = GetConnect()
    .use(AuthMiddleware())
    .get(async (req, resp) => {
        const db = await getDatasource()
        const data = await db.createQueryBuilder(NotificationLog, 'log')
            .leftJoinAndSelect("log.user", 'u', "")
            .leftJoinAndSelect("log.tenant", 't')
            .where("t.uuid = :uid", { uid: req.user.uuid })
            .getMany()
        resp.json({ data })

        return
    })

export default handler;