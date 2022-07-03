import React from "react";
import { CfgRuntime } from "../libs/config";
import { get_login_url } from "../libs/wps";

function Login() {
  return (
    <div>
      <a
        href={get_login_url({
          appid: CfgRuntime.appid,
          redirect: CfgRuntime.redirect,
        })}
      >
        Login
      </a>
    </div>
  );
}

export default Login;
