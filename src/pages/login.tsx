import { Button } from "antd";
import React from "react";
import { CfgRuntime } from "../libs/config";
import { get_login_url } from "../libs/wps";

function Login() {
  return (
    <div className="w-[100vw]">
      <div className="ml-auto w-fit mr-auto relative top-16">
        <Button
          type="primary"
          className="w-[20rem]"
          size="large"
          href={get_login_url({
            appid: CfgRuntime.appid,
            redirect: CfgRuntime.redirect,
          })}
        >
          登录
        </Button>
      </div>
    </div>
  );
}

export default Login;
