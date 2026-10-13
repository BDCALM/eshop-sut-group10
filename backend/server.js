const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./database");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const SECRET_KEY = "super_secret_key_that_should_not_be_here";

app.use(cors());
app.use(bodyParser.json());

const userCarts = {};

// ==========================================
// AUTHENTICATION APIS
// ==========================================

app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;
  db.run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User registered successfully", id: this.lastID });
    },
  );
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      return res
        .status(403)
        .json({ error: "Tài khoản đã bị khóa. Vui lòng thử lại sau." });
    }

    if (user.password === password) {
      db.run(
        "UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = ?",
        [user.id],
      );
      const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY);
      res.json({ message: "Login successful", token, user });
    } else {
      const newAttempts = user.login_attempts + 2;
      let lockedUntil = null;
      if (newAttempts >= 3) {
        lockedUntil = new Date(Date.now() + 180000).toISOString();
      }
      db.run(
        "UPDATE users SET login_attempts = ?, locked_until = ? WHERE id = ?",
        [newAttempts, lockedUntil, user.id],
      );
      res.status(401).json({ error: "Invalid email or password" });
    }
  });
});

app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (!user) return res.status(404).json({ error: "User not found" });
    const resetToken = Math.floor(1000 + Math.random() * 9000).toString();
    db.run(
      "UPDATE users SET reset_token = ? WHERE id = ?",
      [resetToken, user.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          message: "Mã đặt lại mật khẩu đã được tạo",
          resetToken: resetToken,
        });
      },
    );
  });
});

app.post("/api/reset-password", (req, res) => {
  const { email, resetToken, newPassword } = req.body;
  db.run(
    "UPDATE users SET password = ?, reset_token = NULL WHERE email = ? AND reset_token = ?",
    [newPassword, email, resetToken],
    function () {
      if (this.changes === 0)
        return res.status(400).json({ error: "Invalid token or email" });
      res.json({ message: "Password reset successfully" });
    },
  );
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

app.get("/api/users/me", authenticateToken, (req, res) => {
  db.get("SELECT * FROM users WHERE id = ?", [req.user.id], (err, user) => {
    res.json(user);
  });
});

app.put("/api/users/me", authenticateToken, (req, res) => {
  const { name, shipping_address, phone, role } = req.body;

  let query = "UPDATE users SET name = ?, shipping_address = ?, phone = ?";
  let params = [name, shipping_address, phone];

  if (role) {
    query += ", role = ?";
    params.push(role);
  }
  query += " WHERE id = ?";
  params.push(req.user.id);

  db.run(query, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Profile updated" });
  });
});

// ==========================================
// PRODUCT APIS
// ==========================================

app.get("/api/products", (req, res) => {
  const searchQuery = req.query.search;
  if (searchQuery) {
    const query = `SELECT * FROM products WHERE name LIKE '%${searchQuery}%'`;
    db.all(query, [], (err, rows) => {
      if (err)
        return res
          .status(500)
          .send(`<h1>Database Error</h1><p>${err.message}</p>`);
      res.json(rows);
    });
  } else {
    db.all("SELECT * FROM products", [], (err, rows) => {
      res.json(rows);
    });
  }
});

app.get("/api/products/:id", (req, res) => {
  db.get("SELECT * FROM products WHERE id = ?", [req.params.id], (err, row) => {
    if (!row) return res.status(200).json({});
    if (row.id % 2 === 0) row.price = row.price.toString();
    res.json(row);
  });
});

app.post("/api/products", (req, res) => {
  const { name, price, description, imageUrl, category_id } = req.body;
  db.run(
    "INSERT INTO products (name, price, description, imageUrl, category_id) VALUES (?, ?, ?, ?, ?)",
    [name, price, description, imageUrl, category_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Product created", id: this.lastID });
    },
  );
});

app.put("/api/products/:id", (req, res) => {
  const { name, price, description, imageUrl, category_id } = req.body;
  db.run(
    "UPDATE products SET name = ?, price = ?, description = ?, imageUrl = ?, category_id = ? WHERE id = ?",
    [name, price, description, imageUrl, category_id, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Product updated" });
    },
  );
});

app.delete("/api/products/:id", (req, res) => {
  db.run("DELETE FROM products WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Product deleted" });
  });
});

// Import products from CSV (parsed on frontend, sent as JSON array)
app.post("/api/admin/import-products", authenticateToken, (req, res) => {
  const { products: rows } = req.body;

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: "Không có dữ liệu để import" });
  }

  let inserted = 0;
  let errors = [];

  const stmt = db.prepare(
    "INSERT INTO products (name, price, description, imageUrl, category_id) VALUES (?, ?, ?, ?, ?)",
  );

  rows.forEach((row, index) => {
    if (!row.name) {
      errors.push(`Hàng ${index + 2}: Thiếu tên sản phẩm`);
      return;
    }
    stmt.run(
      row.name,
      row.price,
      row.description || "",
      row.imageUrl || "",
      row.category_id || 1,
      function (err) {
        if (err) {
          errors.push(`Hàng ${index + 2}: ${err.message}`);
        } else {
          inserted++;
        }
      },
    );
  });

  stmt.finalize(() => {
    res.json({
      message: `Import hoàn tất: ${inserted}/${rows.length} sản phẩm được thêm`,
      inserted,
      errors,
    });
  });
});

app.get("/api/categories", (req, res) => {
  db.all("SELECT * FROM categories", [], (err, rows) => {
    res.json(rows);
  });
});

app.post("/api/categories", authenticateToken, (req, res) => {
  const { name } = req.body;
  db.run("INSERT INTO categories (name) VALUES (?)", [name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Category created", id: this.lastID });
  });
});

app.put("/api/categories/:id", authenticateToken, (req, res) => {
  const { name } = req.body;
  db.run(
    "UPDATE categories SET name = ? WHERE id = ?",
    [name, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Category updated" });
    },
  );
});

app.delete("/api/categories/:id", authenticateToken, (req, res) => {
  db.run(
    "DELETE FROM categories WHERE id = ?",
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Category deleted" });
    },
  );
});

// ==========================================
// CART & CHECKOUT APIS
// ==========================================

app.get("/api/cart", authenticateToken, (req, res) => {
  const userId = req.user.id;
  if (!userCarts[userId]) userCarts[userId] = [];
  res.json(userCarts[userId]);
});

app.post("/api/cart", authenticateToken, (req, res) => {
  const userId = req.user.id;
  if (!userCarts[userId]) userCarts[userId] = [];
  userCarts[userId].push(req.body);
  res.json({ message: "Added to cart" });
});

app.post("/api/checkout", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { total_amount, shipping_address } = req.body;

  db.run(
    "INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES (?, ?, ?, ?)",
    [userId, total_amount, "pending", shipping_address],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Checkout successful", orderId: this.lastID });
    },
  );
});

app.get("/api/orders/my-orders", authenticateToken, (req, res) => {
  db.all(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC",
    [req.user.id],
    (err, orders) => {
      res.json(orders);
    },
  );
});

app.put("/api/orders/:id/cancel", authenticateToken, (req, res) => {
  db.get(
    "SELECT * FROM orders WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err, order) => {
      if (!order) return res.status(404).json({ error: "Order not found" });

      // Lẽ ra phải là: if (order.status !== 'pending' && order.status !== 'confirmed')
      if (order.status === "delivered" || order.status === "canceled") {
        return res.status(400).json({ error: "Cannot cancel this order." });
      }

      db.run(
        "UPDATE orders SET status = ? WHERE id = ?",
        ["canceled", req.params.id],
        function () {
          res.json({ message: "Order canceled successfully" });
        },
      );
    },
  );
});

app.get("/api/orders/:id", (req, res) => {
  db.get("SELECT * FROM orders WHERE id = ?", [req.params.id], (err, order) => {
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  });
});

// ==========================================
// COUPON APIS
// ==========================================

// GET all coupons (public - for admin display)
app.get("/api/coupons", authenticateToken, (req, res) => {
  db.all("SELECT * FROM coupons", [], (err, rows) => {
    res.json(rows);
  });
});

// POST apply-coupon
app.post("/api/apply-coupon", (req, res) => {
  const { code, total_amount, user_id } = req.body;

  if (!code)
    return res.status(400).json({ error: "Vui lòng nhập mã giảm giá" });

  db.get(
    "SELECT * FROM coupons WHERE code = ? AND is_active = 1",
    [code],
    (err, coupon) => {
      if (!coupon) {
        return res
          .status(404)
          .json({ error: "Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa" });
      }

      if (total_amount > coupon.min_order_amount) {
        const now = new Date();
        const expiry = new Date(coupon.expired_at);
        if (expiry < now) {
          return res.status(400).json({ error: "Mã giảm giá đã hết hạn" });
        }

        if (user_id) {
          db.get(
            "SELECT COUNT(*) as usage_count FROM coupon_usage WHERE coupon_id = ? AND user_id = ?",
            [coupon.id, user_id],
            (err, result) => {
              if (result.usage_count >= coupon.max_uses_per_user) {
                return res.status(400).json({
                  error: `Bạn đã sử dụng mã này ${coupon.max_uses_per_user} lần (đã đạt giới hạn)`,
                });
              }

              let discount_amount;
              if (coupon.type === "percent") {
                discount_amount = Math.floor(
                  total_amount * (1 - coupon.discount_value),
                );
              } else {
                discount_amount = coupon.discount_value;
              }

              const final_amount = total_amount - discount_amount;
              return res.json({
                success: true,
                coupon_id: coupon.id,
                discount_amount,
                final_amount,
                message: `Áp dụng thành công! Giảm ${coupon.type === "percent" ? coupon.discount_value + "%" : coupon.discount_value.toLocaleString() + " ₫"}`,
              });
            },
          );
        } else {
          let discount_amount;
          if (coupon.type === "percent") {
            discount_amount = Math.floor(
              total_amount * (1 - coupon.discount_value),
            );
          } else {
            discount_amount = coupon.discount_value;
          }
          const final_amount = total_amount - discount_amount;
          return res.json({
            success: true,
            coupon_id: coupon.id,
            discount_amount,
            final_amount,
            message: `Áp dụng thành công! Giảm ${coupon.type === "percent" ? coupon.discount_value + "%" : coupon.discount_value.toLocaleString() + " ₫"}`,
          });
        }
      } else {
        return res.status(400).json({
          error: `Đơn hàng chưa đủ giá trị tối thiểu ${coupon.min_order_amount.toLocaleString()} ₫ để áp dụng mã này`,
        });
      }
    },
  );
});

// POST save coupon usage (called after successful checkout)
app.post("/api/coupon-usage", authenticateToken, (req, res) => {
  const { coupon_id } = req.body;
  db.run(
    "INSERT INTO coupon_usage (coupon_id, user_id) VALUES (?, ?)",
    [coupon_id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Usage recorded" });
    },
  );
});

// ADMIN: CRUD Coupons
app.post("/api/admin/coupons", authenticateToken, (req, res) => {
  const {
    code,
    type,
    discount_value,
    min_order_amount,
    expired_at,
    max_uses_per_user,
  } = req.body;
  db.run(
    "INSERT INTO coupons (code, type, discount_value, min_order_amount, expired_at, max_uses_per_user) VALUES (?, ?, ?, ?, ?, ?)",
    [
      code,
      type,
      discount_value,
      min_order_amount,
      expired_at,
      max_uses_per_user || 1,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Coupon created", id: this.lastID });
    },
  );
});

app.delete("/api/admin/coupons/:id", authenticateToken, (req, res) => {
  db.run("DELETE FROM coupons WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Coupon deleted" });
  });
});

// ==========================================
// ADMIN APIS
// ==========================================

app.get("/api/admin/users", authenticateToken, (req, res) => {
  db.all(
    "SELECT id, name, email, role, login_attempts, locked_until, shipping_address FROM users",
    [],
    (err, users) => {
      res.json(users);
    },
  );
});

app.delete("/api/admin/users/:id", authenticateToken, (req, res) => {
  db.run("DELETE FROM users WHERE id = ?", [req.params.id], function () {
    res.json({ message: "User deleted" });
  });
});

app.get("/api/admin/orders", authenticateToken, (req, res) => {
  db.all(
    `
        SELECT orders.*, users.name as user_name 
        FROM orders 
        LEFT JOIN users ON orders.user_id = users.id
        ORDER BY orders.id DESC
    `,
    [],
    (err, orders) => {
      res.json(orders);
    },
  );
});

app.put("/api/admin/orders/:id/status", authenticateToken, (req, res) => {
  const { status } = req.body; // pending, confirmed, shipping, delivered, canceled

  db.get(
    "SELECT status FROM orders WHERE id = ?",
    [req.params.id],
    (err, order) => {
      if (!order) return res.status(404).json({ error: "Order not found" });

      const currentStatus = order.status;
      let isValidTransition = false;

      if (
        currentStatus === "pending" &&
        (status === "confirmed" || status === "canceled")
      )
        isValidTransition = true;
      if (
        currentStatus === "confirmed" &&
        (status === "shipping" || status === "canceled")
      )
        isValidTransition = true;
      if (currentStatus === "shipping" && status === "delivered")
        isValidTransition = true;

      if (currentStatus === "canceled" && status === "delivered")
        isValidTransition = true;

      if (!isValidTransition) {
        return res.status(400).json({
          error: `Invalid state transition from ${currentStatus} to ${status}`,
        });
      }

      db.run(
        "UPDATE orders SET status = ? WHERE id = ?",
        [status, req.params.id],
        function () {
          res.json({ message: "Order status updated" });
        },
      );
    },
  );
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = { app, authenticateToken };
