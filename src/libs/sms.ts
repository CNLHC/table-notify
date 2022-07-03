import Client, * as $dysmsapi from "@alicloud/dysmsapi20170525";
import * as $OpenApi from '@alicloud/openapi-client';
import { CfgServer } from './config';
import * as $Util from '@alicloud/tea-util';


let config = new $OpenApi.Config({
    accessKeyId: process.env["ALI_AID"],
    accessKeySecret: process.env["ALI_AKEY"],

});
config.endpoint = 'dysmsapi.aliyuncs.com'
const client = new Client(config);


export async function send_msg_thu(req: {
    name: string
    phone: string
}) {
    const code = CfgServer.ali_sms_template_code;
    let sendSmsRequest = new $dysmsapi.SendSmsRequest({
        phoneNumbers: req.phone,
        signName: "快异推",
        templateCode: code,
        templateParam: JSON.stringify({
            school: "精仪系",
            name: req.name
        }),
    });

    let runtime = new $Util.RuntimeOptions({});
    const res = await client.sendSmsWithOptions(sendSmsRequest, runtime);
    return res
}