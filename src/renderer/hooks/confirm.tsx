import { App } from "antd";
import { ModalFuncProps } from "antd/lib";
import CloseIcon from "../assets/close-large.png";
import WarningIcon from "../assets/warning.png";
import { ReactNode } from "react";

export const useConfirm = () => {
  const { modal } = App.useApp();

  const confirm = ({
    message,
    subMessage: originSubMessage,
    ...props
  }: Omit<ModalFuncProps, "content"> & {
    message?: ReactNode;
    subMessage?: ReactNode | ReactNode[];
  }) => {
    const subMessages = originSubMessage
      ? Array.isArray(originSubMessage)
        ? originSubMessage
        : [originSubMessage]
      : [];

    const destory = modal.confirm({
      ...props,
      className: `modesign-confirm-modal ${props.className || ""}`,
      width: props.width ?? "32.5rem",
      closable: props.closable === false ? false : true,
      closeIcon:
        props.closeIcon === false ? (
          false
        ) : (
          <img className="w-6 h-6" src={CloseIcon} />
        ),
      content: (
        <div className="flex flex-col items-center">
          {message && (
            <div
              className="flex items-center mb-4"
              style={{
                color: "rgba(0,0,0,0.65)",
              }}
            >
              <img className="w-6 h-6" src={WarningIcon} />
              <div className="ml-1">{message}</div>
            </div>
          )}
          {subMessages &&
            subMessages.map((item, index) => {
              return (
                <div
                  key={index}
                  className="flex items-center max-w-full leading-6 mb-4 last:mb-0"
                  style={{
                    color: "rgba(0,0,0,0.65)",
                  }}
                >
                  {item}
                </div>
              );
            })}
        </div>
      ),
    });
    return destory;
  };
  return { confirm } as const;
};
