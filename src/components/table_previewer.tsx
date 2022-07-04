import { Radio, Table } from "antd";
import { ColumnProps } from "antd/lib/table";
import _ from "lodash";
import moment from "moment";
import React, { useMemo, useState } from "react";
import { SessionInfo } from "../libs/hooks";
import { TDataRow } from "../libs/thu";

const row_to_key = (r: TDataRow) => `${r.id}+${r.raw_date}` as string;

const TablePreviewer = ({ data }: { data?: SessionInfo }) => {
  const should_notify = useMemo(() => {
    return new Set(data?.should_notify.map(row_to_key));
  }, [data]);

  const all_date = useMemo(() => {
    return Object.keys(
      _.groupBy(data?.all, (e) => moment(e.new_date).toISOString())
    );
  }, [data]);

  const [filter, setFilter] = useState<{ [key: string | number]: any[] }>({});

  const columns = useMemo(
    () =>
      [
        {
          width: "15%",
          title: "是否提醒",
          dataIndex: "should_notify",
          render: (text, record) => {
            if (should_notify.has(row_to_key(record))) {
              return <span>是</span>;
            }
          },
          filters: [
            { text: "是", value: "是" },
            { text: "否", value: "否" },
          ],
          filterMultiple: false,
          filteredValue: filter["should_notify"],
          onFilter: (value, record) =>
            value == "是"
              ? should_notify.has(row_to_key(record))
              : !should_notify.has(row_to_key(record)),
          filterResetToDefaultFilteredValue: true,
        },
        { title: "姓名", dataIndex: "name" },
        { title: "院系", dataIndex: "school" },
        {
          title: "检测日期",
          dataIndex: "new_date",

          filteredValue: filter["new_date"],
          onFilter: (value: moment.Moment, record) => {
            return value.isSame(moment(record.new_date), "day");
          },
          filters: all_date.map((e) => ({
            text: moment(e).format("MM-DD"),
            value: moment(e),
          })),

          filterResetToDefaultFilteredValue: true,
          render: (text, record) => (
            <span>{moment(record.new_date).format("YYYY-MM-DD")}</span>
          ),
        },
        {
          title: "是否完成检测",
          width: "20%",
          dataIndex: "is_checked",
          filters: [
            {
              text: "是",
              value: "是",
            },
            {
              text: "其他",
              value: "",
            },
          ],
          filterResetToDefaultFilteredValue: true,
          filteredValue: filter["is_checked"],
          onFilter: (value: string, record) => record.is_checked === value,
        },

        {
          title: "离校备注",
          dataIndex: "is_out_school",
          width: "8rem",
          // ellipsis: true,
        },
      ] as ColumnProps<TDataRow>[],
    [all_date, filter, should_notify]
  );
  return (
    <>
      <Radio.Group
        onChange={(k) => {
          const value = k.target.value;
          if (value === "")
            setFilter((e) => ({
              ...e,
              should_notify: [],
            }));
          else
            setFilter((e) => ({
              ...e,
              should_notify: [k.target.value as string],
            }));
        }}
      >
        <Radio value="是">
          <strong className="text-red-500">需要</strong>提醒的同学
        </Radio>
        <Radio value="否">
          <span className="text-blue-500">无需</span>提醒的同学
        </Radio>

        <Radio value="">所有数据</Radio>
      </Radio.Group>

      <Table
        columns={columns}
        size="small"
        dataSource={data?.all}
        onChange={(a, filters) => {
          setFilter(filters as any);
        }}
        pagination={{
          showTitle: true,
          showTotal: (total, range) => <span>总计: {total}</span>,
        }}
        rowKey={(e) => `${e.id}_${e.new_date}`}
      ></Table>
    </>
  );
};

export default TablePreviewer;
