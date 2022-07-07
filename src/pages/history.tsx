import { Button, Tag } from "antd";
import Table, { ColumnProps } from "antd/lib/table";
import _ from "lodash";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import useSWR from "swr";
import { useClient } from "../libs/hooks";
import { NotificationLog } from "../libs/models";

const History = () => {
  const { cli } = useClient();
  const { data } = useSWR("query-notification-history", async () =>
    cli
      .get<{ data: NotificationLog[] }>("/api/notify/history")
      .then((e) => e.data)
  );
  const all_date = useMemo(
    () =>
      _.uniq(data?.data.map((e) => moment(e.created_at).startOf("day"))) ?? [],
    [data]
  );
  const columns = useMemo(
    () =>
      [
        {
          title: "id",
          dataIndex: "id",
          sorter: (a, b) => a.id - b.id,
        },
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
          sorter: function (a, b) {
            return moment(a.created_at).unix() - moment(b.created_at).unix();
          },
          filteredValue: all_date.map((e) => ({
            text: moment(e).format("MM-DD"),
            value: moment(e),
          })),

          render(value, record, index) {
            return moment(value).format("YYYY-MM-DD HH:mm:ss");
          },
        },
      ] as ColumnProps<NotificationLog>[],
    [all_date]
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
        rowKey={(e) => e.id}
        pagination={{ defaultPageSize: 40 }}
      ></Table>
    </div>
  );
};

export default History;
