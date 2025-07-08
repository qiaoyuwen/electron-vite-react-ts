import {
  Alert,
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Table,
  Tooltip,
  Upload,
} from "antd";
import { FC, useRef, useState } from "react";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { RcFile, UploadFile } from "antd/es/upload";
import * as XLSX from "xlsx";
import { flatten } from "lodash";
import "./index.scss";

interface StatisticData {
  quarter?: string;
  month?: number;
  count: number;
}

const HomePage: FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<{
    cols: {
      name: string;
      files: UploadFile[];
    }[];
  }>();
  const ref = useRef<HTMLDivElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [columns, setColumns] = useState<
    {
      title: string;
      dataIndex: string;
      key: string;
    }[]
  >([]);
  const [previewData, setPreviewData] = useState<
    {
      [key: string]: string | number;
      month?: string;
    }[]
  >([]);

  const parseMonthFromString = (input: string): number | null => {
    // 正则解释：从字符串开头匹配1-12的数字（允许前导零），后跟"月"字
    const match = input.match(/^(0?[1-9]|1[0-2])月/);
    return match ? parseInt(match[1], 10) : null;
  };

  const resolveFile = async (file: RcFile) => {
    return new Promise<StatisticData>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const month = parseMonthFromString(file.name);
          let count = 0;
          for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const jsonData: Record<string, any>[] =
              XLSX.utils.sheet_to_json(sheet);
            count += jsonData.length;
          }
          if (month) {
            resolve({
              month,
              count,
            });
          } else {
            message.error(
              `Excel文件(${file.name})的名称格式不符合要求，请修改后从新上传`
            );
          }
        } catch {
          message.error(
            `Excel文件(${file.name})读取失败，请确认选择文件是否正确`
          );
          reject();
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const resolveData = async () => {
    await form.validateFields();
    const value = form.getFieldsValue();
    const result: {
      name: string;
      dataList: StatisticData[];
    }[] = [];
    for (const col of value.cols) {
      const dataList = await Promise.all(
        col.files.map((file) => {
          return resolveFile(file.originFileObj);
        })
      );
      Array.from({ length: 12 }, (_, i) => i + 1).forEach((month) => {
        const find = dataList.find((item) => item.month === month);
        if (!find) {
          dataList.push({
            month,
            count: 0,
          });
        }
      });
      const quarterList: StatisticData[][] = [[], [], [], []];
      dataList
        .sort((item1, item2) => item1.month - item2.month)
        .forEach((dataItem) => {
          if (dataItem.month <= 3) {
            quarterList[0].push(dataItem);
          }
          if (dataItem.month >= 4 && dataItem.month <= 6) {
            quarterList[1].push(dataItem);
          }
          if (dataItem.month >= 7 && dataItem.month <= 9) {
            quarterList[2].push(dataItem);
          }
          if (dataItem.month >= 10) {
            quarterList[3].push(dataItem);
          }
        });
      quarterList.forEach((quarter, index) => {
        let name = "";
        if (index === 0) {
          name = "第一季度";
        }
        if (index === 1) {
          name = "第二季度";
        }
        if (index === 2) {
          name = "第三季度";
        }
        if (index === 3) {
          name = "第四季度";
        }
        quarter.push({
          quarter: name,
          count: quarter.reduce((pre, cur) => {
            return pre + cur.count;
          }, 0),
        });
      });
      quarterList[3].push({
        quarter: "合计",
        count: flatten(quarterList)
          .filter((item) => !item.quarter?.includes("季度"))
          .reduce((pre, cur) => {
            return pre + cur.count;
          }, 0),
      });
      result.push({
        name: col.name,
        dataList: flatten(quarterList),
      });
    }
    setColumns([
      {
        title: "月份",
        dataIndex: "month",
        key: "month",
      },
      ...result.map((item) => {
        return {
          title: item.name,
          dataIndex: item.name,
          key: item.name,
        };
      }),
    ]);
    const data: {
      [key: string]: string | number;
      month?: string;
    }[] = [];
    if (result.length > 0) {
      result[0].dataList.forEach((_, index) => {
        const newItem: {
          [key: string]: string | number;
          month?: string;
        } = {};
        result.forEach((item) => {
          newItem.month = item.dataList[index].quarter
            ? item.dataList[index].quarter
            : `${item.dataList[index].month}月份`;
          newItem[item.name] = item.dataList[index].count;
        });
        data.push(newItem);
      });
    }
    setPreviewData(data);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center p-4 custom-border-b">
        <Alert
          message="提示：统计的excel文件需以 x月为开头, x为数字月份1-12"
          type="info"
        />
        <div className="flex items-center ml-auto">
          <Button
            className="mr-4"
            onClick={async () => {
              setColumns([]);
              setPreviewData([]);
              try {
                await resolveData();
                setDialogOpen(true);
              } catch (e) {
                console.log("e", e);
                if (e?.errorFields?.[0]?.name) {
                  const name = e.errorFields[0].name;
                  form.scrollToField(name);
                }
              }
            }}
          >
            预览
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              setColumns([]);
              setPreviewData([]);
              try {
                await form.validateFields();
                await resolveData();
                try {
                  // 1. 准备数据
                  const worksheetData = [];

                  // 添加表头行
                  const headerRow = columns.map((col) => col.title);
                  worksheetData.push(headerRow);

                  // 添加数据行
                  previewData.forEach((item) => {
                    const row = columns.map((col) => item[col.dataIndex] ?? "");
                    worksheetData.push(row);
                  });

                  // 2. 创建工作表
                  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

                  // 设置列宽
                  worksheet["!cols"] = columns.map(() => ({ wch: 15 }));

                  // 3. 创建工作簿并添加工作表
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(
                    workbook,
                    worksheet,
                    "内镜中心工作量统计表"
                  );

                  // 4. 生成Excel文件并下载
                  XLSX.writeFile(workbook, `统计结果.xlsx`);

                  message.success("导出成功");
                } catch (error) {
                  message.error(
                    `导出失败: ${
                      error instanceof Error ? error.message : "未知错误"
                    }`
                  );
                }
              } catch (e) {
                console.log("e", e);
                if (e.errorFields[0]?.name) {
                  const name = e.errorFields[0]?.name;
                  form.scrollToField(name);
                }
              }
            }}
          >
            导出
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col mt-4">
        <Form
          className="flex-1 min-h-0 flex flex-col"
          form={form}
          scrollToFirstError
          initialValues={{
            cols: [
              {
                name: "无痛胃镜",
                files: [],
              },
              /*{
                name: "胃镜",
                files: [],
              },
              {
                name: "无痛肠镜",
                files: [],
              },
              {
                name: "肠镜",
                files: [],
              },
              {
                name: "ERCP",
                files: [],
              },
              {
                name: "内痔套扎",
                files: [],
              },
              {
                name: "套扎",
                files: [],
              },
              {
                name: "硬化",
                files: [],
              },
              {
                name: "食管扩张",
                files: [],
              },
              {
                name: "胃息肉",
                files: [],
              },
              {
                name: "肠息肉",
                files: [],
              },
              {
                name: "超声",
                files: [],
              },
              {
                name: "胃结石",
                files: [],
              },
              {
                name: "置管/拔管",
                files: [],
              },
              {
                name: "异物",
                files: [],
              },
              {
                name: "ESD",
                files: [],
              },
              {
                name: "止血",
                files: [],
              },
              {
                name: "日间手术",
                files: [],
              },
              {
                name: "小肠镜",
                files: [],
              },
              {
                name: "肠镜未达盲肠",
                files: [],
              },
              {
                name: "POEM",
                files: [],
              },*/
            ],
          }}
        >
          <Form.List name="cols">
            {(fields, { add, remove }) => {
              return (
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="flex items-center px-4">
                    <Button
                      type="primary"
                      onClick={() => {
                        add({
                          name: "",
                          files: [],
                        });
                        if (ref.current) {
                          setTimeout(() => {
                            ref.current.scrollTop = 100000;
                          });
                        }
                      }}
                    >
                      + 新增
                    </Button>
                    <Button
                      className="ml-4"
                      onClick={() => {
                        form.resetFields();
                      }}
                    >
                      重置
                    </Button>
                  </div>
                  <div
                    ref={ref}
                    className="flex-1 min-h-0 flex flex-col overflow-y-auto mt-4 px-4"
                  >
                    {fields.map((field) => {
                      return (
                        <Card
                          className="mb-4"
                          key={field.key}
                          title={
                            <div className="flex items-center">
                              <div>{`统计列${field.name + 1}`}</div>
                              <Tooltip title="删除">
                                <DeleteOutlined
                                  className="ml-4 cursor-pointer"
                                  onClick={() => {
                                    remove(field.name);
                                  }}
                                />
                              </Tooltip>
                            </div>
                          }
                          size="small"
                        >
                          <Form.Item
                            className="max-w-[20rem]"
                            label="列名"
                            name={[field.name, "name"]}
                            required
                            rules={[
                              {
                                required: true,
                                message: "请输入列名",
                              },
                            ]}
                          >
                            <Input maxLength={50} showCount />
                          </Form.Item>
                          <Form.Item
                            label="Excel文件"
                            name={[field.name, "files"]}
                            required
                            rules={[
                              {
                                required: true,
                                message: "请添加需要统计的Excel文件",
                              },
                            ]}
                          >
                            <CustomUpload />
                          </Form.Item>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            }}
          </Form.List>
        </Form>
      </div>
      <Modal
        title="预览"
        width="100rem"
        open={dialogOpen}
        okButtonProps={{
          style: {
            display: "none",
          },
        }}
        cancelText="关闭"
        onCancel={() => {
          setDialogOpen(false);
        }}
      >
        <Table
          dataSource={previewData}
          columns={columns}
          pagination={false}
          scroll={{ y: 800 }}
          rowClassName={(record) => {
            if (record.month?.includes("季度")) {
              return "quarter-row";
            }
            if (record.month?.includes("合计")) {
              return "count-row";
            }
            return "";
          }}
        />
      </Modal>
    </div>
  );
};

const CustomUpload: FC<{
  id?: string;
  value?: UploadFile[];
  onChange?: (value: UploadFile[]) => void;
}> = ({ id, value, onChange }) => {
  return (
    <div className="max-w-[30rem]" id={id}>
      <Upload
        fileList={value}
        multiple
        beforeUpload={() => {
          return false;
        }}
        onChange={(v) => {
          onChange(v.fileList);
        }}
      >
        <Button icon={<UploadOutlined />}>选择Excel文件</Button>
      </Upload>
    </div>
  );
};

export default HomePage;
