
import GetConnect, { AuthMiddleware } from "../../../libs/nextconnect";

const handler = GetConnect().use(AuthMiddleware).get(async (req, resp) => {

})

