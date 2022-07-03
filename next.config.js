module.exports = {
  publicRuntimeConfig: {
    appid: "AK20220629OXCAPL",
    // redirect: "http://tablenotify-test.cnworkshop.xyz:23000/oauth",
    redirect: "http://localhost:3000/oauth",
  },
  serverRuntimeConfig: {
    appkey: process.env["WPS_APPKEY"],
    jwtkey: process.env["JWT_KEY"],
    ali_sms_template_code: "SMS_244430192",
    ali_akey: process.env["ALI_AKEY"],
    ali_aid: process.env["ALI_AID"],
  },
};
