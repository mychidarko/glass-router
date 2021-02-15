import React from "react";
import {
  Router as Base,
  Route,
  Switch,
} from "react-router-dom";
import { createBrowserHistory, createHashHistory } from "history";

import ScrollTo from "./utils/ScrollTo";
import { To, PathedRoute, NamedRoute } from "./types/route";
import { IRoute, IParams } from "./interfaces/route";
import { IRouterOptions } from "./interfaces/router";

/**
 * Glass Router
 * --------
 * Easy peasy routing for react.
 * Inspired by vue router.
 */
export default class Router {
  protected _defaultOptions: IRouterOptions = {
    routes: [],
    mode: "history",
    base: "/",
    forceRefresh: false,
    getUserConfirmation: window.confirm,
    hashType: "slash",
    keyLength: 6,
    linkActiveClass: "router-link-active",
    linkExactActiveClass: "router-link-exact-active",
    middleware: false,
    scrollBehavior: (savedPosition: { x: number; y: number }) => {
      const { x, y } = savedPosition;
      ScrollTo(x, y);
    },
  };

  protected _options: IRouterOptions = {
    routes: [],
    mode: "history",
    base: "/",
    forceRefresh: false,
    getUserConfirmation: window.confirm,
    hashType: "slash",
    keyLength: 6,
    linkActiveClass: "router-link-active",
    linkExactActiveClass: "router-link-exact-active",
    middleware: false,
    scrollBehavior: (savedPosition: { x: number; y: number }) => {
      const { x, y } = savedPosition;
      ScrollTo(x, y);
    },
  };

  protected beforeHooks: Array<Function> = [];

  protected _history: any = null;

  constructor(options: Partial<IRouterOptions> = {}) {
    this.options(options);
  }

  options(options: Partial<IRouterOptions>) {
    this._options = {
      ...this._defaultOptions,
      ...options,
    };

    if (options.middleware) {
      this.initializeMiddleWare();
    }
  }


  /**
   * Initialize middleware handler
   */
  protected initializeMiddleWare() {
    this.beforeEach((to: IRoute, from: IRoute, next: Function) => {
      const { middleware } = to?.meta || { middleware: null };

      if (!middleware) return next();

      const context = {
        to,
        from,
        next,
      };

      return middleware[0]({
        ...context,
      });
    });
  }

  /**
   * Generate JSX from defined routes
   */
  render(): JSX.Element {
    const {
      mode,
      routes,
      base,
      forceRefresh,
      getUserConfirmation,
      keyLength,
      hashType,
    } = this._options;

    let routerProps = {};

    if (mode === "history") {
      routerProps = {
        basename: base,
        forceRefresh,
        getUserConfirmation,
        keyLength,
      };

      this._history = createBrowserHistory(routerProps);
    } else {
      routerProps = {
        basename: base,
        hashType,
        getUserConfirmation,
      };

      this._history = createHashHistory(routerProps);
    }

    const children = (
      <>
        {/* <ScrollTo /> */}
        <Switch>
          {routes.map((route, index) => {
            const props: Exclude<IRoute, "name"> = route;
            return <Route {...props} key={index} />;
          })}
        </Switch>
      </>
    );

    return (
      <Base history={this._history} {...routerProps}>
        {children}
      </Base>
    );
  }

  /**
   * Register a router hook
   */
  registerHook(list: Array<Function | Object>, fn: Function) {
    list.push(fn);

    return function() {
      const i = list.indexOf(fn);

      if (i > -1) {
        list.splice(i, 1);
      }
    };
  }

  /**
   * Define middleware
   */
  beforeEach(fn: Function) {
    return this.registerHook(this.beforeHooks, fn);
  }

  /**
   * Internal route handler
   */
  getRoutePath(route: To | string): string {
    let rp: string = "";

    if (typeof route === "string") {
      rp = route[0] === "/" ? route : this.findNamedPath(route);
    } else {
      const name = (route as NamedRoute).name;
      const params = (route as NamedRoute).params;
      const path = (route as PathedRoute).path;

      if (path) rp = path;
      if (name) rp = this.findNamedPath(name);
      if (params) rp = this.findNamedPath(name, params);
    }

    return rp;
  }

  protected findNamedPath(path: string, params?: IParams): string {
    let route = this._options.routes.find((route) => {
      return route.name === path;
    })?.path;

    if (route === undefined) {
      throw new Error(`Route ${path} does not exist`);
    }

    if (params !== undefined) {
      let routePath: string = `${route}`;

      for (let key in params) {
        routePath += `/${params[key]}`;
      }

      route = routePath;
    }

    return route;
  }

  /**
   * Get the number of entries in the history stack
   */
  entries() {
    return this._history.length;
  }

  /**
   * Get the The current action (PUSH, REPLACE, or POP)
   */
  action() {
    return this._history.action;
  }

  protected sortState(to: To | string, state: any = null) {
    if (state === null && typeof to === "object") {
      const namedRouteState = (to as NamedRoute).state;
      const pathedRouteState = (to as PathedRoute).state;

      if (namedRouteState) {
        state = namedRouteState;
      }

      if (pathedRouteState) {
        state = pathedRouteState;
      }
    }

    return state;
  }

  /**
   * Internal middleware handler
   */
  loadMiddleWare(to: To | string, state: any = null) {
    const before = this.beforeHooks;

    to = this.getRoutePath(to);

    let fromRoute = window.location.hash.substring(1);

    if (this._options.mode === "history") {
      fromRoute === window.location.pathname;
    }

    var from = this._options.routes.find(function(route) {
      return route.path === fromRoute;
    });

    const toRoute = this._options.routes.find(function(route) {
      return route.path === to;
    });

    const self = this;

    return before.forEach((m) =>
      m(to, from, function(route = toRoute) {
        if (self._options.mode === "hash") {
          return self._history.push(route?.path);
        }

        return self._history.push(route?.path, state);
      })
    );
  }

  /**
   * Navigate to a specific path
   */
  push(to: To | string, state: any = null) {
    this.loadMiddleWare(to, state);

    if (this._options.middleware) {
      return this.loadMiddleWare(to, state);
    }

    const path = this.getRoutePath(to);

    if (this._options.mode === "hash") {
      return this._history.push(path);
    }

    state = this.sortState(to, state);

    return this._history.push(path, state);
  }

  /**
   * Replaces the current entry on the history stack
   */
  replace(options: any, state: any = null) {
    this.loadMiddleWare(options, state);

    if (this._options.middleware) {
      return this.loadMiddleWare(options);
    }

    const path = this.getRoutePath(options);

    if (this._options.mode === "hash") {
      return this._history.replace(path);
    }

    state = this.sortState(options, state);

    return this._history.replace(path, state);
  }

  /**
   * Moves the pointer in the history stack by n entries
   */
  go(n: number) {
    return this._history.go(n);
  }

  /**
   * Go back
   */
  back() {
    return this._history.go(-1);
  }

  /**
   * Go forward
   */
  forward() {
    return this._history.go(1);
  }

  /**
   * Go back
   */
  disable(prompt: any) {
    return this._history.block(prompt);
  }

  history() {
    return this._history;
  }
}
