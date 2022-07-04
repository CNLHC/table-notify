import { Button, Tag } from "antd";
import Table, { ColumnProps } from "antd/lib/table";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import useSWR from "swr";
import { useClient } from "../libs/hooks";
import { NotificationLog } from "../libs/models";

const History = () => {
  const { cli } = useClient();
  const { data } = useSWR("query-notification-history", async () =>
    cli.get("/api/notify/history").then((e) => e.data)
  );
  const columns = useMemo(
    () =>
      [
        {
          title: "事件类型",
          dataIndex: "type",
          render(value, record, index) {
            switch (value) {
              case "sms_send":
                return <Tag color={"success"}> 短信提醒成功</Tag>;
              case "sms_error":
                return <Tag color={"error"}> 短信提醒失败</Tag>;
            }
          },
        },
        {
          title: "通知目标",
          dataIndex: ["user", "name"],
        },
        {
          title: "时间",
          dataIndex: "created_at",
          render(value, record, index) {
            return moment(value).format("YYYY-MM-DD HH:mm:ss");
          },
        },
      ] as ColumnProps<NotificationLog>[],
    []
  );
  const router = useRouter();
  return (
    <div
      className={[
        "h-[100vh]",
        "p-4 flex flex-col gap-4 mt-4",
        "lg:w-1/2 lg:ml-auto lg:mr-auto lg:p-0",
        "overflow-auto",
      ].join(" ")}
    >
      <Button type="link" onClick={() => router.push("/")}>
        返回首页
      </Button>
      <Table
        columns={columns}
        dataSource={data?.data}
        pagination={{ defaultPageSize: 40 }}
      ></Table>
    </div>
  );
};

export default History;
