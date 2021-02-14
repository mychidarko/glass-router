import { RouteProps } from "react-router-dom";

export interface IRouteBase extends RouteProps {
  path: string;
  name?: string;
  meta?: object;
  props?: object;
}

export interface IRoute extends IRouteBase {
  children?: Array<IRoute>
}

export interface IParams {
  [key: string]: string | number;
}
