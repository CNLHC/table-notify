import GetConnect, { AuthMiddleware } from "../../../libs/nextconnect";
import * as XLSX from "xlsx";
import multer from "multer"
import { check_should_send, extract_data_from_xlsx, get_blob_or_fail, register_blob } from "../../../libs/thu";


type MulterFile = {
    fieldname: string
    originalname: string
    encoding: string
    mimetype: string
    buffer: Buffer
    size: number
}

const upload = multer({ storage: multer.memoryStorage(), });
const handler = GetConnect()
    .use(AuthMiddleware())
    .use(upload.single('table'))
    .post(async (req, resp) => {
        const file = (req as any).file as MulterFile
        const session = await register_blob(file.buffer)
        resp.json({ session })
        return
    })
    .get(async (req, resp) => {
        const session = req.query.session as string
        const blob = await get_blob_or_fail(session)
        const book = XLSX.read(blob, { type: 'buffer' })
        const data = extract_data_from_xlsx(book)
        const should_send = data.filter(check_should_send)
        resp.json({
            all: data,
            should_notify: should_send
        })
        return
    })

export default handler;

export const config = {
    api: {
        bodyParser: false
    }
}