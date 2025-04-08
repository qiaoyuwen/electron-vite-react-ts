import { Sider, SiderContext } from "@/components/sider";
import { App, Button, Divider, Empty, Upload } from "antd";
import { FC, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";
import * as XLSX from "xlsx";

interface ExcelData {
  name: string;
  sheets: {
    name: string;
    columns: { key: string; label: string }[];
    data: Record<string, any>[];
  }[];
}

const HomePage: FC = () => {
  const { message } = App.useApp();
  const [collapse, setCollapse] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [width, setWidth] = useState(300);
  const [excelDataList, setExcelDataList] = useState<ExcelData[]>([]);
  const [selectedExcelData, setSelectedExcelData] = useState<ExcelData[]>([]);

  const resolveExcels = async (file: RcFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const excelData: ExcelData = {
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
        const newExcelDataList = [...excelDataList, excelData];
        setExcelDataList(newExcelDataList);
      } catch {
        message.error(
          `Excel文件(${file.name})读取失败，请确认选择文件是否正确`
        );
      }
    };
    reader.readAsArrayBuffer(file);
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
          <div className="h-full flex flex-col">
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
            </div>
          </div>
        </Sider>
      </SiderContext.Provider>
      <div className="flex-1 min-w-0 flex flex-col">
        {selectedExcelData.length === 0 && (
          <div className="w-full h-full flex items-center justify-center">
            <Empty description="请选择需要查看的Excel文件" />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
