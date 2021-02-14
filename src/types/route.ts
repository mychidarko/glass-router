import { IParams } from "interfaces/route";

export type To = NamedRoute | PathedRoute;

export type NamedRoute = {
  name: string;
  params?: IParams;
  state?: object;
};

export type PathedRoute = {
  path: string;
  state?: object;
};