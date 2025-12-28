import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/seals", "routes/seals.tsx", [
    index("routes/seals/index.tsx"),
    route(":id", "routes/seals/$id.tsx"),
  ]),
  route("/cart", "routes/cart.tsx"),
] satisfies RouteConfig;
