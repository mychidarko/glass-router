import { IRoute } from "./route";

export interface IRouterOptions {
  routes: Array<IRoute>;
  mode: "history" | "hash";
  base: string;
  forceRefresh: false;
  getUserConfirmation: Window["confirm"];
  hashType: "slash" | "noslash" | "hashbang";
  keyLength: Number;
  linkActiveClass: string;
  linkExactActiveClass: string;
  middleware: boolean;
  scrollBehavior: (savedPosition: { x: number; y: number }) => void;
}
