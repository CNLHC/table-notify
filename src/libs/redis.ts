
import { config } from "dotenv";
import { createClient } from "redis";

const connect = {
    url: process.env["REDIS_URL"],
    password: process.env["REDIS_PW"],
    database: parseInt(process.env["REDIS_DB"] ?? "8"),

}
const client = createClient({
    ...connect,
});

export async function GetRedisCli() {
    if (!client.isOpen) {
        await client.connect()
    }
    return client
}
