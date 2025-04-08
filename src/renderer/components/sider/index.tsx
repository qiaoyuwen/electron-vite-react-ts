import { Button, Tooltip } from "antd";
import "./index.scss";
import { FC, PropsWithChildren, createContext, useContext } from "react";
import Icon from "@ant-design/icons";
import { CollapseIcon } from "@/icons/collapse";

export const SiderContext = createContext<{
  collapse?: boolean;
  setCollapse: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  collapse: false,
  setCollapse: () => {
    console.log("setCollapse is not implement");
  },
});

export const Sider: FC<
  PropsWithChildren<{
    width?: number;
    onWidthChange: (width: number) => void;
    isMoving: boolean;
    onMovingChange: (value: boolean) => void;
  }>
> = ({ width = 320, onWidthChange, isMoving, onMovingChange, children }) => {
  const { collapse, setCollapse } = useContext(SiderContext);

  const moving = (e: MouseEvent) => {
    if (e.clientX > 120 && e.clientX < 600) {
      onWidthChange(e.clientX);
    }
  };

  const endMove = () => {
    onMovingChange(false);
    document.removeEventListener("mousemove", moving);
    document.removeEventListener("mouseup", endMove);
  };

  const startMove = () => {
    onMovingChange(true);
    document.addEventListener("mousemove", moving);
    document.addEventListener("mouseup", endMove);
  };

  return (
    <div
      className={`sider ${isMoving ? "transition-none" : "transition-all"}`}
      style={{
        width: collapse ? 0 : width,
      }}
    >
      {children}
      <div
        className="sider-drag-line absolute w-1 top-0 bottom-0 right-0 cursor-col-resize translate-x-1 z-50"
        style={{
          display: collapse ? "none" : undefined,
        }}
        onMouseDown={startMove}
      />
      <Tooltip title={collapse ? "展开" : "收起"}>
        <Button
          className="sider-collapse-btn absolute flex items-center justify-center px-2 rounded bottom-8 -right-14 z-50"
          type="text"
          style={{
            backgroundColor: "#fff",
            boxShadow: "rgba(0, 0, 0, 0.15) 0px 4px 8px 0px",
          }}
          onClick={() => setCollapse((old) => !old)}
        >
          <Icon
            className="w-4 h-4"
            component={CollapseIcon}
            style={{
              transform: `rotate(${collapse ? 180 : 0}deg)`,
            }}
          />
        </Button>
      </Tooltip>
    </div>
  );
};
