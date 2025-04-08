import './tailwind.scss';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { FC } from 'react';

dayjs.locale('zh-cn');

const GlobalWrapper: FC = () => {

  return (
    <BrowserRouter /* basename="/app" */>
      <ConfigProvider
        locale={zhCN}
      >
        <AntdApp>
          <App />
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<GlobalWrapper />);
