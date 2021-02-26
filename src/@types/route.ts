import { RouteProps } from "react-router-dom";

export interface IRoute extends RouteProps {
  path: string;
  name?: string;
  meta?: any;
}

export interface IParams {
  [key: string]: string | number;
}

export interface IWrapperProps {
  useMiddleware: any;
  loadMiddleWare: any;
  location?: any;
  history?: any;
  match?: any;
  staticContext?: any;
}

export type To = NamedRoute | PathedRoute;

export type NamedRoute = {
  name: string;
  params?: IParams;
  state: object | null;
};

export type PathedRoute = {
  path: string;
  state: object | null;
};
