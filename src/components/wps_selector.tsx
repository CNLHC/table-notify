import { Modal, Spin } from "antd";
import { AxiosError } from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { CfgRuntime } from "../libs/config";
import { ErrWPSError } from "../libs/errors";
import { useClient, useRPCToken, useSession } from "../libs/hooks";
import { handle_wps_error } from "../libs/wps";

type FileSelectorAction = "share" | "download" | "upload" | "cancel";
type FileSelectorAccept =
  | "word"
  | "excel"
  | "ppt"
  | "pdf"
  | "image"
  | "flow"
  | "mind"
  | "doc";

function get_params(req: {
  rpc_token: string;
  action: FileSelectorAction;
  default_file_type?: FileSelectorAccept;
}) {
  const param = new URLSearchParams();
  param.append("appid", CfgRuntime.appid);
  param.append("rpc_token", req.rpc_token);
  param.append("action", req.action);
  param.append("is_multiple", "true");
  req.default_file_type &&
    param.append("default_file_type", req.default_file_type);
  return param;
}
const WPSFileSelector = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { get_rpc_token } = useRPCToken();
  const [token, setToken] = useState<string | undefined>(undefined);
  const { cli } = useClient();
  useEffect(() => {
    get_rpc_token().then((e) => setToken(e.rpc_token));
  }, [get_rpc_token]);

  const { set_session } = useSession();
  const [loading, setLoding] = useState(true);
  const [frame_ref, setFrameRef] = useState<HTMLIFrameElement>();
  const frame_ref_cb = useCallback((node: HTMLIFrameElement) => {
    setFrameRef(node);
  }, []);

  useEffect(() => {
    if (!token) return;
    if (!cli) return;
    if (!frame_ref) return;
    const param = get_params({
      rpc_token: token,
      action: "download",
      default_file_type: "excel",
    });
    frame_ref.src = `https://open.wps.cn/components/fileselector?${param.toString()}`;
    function handler(e: MessageEvent) {
      try {
        const obj: {
          method: FileSelectorAction;
          file_code: string;
        } = JSON.parse(e.data);
        switch (obj.method) {
          case "download":
            cli
              .get<{ session: string }>("/api/wps/download", {
                params: { file_code: obj.file_code },
              })
              .then((e) => set_session(e.data.session))
              .then(onClose)
              .catch((e) => {
                if (e instanceof AxiosError) {
                  const data = e.response?.data;
                  switch (data.msg) {
                    case ErrWPSError.message:
                      handle_wps_error(data.response);
                  }
                }
              });
            return;
          case "cancel":
            onClose();
        }
      } catch (e) {}
    }
    function load_handler(e: Event) {
      setLoding(false);
    }
    frame_ref.addEventListener("load", load_handler);
    window.addEventListener("message", handler, false);
    return () => {
      window.removeEventListener("message", handler, false);
    };
  }, [token, frame_ref, cli, onClose, set_session]);

  return (
    <Modal
      visible={open}
      footer={null}
      //   forceRender
      title={null}
      onCancel={onClose}
      closeIcon={null}
      closable={false}
      width={"100vw"}
      wrapClassName="h-[100vh] lg:h-[620px] top-0 w-[100vw] lg:w-1/2 m-0 lg:ml-auto lg:mr-auto overflow-hidden"
      className="top-0 m-0 lg:top-[20px] overflow-hidden w-full max-w-[120vw] lg:max-w-[50vw]"
      style={{
        transformOrigin: "0",
        maxWidth: "init",
      }}
      bodyStyle={{
        padding: "0",
        top: "0",
        overflow: "scroll",
      }}
    >
      <Spin spinning={loading} tip="从WPS中获取数据，请稍后">
        <iframe
          ref={frame_ref_cb}
          id={"wps_file_selector"}
          className="h-[100vh] lg:h-[620px] "
          style={{
            width: "100%",
          }}
        ></iframe>
      </Spin>
    </Modal>
  );
};

export default WPSFileSelector;
