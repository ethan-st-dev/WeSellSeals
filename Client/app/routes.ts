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
  route("/admin", "routes/admin._index.tsx"),
  route("/admin/add", "routes/admin.add.tsx"),
  route("/admin/edit/:id", "routes/admin.edit.$id.tsx"),
] satisfies RouteConfig;
