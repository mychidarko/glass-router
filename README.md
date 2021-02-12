# Glass Router (GlassRX)

Glass router is a wrapper around `react-router-dom` which provides a clean and developer friendly approach to routing in React. GlassRX provides an extensible structure which opens up your project to more scalable setups.

*GlassRX is heavily inspired by `vue-router` and bases many features and conventions off of it.*

**Glass router is still being developed and so supports only the main react router features. Check this page for feature updates😇.**

## Installation

You can easily add GlassRX to your project with:

```sh
npm i glass-router --save
```

or

```sh
yarn add glass-router
```

## Usage

To get started with glass router, simply import it in one of your base files, usually `App.js` (CRA). From there you can simply register your routes and let glass do the rest for you.

```js
// import glass router
import GlassRouter from "glass-router";

// bring in a route
import Home from "./Home";

// define all your routes
const routes = [
  {
    path: "/",
    exact: true,
    component: Home,
    name: "home",
  },
];

// initialize glass with all your routes
GlassRouter.options({ routes });

// Export routes into JSX
const Routes = () => GlassRouter.render();

// Build your app
const App = () => <Routes />;

export default App;
```

## Why use glass router?

- **Glass is easy to use**

    GlassRX focuses on simplicity and ease of use from a developer standpoint. From the example above, in order to add a new route, all you need to do is add a new route object.

    ```js
    const routes = [
        {
            path: "/",
            exact: true,
            component: Home,
            name: "home",
        },
        {
            path: "/dashboard",
            component: Dashboard,
            name: "dashboard",
        },
    ];
    ```

- **Easy to customize**

    Glass makes available an options method which allows you to make glass behave the way you want it to behave.

    ```js
    GlassRouter.options({
        // Use a hash router instead of history
        mode: "hash",
        // force full page reloads instead of SPA mode
        forceRefresh: true,
        routes
        // a lot more settings are available below
    });
    ```

- **Glass is more "scalable"**

    GlassRX gives you features which allow you to prioritize scalable and "good code" over the norm. One such feature is `named routes`. Named routes allow you to use route names instead of paths for routing...as paths can change at any time. Route names are defined on route initialization:

    ```js
    {
        path: "/dashboard",
        component: Dashboard,
        // name is defined here
        name: "dashboard",
    },
    ```

    To route to a path, you can use:

    ```js
    GlassRouter.push({ name: "dashboard" });
    ```

    You can also use the link component if you're in a component:

    ```js
    import { Link } from "glass-router";

    ...

    <Link to={{ name: "dashboard" }}>Dashboard</Link>
    ```

## Note

You might have noticed that everything above is very similar to vue router, glassRX includes `react-router` specific options like `exact` and `render`.

Route with `exact` prop

```js
import Home from "./Home"

export default [
  {
    path: "/",
    exact: true,
    component: Home,
    name: "home",
  },
];
```

Route with `render` instead of `component`.

```js
{
  path: "*",
  render: () => <h2>Page Not Found</h2>,
},
```

**More features like middleware are still being developed. Check this page for updates.**
