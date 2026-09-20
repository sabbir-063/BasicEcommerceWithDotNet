import React, { useEffect as reactUseEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import "./styles.css";

function useEffect(effect: () => unknown, dependencies: React.DependencyList) {
  reactUseEffect(() => {
    void effect();
  }, dependencies);
}

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
};
type Product = {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  imageAltText?: string;
  isActive?: boolean;
};
type Cart = {
  id: string;
  items: {
    id: string;
    productId: string;
    productName: string;
    imageUrl?: string;
    unitPrice: number;
    quantity: number;
    availableStock: number;
    lineTotal: number;
  }[];
  itemCount: number;
  totalAmount: number;
};
type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone?: string;
  shippingAddress?: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  items?: {
    id: string;
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
};
type Page<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
class ApiError extends Error {
  constructor(
    public status: number,
    public code?: string,
    message = "Request failed",
  ) {
    super(message);
  }
}
async function api<T>(path: string, init: RequestInit = {}) {
  const token = sessionStorage.getItem("token");
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, undefined, "Network error. Please try again.");
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    if (res.status === 401) sessionStorage.removeItem("token");
    throw new ApiError(
      res.status,
      data?.code,
      data?.detail || data?.title || "Request failed",
    );
  }
  return data as T;
}
const money = (v: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(v);
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (sessionStorage.getItem("token"))
      api<User>("/auth/me")
        .then(setUser)
        .catch(() => setUser(null));
  }, []);
  return { user, setUser };
}
function Header({
  user,
  onLogout,
  cartCount,
}: {
  user: User | null;
  onLogout: () => void;
  cartCount: number;
}) {
  return (
    <header>
      <div className="nav wrap">
        <Link className="brand" to="/">
          BasicCommerce
        </Link>
        <nav>
          <Link to="/shop">Shop</Link>
          {user && <Link to="/cart">Cart ({cartCount})</Link>}
          {user && <Link to="/orders">Orders</Link>}
          {user?.role === "Admin" && <Link to="/admin">Admin</Link>}
          {user ? (
            <>
              <Link to="/profile">{user.name}</Link>
              <button className="linkbtn" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link className="btn small" to="/register">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
function Layout() {
  const { user, setUser } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const refresh = () =>
    user &&
    api<Cart>("/cart")
      .then((c) => setCartCount(c.itemCount))
      .catch(() => {});
  useEffect(refresh, [user]);
  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
    setCartCount(0);
  };
  return (
    <>
      <Header user={user} onLogout={logout} cartCount={cartCount} />
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route
            path="/products/:slug"
            element={<ProductPage onCartChange={refresh} />}
          />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <Guard user={user}>
                <Profile user={user!} onSave={setUser} />
              </Guard>
            }
          />
          <Route
            path="/change-password"
            element={
              <Guard user={user}>
                <ChangePassword />
              </Guard>
            }
          />
          <Route
            path="/cart"
            element={
              <Guard user={user}>
                <CartPage onChange={refresh} />
              </Guard>
            }
          />
          <Route
            path="/checkout"
            element={
              <Guard user={user}>
                <Checkout />
              </Guard>
            }
          />
          <Route
            path="/orders"
            element={
              <Guard user={user}>
                <Orders />
              </Guard>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <Guard user={user}>
                <OrderDetail />
              </Guard>
            }
          />
          <Route
            path="/admin/*"
            element={
              <Guard user={user} admin>
                <Admin />
              </Guard>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer>
        <div className="wrap">
          Cash on Delivery · Secure ordering · © 2026 BasicCommerce
        </div>
      </footer>
    </>
  );
}
function Guard({
  user,
  admin,
  children,
}: {
  user: User | null;
  admin?: boolean;
  children: React.ReactNode;
}) {
  if (!user)
    return sessionStorage.getItem("token") ? (
      <Loading />
    ) : (
      <Navigate to="/login" replace />
    );
  if (admin && user.role !== "Admin") return <Navigate to="/403" replace />;
  return <>{children}</>;
}
function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<
    { id: string; name: string; slug: string }[]
  >([]);
  useEffect(() => {
    api<Page<Product>>("/products?pageSize=6").then((x) =>
      setProducts(x.items),
    );
    api<typeof cats>("/categories").then(setCats);
  }, []);
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">EVERYDAY ESSENTIALS</p>
          <h1>Simple things, thoughtfully chosen.</h1>
          <p>
            Discover practical products with a smooth, secure Cash on Delivery
            experience.
          </p>
          <Link className="btn" to="/shop">
            Shop the collection
          </Link>
        </div>
        <div className="hero-art">✦</div>
      </section>
      <h2>Shop by category</h2>
      <div className="catgrid">
        {cats.map((c) => (
          <Link className="category" key={c.id} to={`/shop?categoryId=${c.id}`}>
            {c.name}
          </Link>
        ))}
      </div>
      <div className="section-head">
        <h2>Featured products</h2>
        <Link to="/shop">View all →</Link>
      </div>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </>
  );
}
function ProductCard({ p }: { p: Product }) {
  return (
    <Link className="card" to={`/products/${p.slug}`}>
      <div className="image">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.imageAltText || p.name} />
        ) : (
          <span>{p.name.slice(0, 1)}</span>
        )}
      </div>
      <p className="muted">{p.categoryName}</p>
      <h3>{p.name}</h3>
      <strong>{money(p.price)}</strong>
      <p className={p.stockQuantity ? "stock" : "stock out"}>
        {p.stockQuantity ? `${p.stockQuantity} in stock` : "Out of stock"}
      </p>
    </Link>
  );
}
function Shop() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<Page<Product> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    setError("");
    api<Page<Product>>(`/products?${params.toString()}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [params]);
  const update = (k: string, v: string) => {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v);
    else n.delete(k);
    n.delete("page");
    setParams(n);
  };
  return (
    <>
      <div className="section-head">
        <div>
          <p className="eyebrow">CATALOG</p>
          <h1>Shop all products</h1>
        </div>
        <Link className="btn" to="/cart">
          View cart
        </Link>
      </div>
      <div className="filters">
        <input
          aria-label="Search products"
          placeholder="Search products"
          value={params.get("search") || ""}
          onChange={(e) => update("search", e.target.value)}
        />
        <select
          aria-label="Sort"
          value={params.get("sort") || ""}
          onChange={(e) => update("sort", e.target.value)}
        >
          <option value="">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="name_asc">Name</option>
        </select>
        <button className="btn ghost" onClick={() => setParams({})}>
          Clear
        </button>
      </div>
      {error && <Banner text={error} />}{" "}
      {!data ? (
        <Loading />
      ) : data.items.length ? (
        <>
          <p className="muted">{data.totalItems} results</p>
          <div className="grid">
            {data.items.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
          <div className="pagination">
            {Array.from({ length: data.totalPages }, (_, i) => (
              <button
                className={data.page === i + 1 ? "active" : ""}
                key={i}
                onClick={() => update("page", String(i + 1))}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      ) : (
        <Empty text="No products match these filters." />
      )}
    </>
  );
}
function ProductPage({ onCartChange }: { onCartChange: () => void }) {
  const { slug } = useParams();
  const [p, setP] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");
  const nav = useNavigate();
  useEffect(() => {
    api<Product>(`/products/${slug}`)
      .then(setP)
      .catch(() => setP(null));
  }, [slug]);
  if (!p) return <NotFound />;
  const add = async () => {
    if (!sessionStorage.getItem("token")) {
      nav(`/login?returnTo=/products/${slug}`);
      return;
    }
    try {
      await api("/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId: p.id, quantity: qty }),
      });
      setMsg("Added to cart");
      onCartChange();
    } catch (e) {
      setMsg((e as Error).message);
    }
  };
  return (
    <div className="detail">
      <div className="detail-image image">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.imageAltText || p.name} />
        ) : (
          <span>{p.name.slice(0, 1)}</span>
        )}
      </div>
      <div>
        <p className="muted">{p.categoryName}</p>
        <h1>{p.name}</h1>
        <p className="price">{money(p.price)}</p>
        <p>{p.description}</p>
        <p className={p.stockQuantity ? "stock" : "stock out"}>
          {p.stockQuantity ? `${p.stockQuantity} available` : "Out of stock"}
        </p>
        <div className="quantity">
          <label htmlFor="qty">Quantity</label>
          <input
            id="qty"
            type="number"
            min="1"
            max={p.stockQuantity}
            value={qty}
            onChange={(e) =>
              setQty(
                Math.max(1, Math.min(p.stockQuantity, Number(e.target.value))),
              )
            }
          />
        </div>
        <button className="btn" disabled={!p.stockQuantity} onClick={add}>
          Add to cart
        </button>
        {msg && (
          <p role="status" className="notice">
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await api<{ accessToken: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      sessionStorage.setItem("token", r.accessToken);
      onLogin(r.user);
      nav(r.user.role === "Admin" ? "/admin" : "/");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Auth title="Welcome back" onSubmit={submit} error={error}>
      <label>
        Email
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Password
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button className="btn">Sign in</button>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </Auth>
  );
}
function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const nav = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      nav("/login");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Auth title="Create your account" onSubmit={submit} error={error}>
      <label>
        Name
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>
      <label>
        Email
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>
      <label>
        Phone
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </label>
      <label>
        Password
        <input
          required
          minLength={8}
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </label>
      <label>
        Confirm password
        <input
          required
          type="password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />
      </label>
      <button className="btn">Register</button>
    </Auth>
  );
}
function Auth({
  title,
  onSubmit,
  error,
  children,
}: {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  children: React.ReactNode;
}) {
  return (
    <form className="form auth" onSubmit={onSubmit}>
      <p className="eyebrow">BASICCOMMERCE</p>
      <h1>{title}</h1>
      {error && <Banner text={error} />} {children}
    </form>
  );
}
function Profile({ user, onSave }: { user: User; onSave: (u: User) => void }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [msg, setMsg] = useState("");
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = await api<User>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name, phone }),
    });
    onSave(u);
    setMsg("Profile updated");
  };
  return (
    <form className="form" onSubmit={save}>
      <h1>Your profile</h1>
      <label>
        Email
        <input value={user.email} disabled />
      </label>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Phone
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <button className="btn">Save changes</button>
      {msg && <p className="notice">{msg}</p>}
      <Link to="/change-password">Change password</Link>
    </form>
  );
}
function ChangePassword() {
  const [f, setF] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [msg, setMsg] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.newPassword !== f.confirm) {
      setMsg("Passwords do not match");
      return;
    }
    try {
      await api("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: f.currentPassword,
          newPassword: f.newPassword,
        }),
      });
      setMsg("Password changed");
    } catch (e) {
      setMsg((e as Error).message);
    }
  };
  return (
    <form className="form" onSubmit={submit}>
      <h1>Change password</h1>
      {["currentPassword", "newPassword", "confirm"].map((k) => (
        <label key={k}>
          {k === "currentPassword"
            ? "Current password"
            : k === "newPassword"
              ? "New password"
              : "Confirm new password"}
          <input
            required
            type="password"
            value={f[k as keyof typeof f]}
            onChange={(e) => setF({ ...f, [k]: e.target.value })}
          />
        </label>
      ))}
      <button className="btn">Update password</button>
      {msg && <p className="notice">{msg}</p>}
    </form>
  );
}
function CartPage({ onChange }: { onChange: () => void }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState("");
  const load = () =>
    api<Cart>("/cart")
      .then(setCart)
      .catch((e) => setError(e.message));
  useEffect(load, []);
  if (!cart) return <Loading />;
  return (
    <>
      <h1>Your cart</h1>
      {error && <Banner text={error} />}{" "}
      {!cart.items.length ? (
        <Empty
          text="Your cart is empty."
          action={
            <Link className="btn" to="/shop">
              Continue shopping
            </Link>
          }
        />
      ) : (
        <div className="cart">
          <div>
            {cart.items.map((i) => (
              <div className="cartrow" key={i.id}>
                <div className="thumb">{i.productName.slice(0, 1)}</div>
                <div>
                  <h3>{i.productName}</h3>
                  <p className="muted">{money(i.unitPrice)} each</p>
                </div>
                <input
                  aria-label={`Quantity for ${i.productName}`}
                  type="number"
                  min="1"
                  max={i.availableStock}
                  value={i.quantity}
                  onChange={async (e) => {
                    try {
                      await api(`/cart/items/${i.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({
                          quantity: Number(e.target.value),
                        }),
                      });
                      load();
                      onChange();
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                />
                <strong>{money(i.lineTotal)}</strong>
                <button
                  className="linkbtn danger"
                  onClick={async () => {
                    await api(`/cart/items/${i.id}`, { method: "DELETE" });
                    load();
                    onChange();
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <aside className="summary">
            <h2>Summary</h2>
            <p>
              Total items <strong>{cart.itemCount}</strong>
            </p>
            <p>
              Total <strong>{money(cart.totalAmount)}</strong>
            </p>
            <Link className="btn" to="/checkout">
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}
function Checkout() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [f, setF] = useState({
    customerName: "",
    phone: "",
    shippingAddress: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  useEffect(() => {
    api<Cart>("/cart")
      .then(setCart)
      .catch((e) => setError(e.message));
  }, []);
  if (!cart) return <Loading />;
  if (!cart.items.length)
    return (
      <Empty
        text="Add items before checkout."
        action={
          <Link className="btn" to="/shop">
            Shop now
          </Link>
        }
      />
    );
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const o = await api<Order>("/orders", {
        method: "POST",
        body: JSON.stringify({ ...f, paymentMethod: "CashOnDelivery" }),
      });
      nav(`/orders/${o.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };
  return (
    <div className="checkout">
      <form className="form" onSubmit={submit}>
        <h1>Checkout</h1>
        {error && <Banner text={error} />}
        <label>
          Full name
          <input
            required
            value={f.customerName}
            onChange={(e) => setF({ ...f, customerName: e.target.value })}
          />
        </label>
        <label>
          Phone
          <input
            required
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value })}
          />
        </label>
        <label>
          Shipping address
          <textarea
            required
            rows={4}
            value={f.shippingAddress}
            onChange={(e) => setF({ ...f, shippingAddress: e.target.value })}
          />
        </label>
        <div className="cod">
          <strong>Cash on Delivery</strong>
          <span>Pay when your order arrives.</span>
        </div>
        <button className="btn" disabled={busy}>
          {busy ? "Placing order…" : "Place order"}
        </button>
      </form>
      <aside className="summary">
        <h2>Order summary</h2>
        {cart.items.map((i) => (
          <p key={i.id}>
            {i.productName} × {i.quantity}
            <strong>{money(i.lineTotal)}</strong>
          </p>
        ))}
        <hr />
        <h3>
          Total <strong>{money(cart.totalAmount)}</strong>
        </h3>
      </aside>
    </div>
  );
}
function Orders() {
  const [data, setData] = useState<Page<Order> | null>(null);
  useEffect(() => {
    api<Page<Order>>("/orders").then(setData);
  }, []);
  if (!data) return <Loading />;
  return (
    <>
      <h1>My orders</h1>
      {data.items.length ? (
        <div className="table">
          {data.items.map((o) => (
            <Link className="tablerow" key={o.id} to={`/orders/${o.id}`}>
              <span>{o.orderNumber}</span>
              <span>{new Date(o.createdAt).toLocaleDateString()}</span>
              <span className="badge">{o.status}</span>
              <strong>{money(o.totalAmount)}</strong>
            </Link>
          ))}
        </div>
      ) : (
        <Empty
          text="No orders yet."
          action={
            <Link className="btn" to="/shop">
              Start shopping
            </Link>
          }
        />
      )}
    </>
  );
}
function OrderDetail() {
  const { id } = useParams();
  const [o, setO] = useState<Order | null>(null);
  const [msg, setMsg] = useState("");
  const load = () =>
    api<Order>(`/orders/${id}`)
      .then(setO)
      .catch(() => setO(null));
  useEffect(load, [id]);
  if (!o) return <NotFound />;
  const cancel = async () => {
    try {
      await api(`/orders/${id}/cancel`, { method: "POST" });
      load();
    } catch (e) {
      setMsg((e as Error).message);
    }
  };
  return (
    <>
      <div className="section-head">
        <div>
          <p className="eyebrow">ORDER CONFIRMATION</p>
          <h1>{o.orderNumber}</h1>
        </div>
        <span className="badge">{o.status}</span>
      </div>
      <div className="ordergrid">
        <div>
          <h2>Items</h2>
          {o.items?.map((i) => (
            <div className="cartrow" key={i.id}>
              <div>
                <h3>{i.productName}</h3>
                <p>
                  {i.quantity} × {money(i.unitPrice)}
                </p>
              </div>
              <strong>{money(i.lineTotal)}</strong>
            </div>
          ))}
        </div>
        <aside className="summary">
          <h2>Delivery</h2>
          <p>{o.customerName}</p>
          <p>{o.phone}</p>
          <p>{o.shippingAddress}</p>
          <p>Payment: {o.paymentMethod}</p>
          <h3>Total {money(o.totalAmount)}</h3>
          {o.status === "Pending" && (
            <button className="btn dangerfill" onClick={cancel}>
              Cancel order
            </button>
          )}
          {msg && <p className="notice">{msg}</p>}
        </aside>
      </div>
    </>
  );
}
function Admin() {
  return (
    <Routes>
      <Route index element={<AdminDash />} />
      <Route path="categories" element={<AdminCategories />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="products/new" element={<AdminProductForm />} />
      <Route path="products/:id/edit" element={<AdminProductForm />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="orders/:id" element={<AdminOrderDetail />} />
    </Routes>
  );
}
function AdminDash() {
  const [s, setS] = useState<Record<string, number>>({});
  useEffect(() => {
    api<typeof s>("/admin/dashboard/summary").then(setS);
  }, []);
  return (
    <>
      <div className="section-head">
        <h1>Admin dashboard</h1>
        <Link className="btn" to="/admin/products/new">
          New product
        </Link>
      </div>
      <div className="metrics">
        {[
          ["Products", "totalProducts"],
          ["Active", "activeProducts"],
          ["Orders", "totalOrders"],
          ["Pending", "pendingOrders"],
          ["Customers", "totalCustomers"],
        ].map(([l, k]) => (
          <div className="metric" key={k}>
            <span>{l}</span>
            <strong>{s[k] ?? "—"}</strong>
          </div>
        ))}
      </div>
      <div className="adminlinks">
        <Link to="/admin/categories">Manage categories →</Link>
        <Link to="/admin/products">Manage products →</Link>
        <Link to="/admin/orders">Manage orders →</Link>
      </div>
    </>
  );
}
function AdminCategories() {
  const [cats, setCats] = useState<
    { id: string; name: string; slug: string; isActive: boolean }[]
  >([]);
  const [name, setName] = useState("");
  const load = () => api<typeof cats>("/admin/categories").then(setCats);
  useEffect(load, []);
  return (
    <>
      <h1>Categories</h1>
      <form
        className="inlineform"
        onSubmit={async (e) => {
          e.preventDefault();
          await api("/admin/categories", {
            method: "POST",
            body: JSON.stringify({ name }),
          });
          setName("");
          load();
        }}
      >
        <input
          placeholder="New category"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn">Add</button>
      </form>
      <div className="table">
        {cats.map((c) => (
          <div className="tablerow" key={c.id}>
            <span>{c.name}</span>
            <span>{c.slug}</span>
            <span>{c.isActive ? "Active" : "Disabled"}</span>
            <button
              className="linkbtn"
              onClick={async () => {
                await api(`/admin/categories/${c.id}/status`, {
                  method: "PATCH",
                  body: JSON.stringify({ isActive: !c.isActive }),
                });
                load();
              }}
            >
              {c.isActive ? "Disable" : "Enable"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
function AdminProducts() {
  const [data, setData] = useState<Page<Product> | null>(null);
  const load = () => api<Page<Product>>("/admin/products").then(setData);
  useEffect(load, []);
  if (!data) return <Loading />;
  return (
    <>
      <div className="section-head">
        <h1>Products</h1>
        <Link className="btn" to="/admin/products/new">
          Add product
        </Link>
      </div>
      <div className="table">
        {data.items.map((p) => (
          <div className="tablerow" key={p.id}>
            <span>{p.name}</span>
            <span>{p.categoryName}</span>
            <span>{money(p.price)}</span>
              <span>{p.stockQuantity} stock</span>
              <span>{p.isActive ? "Active" : "Disabled"}</span>
              <Link to={`/admin/products/${p.id}/edit`}>Edit</Link>
          </div>
        ))}
      </div>
    </>
  );
}
function AdminProductForm() {
  const { id } = useParams();
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [f, setF] = useState({
    categoryId: "",
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    imageUrl: "",
    imagePublicId: "",
    imageAltText: "",
  });
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const nav = useNavigate();
  useEffect(() => {
    api<typeof cats>("/admin/categories").then(setCats);
    if (id) {
      api<Product>(`/products/${id}`).then((product) =>
        setF({
          categoryId: product.categoryId,
          name: product.name,
          description: product.description,
          price: String(product.price),
          stockQuantity: String(product.stockQuantity),
          imageUrl: product.imageUrl || "",
          imagePublicId: "",
          imageAltText: product.imageAltText || "",
        }),
      );
    }
  }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api(id ? `/admin/products/${id}` : "/admin/products", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify({
          ...f,
          price: Number(f.price),
          stockQuantity: Number(f.stockQuantity),
          isActive: true,
        }),
      });
      nav("/admin/products");
    } catch (e) {
      setMsg((e as Error).message);
    }
  };
  const uploadImage = async (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMsg('Choose a JPG, PNG, or WEBP image up to 5 MB.');
      return;
    }
    setUploading(true);
    setMsg('');
    try {
      const body = new FormData();
      body.append('file', file);
      const uploaded = await api<{ url: string; publicId: string }>('/admin/media/images', {
        method: 'POST',
        body,
      });
      setF((current) => ({ ...current, imageUrl: uploaded.url, imagePublicId: uploaded.publicId }));
    } catch (error) {
      setMsg((error as Error).message);
    } finally {
      setUploading(false);
    }
  };
  return (
    <form className="form wide" onSubmit={submit}>
      <h1>{id ? "Edit product" : "New product"}</h1>
      {msg && <Banner text={msg} />}
      <label>
        Category
        <select
          required
          value={f.categoryId}
          onChange={(e) => setF({ ...f, categoryId: e.target.value })}
        >
          <option value="">Select category</option>
          {cats
            .filter((c) => c)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </label>
      <label>
        Product image
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => void uploadImage(e.target.files?.[0])}
        />
      </label>
      {uploading && <p className="muted">Uploading image…</p>}
      {f.imageUrl && <img className="upload-preview" src={f.imageUrl} alt={f.imageAltText || 'Product preview'} />}
      {[
        ["name", "Name"],
        ["description", "Description"],
        ["price", "Price (BDT)"],
        ["stockQuantity", "Stock"],
        ["imageAltText", "Image alt text"],
      ].map(([k, l]) => (
        <label key={k}>
          {l}
          {k === "description" ? (
            <textarea
              required
              value={f[k as keyof typeof f]}
              onChange={(e) => setF({ ...f, [k]: e.target.value })}
            />
          ) : (
            <input
              required={k === "name" || k === "price" || k === "stockQuantity"}
              type={k === "price" || k === "stockQuantity" ? "number" : "text"}
              value={f[k as keyof typeof f]}
              onChange={(e) => setF({ ...f, [k]: e.target.value })}
            />
          )}
        </label>
      ))}
      <button className="btn">Save product</button>
    </form>
  );
}
function AdminOrders() {
  const [data, setData] = useState<Page<Order> | null>(null);
  useEffect(() => {
    api<Page<Order>>("/admin/orders").then(setData);
  }, []);
  if (!data) return <Loading />;
  return (
    <>
      <h1>Orders</h1>
      <div className="table">
        {data.items.map((o) => (
          <Link className="tablerow" key={o.id} to={`/admin/orders/${o.id}`}>
            <span>{o.orderNumber}</span>
            <span>{o.customerName}</span>
            <span className="badge">{o.status}</span>
            <strong>{money(o.totalAmount)}</strong>
          </Link>
        ))}
      </div>
    </>
  );
}
function AdminOrderDetail() {
  const { id } = useParams();
  const [o, setO] = useState<Order | null>(null);
  const load = () => api<Order>(`/admin/orders/${id}`).then(setO);
  useEffect(load, [id]);
  if (!o) return <Loading />;
  const next: { [k: string]: string[] } = {
    Pending: ["Confirmed", "Cancelled"],
    Confirmed: ["Shipped", "Cancelled"],
    Shipped: ["Delivered"],
  };
  return (
    <>
      <h1>{o.orderNumber}</h1>
      <p>
        Status: <span className="badge">{o.status}</span>
      </p>
      <p>
        {o.customerName} · {o.phone} · {o.shippingAddress}
      </p>
      <div className="actions">
        {next[o.status]?.map((s) => (
          <button
            className="btn"
            key={s}
            onClick={async () => {
              await api(`/admin/orders/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: s }),
              });
              load();
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <h2>Items</h2>
      {o.items?.map((i) => (
        <div className="tablerow" key={i.id}>
          <span>
            {i.productName} × {i.quantity}
          </span>
          <strong>{money(i.lineTotal)}</strong>
        </div>
      ))}
    </>
  );
}
function Banner({ text }: { text: string }) {
  return (
    <div className="banner" role="alert">
      {text}
    </div>
  );
}
function Empty({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="empty">
      <p>{text}</p>
      {action}
    </div>
  );
}
function Loading() {
  return <div className="loading">Loading…</div>;
}
function NotFound() {
  return (
    <div className="empty">
      <h1>Page not found</h1>
      <Link className="btn" to="/">
        Back home
      </Link>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Layout />
  </BrowserRouter>,
);
