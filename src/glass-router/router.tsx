import React from "react";
import { Router as Base, Route, Switch } from "react-router-dom";
import {
  createBrowserHistory,
  createHashHistory,
  History,
  UnregisterCallback,
} from "history";
import ScrollTo from "../utils/ScrollTo";
import {
  To,
  PathedRoute,
  NamedRoute,
  IRoute,
  IParams,
  IWrapperProps,
  IRouterOptions,
  IRouterProps,
  State,
} from "../@types";

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

  protected static _options: IRouterOptions;
  protected beforeHooks: Array<Function> = [];

  protected static _history: History<State>;

  constructor(options: Partial<IRouterOptions> = {}) {
    this.options(options);
  }

  options(options: Partial<IRouterOptions>): void {
    Router._options = {
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
      const { middleware } = to.meta || { middleware: null };

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
    const self = this;
    const {
      mode,
      routes,
      base,
      forceRefresh,
      getUserConfirmation,
      keyLength,
      hashType,
    } = Router._options;

    let routerProps: IRouterProps = {};

    if (mode === "history") {
      routerProps = {
        basename: base,
        forceRefresh,
        getUserConfirmation,
        keyLength,
      };

      Router._history = createBrowserHistory(routerProps);
    } else {
      routerProps = {
        basename: base,
        hashType,
        getUserConfirmation,
      };

      Router._history = createHashHistory(routerProps);
    }

    const children = (
      <>
        {/* <ScrollTo /> */}
        <Switch>
          {routes.map((route, index) => {
            const props: any = route;

            class Wrapper extends React.Component<IWrapperProps> {
              componentDidMount() {
                if (this.props.useMiddleware) {
                  return this.props.loadMiddleWare(route, null, self);
                }
              }

              render() {
                const $route = {
                  state:
                    (this.props.location && this.props.location.state) || null,
                  location: this.props.location,
                  history: this.props.history,
                  match: this.props.match,
                  staticContext: this.props.staticContext,
                };

                if (window) {
                  window.$route = $route;
                }

                const componentProps = { ...props, ...$route, $route };

                return (
                  <props.component {...componentProps} key={`class-${index}`} />
                );
              }
            }

            let containerProps = { ...props };
            delete containerProps.component;
            delete containerProps.render;

            const classProps = {
              useMiddleware: Router._options.middleware,
              loadMiddleWare: this.loadMiddleWare,
            };

            return (
              <Route
                {...containerProps}
                key={index}
                render={props => {
                  const wrapperProps = { ...props, ...classProps };
                  return <Wrapper {...wrapperProps} />;
                }}
              />
            );
          })}
        </Switch>
      </>
    );

    return (
      <Base history={Router._history} {...routerProps}>
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
    let route = Router._options.routes.find(route => {
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
    return Router._history.length;
  }

  /**
   * Get the The current action (PUSH, REPLACE, or POP)
   */
  action() {
    return Router._history.action;
  }

  protected sortState(to: To | string, state?: State) {
    if (state === null && typeof to === "object") {
      const namedRouteState = (to as NamedRoute).state;
      const pathedRouteState = (to as PathedRoute).state;
      state = namedRouteState ? namedRouteState : pathedRouteState;
    }
    return state;
  }

  /**
   * Internal middleware handler
   */
  loadMiddleWare(to: To | string, state?: State, self: this | null = null) {
    if (!self) self = this;

    const before = self.beforeHooks;

    to = self.getRoutePath(to);

    let fromRoute = window.location.pathname;

    if (Router._options.mode === "history") {
      fromRoute = window.location.pathname;
    } else {
      fromRoute = window.location.hash.substring(1);
    }

    var from = Router._options.routes.find(function(route) {
      return route.path === fromRoute;
    });

    const toRoute = Router._options.routes.find(function(route) {
      return route.path === to;
    });

    const next = (route: IRoute | null = null) => {
      if (route === null) return;

      const trueRoute = self?.getRoutePath(route.path);

      if (Router._options.mode === "hash") {
        return Router._history.push(trueRoute);
      }

      return Router._history.push(trueRoute, state);
    };

    return before.forEach(m => m(toRoute, from, next));
  }

  /**
   * Navigate to a specific path
   */
  push(to: To | string, state?: State): void {
    const path = this.getRoutePath(to);

    if (Router._options.mode === "hash") {
      return Router._history.push(path);
    }

    state = this.sortState(to, state);

    return Router._history.push(path, state);
  }

  /**
   * Replaces the current entry on the history stack
   */
  replace(options: any, state?: State): void {
    const path = this.getRoutePath(options);

    if (Router._options.mode === "hash") {
      return Router._history.replace(path);
    }

    state = this.sortState(options, state);

    return Router._history.replace(path, state);
  }

  /**
   * Moves the pointer in the history stack by n entries
   */
  go(n: number): void {
    return Router._history.go(n);
  }

  /**
   * Go back
   */
  back(): void {
    return Router._history.go(-1);
  }

  /**
   * Go forward
   */
  forward(): void {
    return Router._history.go(1);
  }

  /**
   * Go back
   */
  disable(prompt: any): UnregisterCallback {
    return Router._history.block(prompt);
  }

  history(): History<State> {
    return Router._history;
  }
}
