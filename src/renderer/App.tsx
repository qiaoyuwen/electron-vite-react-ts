/* eslint-disable no-cond-assign */
/* eslint-disable no-unused-expressions */
import { FC } from "react";
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";

const App: FC = () => {
  const elements = useRoutes(routes);

  return <div className="app">{elements}</div>;
};

export default App;
