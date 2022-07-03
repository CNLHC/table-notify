import { Spin } from "antd";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useAuth } from "../libs/hooks";

function Oauth() {
  const route = useRouter();
  const { setToken, setRPCToken } = useAuth();
  const code = route.query.code;
  useEffect(() => {
    if (code)
      axios
        .get("/api/wps/access_token", { params: { code } })
        .then((e) => {
          setRPCToken(e.data.rpc_token);
          return setToken(e.data.token);
        })
        .then(() => route.push("/"));
  }, [code, route, setRPCToken, setToken]);

  return (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center">
      <Spin size="large"></Spin>
    </div>
  );
}

export default Oauth;
