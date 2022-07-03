import getConfig from "next/config";
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
export const CfgRuntime= publicRuntimeConfig;
export const CfgServer = serverRuntimeConfig;
