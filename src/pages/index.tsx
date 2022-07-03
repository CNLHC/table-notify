import { Button, Dropdown, Menu, message, Modal, notification } from "antd";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { useAuthCheck, useClient, useSession } from "../libs/hooks";
import "moment/locale/zh-cn";
import _ from "lodash";
import WPSFileSelector from "../components/wps_selector";
import Uploader from "../components/uploader";
import TablePreviewer from "../components/table_previewer";
import { useRouter } from "next/router";

moment.locale("zh-cn");

function Index() {
  useAuthCheck();
  const { session, set_session, get_session } = useSession();
  const [open, setOpen] = useState(false);
  const [upload_open, setUploadOpen] = useState(false);
  const { data, mutate, error } = useSWR(`get-session-${session}`, () =>
    get_session(session)
  );
  const router = useRouter();
  useEffect(() => {
    mutate();
  }, [session, mutate]);
  const { cli } = useClient();
  const onTriggerNotify = (session: string) => {
    cli
      .post("/api/table/notify", { session })
      .then((e) =>
        message.info(`成功 ${e.data.success} 失败 ${e.data.failed}`)
      );
  };

  const UploadMenu = (
    <Menu
      onClick={(e) => {
        switch (e.key) {
          case "WPS":
            setOpen(true);
            return;
          case "Upload":
            setUploadOpen(true);
            return;
        }
      }}
      items={[
        {
          label: "从WPS中获取",
          key: "WPS",
        },
        {
          label: "本地上传",
          key: "Upload",
        },
      ]}
    />
  );
  const onCloseWPSSelector = useCallback(() => setOpen(false), [setOpen]);

  const Step0 = (
    <>
      <WPSFileSelector open={open} onClose={onCloseWPSSelector} />
      <Modal
        visible={upload_open}
        onCancel={() => setUploadOpen(false)}
        closable
        footer={null}
      >
        <Uploader
          onSuccess={(e) => {
            notification["success"]({
              message: "上传成功",
              duration: 1,
            });
            set_session(e.session);
            setUploadOpen(false);
          }}
        />
      </Modal>
      <div className="flex flex-col gap-1 items-center">
        <Dropdown overlay={UploadMenu}>
          <Button size="large" type="primary" block>
            选择文件
          </Button>
        </Dropdown>
        <Button type="link" onClick={() => router.push("/history")}>
          查看历史提醒记录
        </Button>
      </div>
    </>
  );
  const Step1 = (
    <>
      <div className="flex flex-col gap-1 items-center">
        <Button
          onClick={() => onTriggerNotify(session as string)}
          size="large"
          danger
          type={"primary"}
          block
        >
          发送提醒短信
        </Button>
        <Button
          type="link"
          size="small"
          className=" w-fit"
          onClick={() => set_session(undefined)}
        >
          重新选择文件
        </Button>
      </div>
      <TablePreviewer data={data} />
    </>
  );

  return (
    <div
      className={[
        "h-[100vh]",
        "p-4 flex flex-col gap-4 mt-4",
        "lg:w-1/2 lg:ml-auto lg:mr-auto lg:p-0",
        "overflow-auto",
      ].join(" ")}
    >
      {!!session ? Step1 : Step0}
    </div>
  );
}

export default Index;
