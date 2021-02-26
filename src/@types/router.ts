import { IRoute } from "./route";

export interface IRouterOptions {
  routes: Array<IRoute>;
  mode: "history" | "hash";
  base: string;
  forceRefresh: false;
  getUserConfirmation: Window["confirm"];
  hashType: "slash" | "noslash" | "hashbang";
  keyLength: number | undefined;
  linkActiveClass: string;
  linkExactActiveClass: string;
  middleware: boolean;
  scrollBehavior: (savedPosition: { x: number; y: number }) => void;
}

export interface IRouterProps {
  basename?: string;
  hashType?: "slash" | "noslash" | "hashbang" 
  getUserConfirmation?: (message?: string | undefined) => boolean;
  forceRefresh?: boolean;
  keyLength?: number | undefined;
  history?: any;
}

declare global {
  export interface Window {
    $route: any;
  }
}

export type State = object | null;
