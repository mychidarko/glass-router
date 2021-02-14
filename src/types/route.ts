import { IParams } from "interfaces/route";

export type To = NamedRoute | PathedRoute;

export type NamedRoute = {
  name: string;
  params?: IParams;
};

export type PathedRoute = {
  path: string;
};