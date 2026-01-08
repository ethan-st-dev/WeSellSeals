import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/products", "routes/products.tsx"),
  route("/products/:id", "routes/products/$id.tsx"),
  route("/cart", "routes/cart.tsx"),
  route("/login", "routes/login.tsx"),
  route("/signup", "routes/signup.tsx"),
  route("/user", "routes/user.tsx"), 
  route("/checkout", "routes/checkout.tsx"),
  route("/admin", "routes/admin.tsx"),
] satisfies RouteConfig;
