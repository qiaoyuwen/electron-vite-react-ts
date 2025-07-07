import { Suspense, lazy, LazyExoticComponent, FC } from "react";
import { Navigate, RouteObject } from "react-router-dom";

const HomePage = lazy(() => import("../pages/home/index"));

const wrapSuspense = (PageComponent: LazyExoticComponent<FC>) => {
  return (
    <Suspense>
      <PageComponent />
    </Suspense>
  );
};

export const routes: RouteObject[] = [
  {
    path: "/home",
    element: wrapSuspense(HomePage),
  },
  {
    index: true,
    element: <Navigate to="/home" />,
  },
];
