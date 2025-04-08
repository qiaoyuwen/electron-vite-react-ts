import { Sider, SiderContext } from "@/components/sider";
import {
  App,
  Button,
  Divider,
  Dropdown,
  Empty,
  Table,
  Tabs,
  theme,
  Upload,
} from "antd";
import { FC, useEffect, useRef, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";
import * as XLSX from "xlsx";
import { uid } from "@/utils/uid";
import { useConfirm } from "@/hooks/confirm";
import MoreIcon from "@/assets/more.png";
import { round, unionBy } from "lodash";
import { DateUtils } from "@/utils/date";

interface ExcelData {
  id: string;
  name: string;
  sheets: {
    id: string;
    name: string;
    columns: { key: string; label: string }[];
    data: Record<string, any>[];
  }[];
}

const EXCEL_EPOCH = new Date(1899, 11, 31);

const excelSerialToDate = (serial: number) => {
  const utcDays = Math.floor(serial - 1); // Excel 从 1 开始计数
  const msPerDay = 86400000; // 一天的毫秒数
  const date = new Date(EXCEL_EPOCH.getTime() + utcDays * msPerDay);

  // 修正 Excel 的闰年错误（1900 年不是闰年，但 Excel 认为它是）
  if (serial >= 60) date.setUTCDate(date.getUTCDate() - 1);

  return date;
};

const HomePage: FC = () => {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { confirm } = useConfirm();
  const [collapse, setCollapse] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [width, setWidth] = useState(300);
  const [excelDataList, setExcelDataList] = useState<ExcelData[]>([]);
  const [selectedExcelDataList, setSelectedExcelDataList] = useState<
    ExcelData[]
  >([]);
  const [selectedExcelData, setSelectedExcelData] = useState<ExcelData>();
  const [selectedSheetId, setSelectedSheetId] = useState<string>();
  const [hoverId, setHoverId] = useState<string>();
  const [moreMenuOpenedId, setMoreMenuOpenedId] = useState<string>();
  const uploadingRef = useRef(false);

  useEffect(() => {
    if (selectedExcelData) {
      setSelectedSheetId(selectedExcelData.sheets[0]?.id);
    }
  }, [selectedExcelData]);

  const resolveFile = async (file: RcFile) => {
    return new Promise<ExcelData>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const excelData: ExcelData = {
            id: uid(),
            name: file.name,
            sheets: [],
          };
          for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const jsonData: Record<string, any>[] =
              XLSX.utils.sheet_to_json(sheet);
            if (jsonData.length > 0) {
              const firstRow = jsonData.shift();
              excelData.sheets.push({
                id: uid(),
                name: Object.keys(firstRow)[0],
                columns: Object.keys(firstRow).map((key) => {
                  return {
                    key,
                    label: firstRow[key] as string,
                  };
                }),
                data: jsonData,
              });
            }
          }
          resolve(excelData);
        } catch {
          message.error(
            `Excel文件(${file.name})读取失败，请确认选择文件是否正确`
          );
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const resolveExcels = async (_: RcFile, files: RcFile[]) => {
    if (uploadingRef.current) {
      return;
    }
    uploadingRef.current = true;
    const result = await Promise.all(
      files.map((item) => {
        return resolveFile(item);
      })
    );

    const newExcelDataList = [...excelDataList, ...result];
    setExcelDataList(newExcelDataList);
    setSelectedExcelDataList([...selectedExcelDataList, ...result]);
    setSelectedExcelData(result[result.length - 1]);
    uploadingRef.current = false;
    return false;
  };

  return (
    <div className="h-full flex">
      <SiderContext.Provider value={{ collapse, setCollapse }}>
        <Sider
          isMoving={isMoving}
          onMovingChange={setIsMoving}
          width={width}
          onWidthChange={setWidth}
        >
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex justify-center p-4 items-center">
              <Upload fileList={[]} multiple beforeUpload={resolveExcels}>
                <Button icon={<UploadOutlined />}>选择Excel文件</Button>
              </Upload>
            </div>
            <Divider className="my-0" />
            <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
              {excelDataList.length === 0 && (
                <Empty
                  className="mt-8"
                  description="暂无文件，请添加Excel文件"
                />
              )}
              {excelDataList.length > 0 && (
                <>
                  {excelDataList.map((item) => {
                    return (
                      <div
                        key={item.id}
                        className="hover-bg-color flex items-center px-4 h-12 cursor-pointer"
                        style={{
                          backgroundColor:
                            selectedExcelData?.id === item.id
                              ? "#fff"
                              : undefined,
                          fontWeight:
                            selectedExcelData?.id === item.id ? 600 : 400,
                        }}
                        onClick={() => {
                          if (item.id === selectedExcelData?.id) {
                            return;
                          }
                          setSelectedExcelDataList(
                            unionBy(selectedExcelDataList, [item], "id")
                          );
                          setSelectedExcelData(item);
                        }}
                        onMouseEnter={() => setHoverId(item.id)}
                        onMouseLeave={() => {
                          if (moreMenuOpenedId !== item.id) {
                            setHoverId(undefined);
                          }
                        }}
                      >
                        <div
                          className="text-color truncate"
                          style={{
                            color:
                              selectedExcelData?.id === item.id
                                ? token.colorPrimary
                                : undefined,
                          }}
                        >
                          {item.name}
                        </div>
                        {(item.id === hoverId ||
                          item.id === moreMenuOpenedId) && (
                          <Dropdown
                            overlayClassName="custom-context-menu"
                            menu={{
                              items: [
                                {
                                  key: "remove",
                                  label: "删除",
                                  danger: true,
                                },
                              ],
                              onClick: ({ key }) => {
                                setMoreMenuOpenedId(undefined);
                                if (key === "remove") {
                                  confirm({
                                    title: "删除",
                                    message: "是否确认删除该Excel文件？",
                                    onOk: async () => {
                                      setExcelDataList(
                                        excelDataList.filter(
                                          (innerItem) =>
                                            innerItem.id !== item.id
                                        )
                                      );
                                      const newSelectedExcelDataList =
                                        selectedExcelDataList.filter(
                                          (innerItem) =>
                                            innerItem.id !== item.id
                                        );
                                      setSelectedExcelDataList(
                                        newSelectedExcelDataList
                                      );
                                      if (selectedExcelData.id === item.id) {
                                        setSelectedExcelData(
                                          newSelectedExcelDataList[
                                            newSelectedExcelDataList.length - 1
                                          ]
                                        );
                                      }
                                      message.success("操作成功");
                                    },
                                  });
                                }
                              },
                            }}
                            trigger={["click"]}
                            onOpenChange={(open) => {
                              setMoreMenuOpenedId(open ? item.id : undefined);
                              if (!open) {
                                setHoverId(undefined);
                              }
                            }}
                          >
                            <img
                              className="w-6 h-6 ml-auto"
                              src={MoreIcon}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Dropdown>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </Sider>
      </SiderContext.Provider>
      <div className="flex-1 min-w-0 flex flex-col">
        {selectedExcelDataList.length === 0 && (
          <div className="w-full h-full flex items-center justify-center">
            <Empty description="请选择需要查看的Excel文件" />
          </div>
        )}
        {selectedExcelDataList.length > 0 && (
          <Tabs
            className="h-full"
            activeKey={selectedExcelData.id}
            type="editable-card"
            hideAdd
            items={selectedExcelDataList.map((item) => {
              return {
                key: item.id,
                label: item.name,
                children: (
                  <div className="h-full px-4">
                    <Tabs
                      className="h-full"
                      activeKey={selectedSheetId}
                      onChange={(v) => setSelectedSheetId(v)}
                      items={item.sheets.map((sheet) => {
                        return {
                          key: sheet.id,
                          label: sheet.name,
                          children: (
                            <div className="h-full overflow-y-auto">
                              <Table
                                rowKey="id"
                                dataSource={sheet.data}
                                columns={[
                                  {
                                    title: "序号",
                                    dataIndex: "rank",
                                    width: 40,
                                    render: (_1, _2, index) => {
                                      return <div>{index + 1}</div>;
                                    },
                                  },
                                  ...sheet.columns.map((column) => {
                                    return {
                                      title: column.label,
                                      dataIndex: column.key,
                                      key: column.key,
                                      render: (
                                        _: any,
                                        item: Record<string, any>
                                      ) => {
                                        if (
                                          (column.label.startsWith("日") &&
                                            column.label.endsWith("期")) ||
                                          column.label.includes("日期")
                                        ) {
                                          let v = item[column.key];
                                          if (typeof v === "number") {
                                            v = DateUtils.formatDateMonth(
                                              excelSerialToDate(v)
                                            );
                                          } else if (v) {
                                            v = DateUtils.formatDateMonth(v);
                                          }
                                          return <div>{v}</div>;
                                        }
                                        let v = item[column.key];
                                        if (typeof v === "number") {
                                          v = round(v, 2);
                                        }
                                        return <div>{v}</div>;
                                      },
                                    };
                                  }),
                                ]}
                                pagination={false}
                              />
                            </div>
                          ),
                        };
                      })}
                    />
                  </div>
                ),
              };
            })}
            onChange={(v) => {
              const newSelected = excelDataList.find((item) => item.id === v);
              setSelectedExcelData(newSelected);
            }}
            onEdit={(v, action) => {
              if (action === "remove") {
                const newSelectedExcelDataList = selectedExcelDataList.filter(
                  (innerItem) => innerItem.id !== v
                );
                setSelectedExcelDataList(newSelectedExcelDataList);
                if (selectedExcelData.id === v) {
                  setSelectedExcelData(
                    newSelectedExcelDataList[
                      newSelectedExcelDataList.length - 1
                    ]
                  );
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
