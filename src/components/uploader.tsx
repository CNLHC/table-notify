import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import Upload, { UploadProps } from "antd/lib/upload";
import Dragger from "antd/lib/upload/Dragger";
import React, { useMemo } from "react";
import { useClient } from "../libs/hooks";

const Uploader = (props: { onSuccess: (e: any) => void }) => {
  const { cli } = useClient();
  const up: UploadProps = useMemo(
    () => ({
      name: "table",
      multiple: false,
      accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      action: "/api/table",
      customRequest(e) {
        const f = e.file as File;
        let formData = new FormData();
        formData.append("table", e.file);
        formData.append("filename", f.name);
        cli
          ?.post("/api/table", formData, {
            headers: {
              "Content-Type": "multipart/form-data; charset=utf-8",
            },
          })
          ?.then((k) => {
            e.onSuccess && e.onSuccess(k?.data);
            props.onSuccess(k?.data);
          });
      },

      onChange(info) {},
    }),
    [cli, props]
  );
  return (
    <Dragger
      {...up}
      className="w-full"
      showUploadList={false}
      beforeUpload={(file) => {
        const isLt20M = file.size / 1024 / 1024 < 20;
        if (!isLt20M) {
          message.error("文件必须小于20MiB");
        }
        return isLt20M;
      }}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">
        <strong>点击</strong>或将文件拖放于此区域上传
      </p>
    </Dragger>
  );
};

export default Uploader;
