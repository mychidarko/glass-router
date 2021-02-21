import { RouteProps } from "react-router-dom";

export interface IRouteBase extends RouteProps {
  path: string;
  name?: string;
  meta?: any;
  props?: object;
}

export interface IRoute extends IRouteBase {
  children?: Array<IRoute>
}

export interface IParams {
  [key: string]: string | number;
}

export interface IWrapperProps {
  useMiddleware: any;
  loadMiddleWare: any;
}
