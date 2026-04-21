const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false,
  },
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ==================================
   HELPERS
================================== */

function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access only.",
    });
  }

  next();
}

async function userExists(userId, role = null) {
  const sql = role
    ? `SELECT user_id FROM users WHERE user_id = ? AND role = ? AND status = 'active' LIMIT 1`
    : `SELECT user_id FROM users WHERE user_id = ? AND status = 'active' LIMIT 1`;

  const params = role ? [userId, role] : [userId];
  const [rows] = await pool.query(sql, params);
  return rows.length > 0;
}

/* ==================================
   ROOT
================================== */

app.get("/", (req, res) => {
  res.send("E&E Sales API is running");
});

/* ==================================
   AUTH
================================== */

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    const [existing] = await pool.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Email already registered.",
      });
    }

    const usernameBase = email.split("@")[0].toLowerCase();

    const [existingUsername] = await pool.query(
      "SELECT user_id FROM users WHERE username = ?",
      [usernameBase]
    );

    const username =
      existingUsername.length > 0
        ? `${usernameBase}_${Date.now()}`
        : usernameBase;

    const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, rounds);

    const [result] = await pool.query(
      `
      INSERT INTO users
      (full_name, username, email, password_hash, role, status)
      VALUES (?, ?, ?, ?, 'cashier', 'active')
      `,
      [name, username, email, passwordHash]
    );

    const user = {
      user_id: result.insertId,
      full_name: name,
      email,
      role: "cashier",
    };

    const token = generateToken(user);

    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role: "cashier",
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Registration failed.",
      error: error.message,
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = ?
      AND status = 'active'
      LIMIT 1
      `,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const user = rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    await pool.query(
      `
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE user_id = ?
      `,
      [user.user_id]
    );

    const token = generateToken(user);

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Login failed.",
      error: error.message,
    });
  }
});

app.get("/me", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT user_id, full_name, email, role, status, last_login
      FROM users
      WHERE user_id = ?
      LIMIT 1
      `,
      [req.user.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const user = rows[0];

    return res.json({
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
      last_login: user.last_login,
    });
  } catch (error) {
    console.error("GET /me ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch current user.",
      error: error.message,
    });
  }
});

/* ==================================
   PUBLIC / SHARED PRODUCTS
================================== */

app.get("/products", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.product_id,
        p.display_name,
        p.product_name,
        p.size_label,
        p.variant_label,
        p.product_code,
        p.barcode,
        p.unit_of_measure,
        p.is_active,
        pg.group_id,
        pg.group_name,
        COALESCE(i.stock_qty, 0) AS stock_qty,
        COALESCE(i.reorder_level, 0) AS reorder_level,
        COALESCE(pl.price, 0) AS price,
        pl.price_level_id,
        pl.price_label
      FROM products p
      INNER JOIN product_groups pg
        ON p.group_id = pg.group_id
      LEFT JOIN inventory i
        ON p.product_id = i.product_id
      LEFT JOIN (
        SELECT x.product_id, x.price_level_id, x.price_label, x.price
        FROM product_price_levels x
        INNER JOIN (
          SELECT product_id, MIN(price_level_id) AS min_price_level_id
          FROM product_price_levels
          WHERE is_active = 1
          GROUP BY product_id
        ) y
          ON x.price_level_id = y.min_price_level_id
      ) pl
        ON p.product_id = pl.product_id
      WHERE p.is_active = 1
      ORDER BY p.display_name ASC
    `);

    return res.json(rows);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch products.",
      error: error.message,
    });
  }
});

app.get("/product-groups", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT group_id, group_name, description
      FROM product_groups
      ORDER BY group_name ASC
    `);

    return res.json(rows);
  } catch (error) {
    console.error("GET PRODUCT GROUPS ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch product groups.",
      error: error.message,
    });
  }
});

/* ==================================
   CASHIER SALES
================================== */

app.post("/sales", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { items, amount_paid, cashier_id } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      connection.release();
      return res.status(400).json({
        message: "No sale items provided.",
      });
    }

    const cashierId = Number(cashier_id);

    if (!cashierId || !(await userExists(cashierId, "cashier"))) {
      connection.release();
      return res.status(400).json({
        message: "Invalid cashier account.",
      });
    }

    const paid = Number(amount_paid || 0);

    await connection.beginTransaction();

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const { product_id, quantity } = item;

      if (!product_id || !quantity || Number(quantity) <= 0) {
        throw new Error("Invalid product or quantity.");
      }

      const [rows] = await connection.query(
        `
        SELECT
          p.product_id,
          p.display_name,
          COALESCE(i.stock_qty, 0) AS stock_qty,
          ppl.price_level_id,
          ppl.price
        FROM products p
        LEFT JOIN inventory i
          ON p.product_id = i.product_id
        LEFT JOIN product_price_levels ppl
          ON p.product_id = ppl.product_id
         AND ppl.is_active = 1
        WHERE p.product_id = ?
          AND p.is_active = 1
        ORDER BY ppl.price_level_id ASC
        LIMIT 1
        `,
        [product_id]
      );

      if (rows.length === 0) {
        throw new Error("Product not found.");
      }

      const product = rows[0];

      if (Number(product.stock_qty) < Number(quantity)) {
        throw new Error(`Insufficient stock for ${product.display_name}`);
      }

      const unitPrice = Number(product.price || 0);
      const lineTotal = unitPrice * Number(quantity);

      subtotal += lineTotal;

      validatedItems.push({
        product_id: Number(product.product_id),
        quantity: Number(quantity),
        price_level_id: product.price_level_id || null,
        unit_price: unitPrice,
        line_total: lineTotal,
      });
    }

    if (paid < subtotal) {
      throw new Error("Insufficient payment.");
    }

    const changeAmount = paid - subtotal;
    const receiptNumber = `RCPT-${Date.now()}`;

    const [saleResult] = await connection.query(
      `
      INSERT INTO sales (
        receipt_number,
        cashier_id,
        subtotal,
        discount_amount,
        total_amount,
        payment_method,
        amount_paid,
        change_amount,
        status
      )
      VALUES (?, ?, ?, 0, ?, 'cash', ?, ?, 'completed')
      `,
      [receiptNumber, cashierId, subtotal, subtotal, paid, changeAmount]
    );

    const saleId = saleResult.insertId;

    for (const item of validatedItems) {
      await connection.query(
        `
        INSERT INTO sale_items (
          sale_id,
          product_id,
          price_level_id,
          quantity,
          unit_price,
          line_total
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          saleId,
          item.product_id,
          item.price_level_id,
          item.quantity,
          item.unit_price,
          item.line_total,
        ]
      );

      await connection.query(
        `
        UPDATE inventory
        SET stock_qty = stock_qty - ?
        WHERE product_id = ?
        `,
        [item.quantity, item.product_id]
      );
    }

    await connection.commit();
    connection.release();

    return res.status(201).json({
      message: "Sale completed successfully.",
      sale_id: saleId,
      receipt_number: receiptNumber,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error("POST SALES ERROR:", error);

    return res.status(500).json({
      message: error.message || "Sale failed.",
      error: error.message,
    });
  }
});

/* ==================================
   SHARED TRANSACTIONS
================================== */

app.get("/transactions", async (req, res) => {
  try {
    const [salesRows] = await pool.query(`
      SELECT
        s.sale_id,
        s.receipt_number,
        s.sale_datetime,
        s.total_amount,
        s.amount_paid,
        s.change_amount,
        s.status,
        u.full_name AS cashier_name
      FROM sales s
      INNER JOIN users u
        ON s.cashier_id = u.user_id
      ORDER BY s.sale_datetime DESC
      LIMIT 100
    `);

    if (salesRows.length === 0) {
      return res.json([]);
    }

    const saleIds = salesRows.map((row) => row.sale_id);
    const placeholders = saleIds.map(() => "?").join(",");

    const [itemRows] = await pool.query(
      `
      SELECT
        si.sale_id,
        p.display_name AS product_name,
        si.quantity,
        si.unit_price,
        si.line_total
      FROM sale_items si
      INNER JOIN products p
        ON si.product_id = p.product_id
      WHERE si.sale_id IN (${placeholders})
      ORDER BY si.sale_id DESC, si.sale_item_id ASC
      `,
      saleIds
    );

    const itemsBySaleId = {};

    for (const item of itemRows) {
      if (!itemsBySaleId[item.sale_id]) {
        itemsBySaleId[item.sale_id] = [];
      }

      itemsBySaleId[item.sale_id].push({
        product_name: item.product_name,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        line_total: Number(item.line_total),
      });
    }

    const result = salesRows.map((sale) => ({
      sale_id: sale.sale_id,
      receipt_number: sale.receipt_number,
      sale_datetime: sale.sale_datetime,
      total_amount: Number(sale.total_amount || 0),
      amount_paid: Number(sale.amount_paid || 0),
      change_amount: Number(sale.change_amount || 0),
      status: sale.status,
      cashier_name: sale.cashier_name,
      items: itemsBySaleId[sale.sale_id] || [],
    }));

    return res.json(result);
  } catch (error) {
    console.error("GET TRANSACTIONS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch transactions.",
      error: error.message,
    });
  }
});

/* ==================================
   LOW STOCK
================================== */

app.get("/low-stock", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.product_id,
        p.display_name,
        pg.group_name,
        COALESCE(i.stock_qty, 0) AS stock_qty,
        COALESCE(i.reorder_level, 0) AS reorder_level,
        CASE
          WHEN COALESCE(i.stock_qty, 0) = 0 THEN 'out_of_stock'
          WHEN COALESCE(i.stock_qty, 0) <= 5 THEN 'critical'
          WHEN COALESCE(i.stock_qty, 0) <= COALESCE(i.reorder_level, 0) THEN 'low'
          ELSE 'normal'
        END AS stock_status
      FROM inventory i
      INNER JOIN products p
        ON i.product_id = p.product_id
      INNER JOIN product_groups pg
        ON p.group_id = pg.group_id
      WHERE COALESCE(i.stock_qty, 0) <= COALESCE(i.reorder_level, 0)
         OR COALESCE(i.stock_qty, 0) <= 5
      ORDER BY stock_qty ASC, p.display_name ASC
    `);

    return res.json(rows);
  } catch (error) {
    console.error("LOW STOCK ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch low stock.",
      error: error.message,
    });
  }
});

/* ==================================
   ADMIN DASHBOARD
================================== */

app.get("/admin/dashboard", authMiddleware, adminOnly, async (req, res) => {
  try {
    const [[productsRow]] = await pool.query(`
      SELECT COUNT(*) AS total_products
      FROM products
      WHERE is_active = 1
    `);

    const [[cashiersRow]] = await pool.query(`
      SELECT COUNT(*) AS total_cashiers
      FROM users
      WHERE role = 'cashier'
        AND status = 'active'
    `);

    const [[todaySalesRow]] = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) AS total_sales_today
      FROM sales
      WHERE DATE(sale_datetime) = CURRENT_DATE()
        AND status = 'completed'
    `);

    const [[monthSalesRow]] = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) AS total_sales_month
      FROM sales
      WHERE YEAR(sale_datetime) = YEAR(CURRENT_DATE())
        AND MONTH(sale_datetime) = MONTH(CURRENT_DATE())
        AND status = 'completed'
    `);

    const [[lowStockRow]] = await pool.query(`
      SELECT COUNT(*) AS low_stock_count
      FROM inventory
      WHERE stock_qty <= reorder_level
         OR stock_qty <= 5
    `);

    const [[outOfStockRow]] = await pool.query(`
      SELECT COUNT(*) AS out_of_stock_count
      FROM inventory
      WHERE stock_qty = 0
    `);

    const [recentTransactions] = await pool.query(`
      SELECT
        s.sale_id,
        s.receipt_number,
        s.sale_datetime,
        s.total_amount,
        s.status,
        u.full_name AS cashier_name
      FROM sales s
      INNER JOIN users u
        ON s.cashier_id = u.user_id
      ORDER BY s.sale_datetime DESC
      LIMIT 5
    `);

    const [fastMoving] = await pool.query(`
      SELECT
        p.product_id,
        p.display_name,
        SUM(si.quantity) AS total_qty_sold,
        SUM(si.line_total) AS total_sales
      FROM sale_items si
      INNER JOIN sales s
        ON si.sale_id = s.sale_id
      INNER JOIN products p
        ON si.product_id = p.product_id
      WHERE s.status = 'completed'
      GROUP BY p.product_id, p.display_name
      ORDER BY total_qty_sold DESC
      LIMIT 5
    `);

    return res.json({
      totals: {
        total_products: Number(productsRow.total_products || 0),
        total_cashiers: Number(cashiersRow.total_cashiers || 0),
        total_sales_today: Number(todaySalesRow.total_sales_today || 0),
        total_sales_month: Number(monthSalesRow.total_sales_month || 0),
        low_stock_count: Number(lowStockRow.low_stock_count || 0),
        out_of_stock_count: Number(outOfStockRow.out_of_stock_count || 0),
      },
      recent_transactions: recentTransactions.map((row) => ({
        ...row,
        total_amount: Number(row.total_amount || 0),
      })),
      fast_moving_products: fastMoving.map((row) => ({
        ...row,
        total_qty_sold: Number(row.total_qty_sold || 0),
        total_sales: Number(row.total_sales || 0),
      })),
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch dashboard data.",
      error: error.message,
    });
  }
});

/* ==================================
   ADMIN PRODUCT MANAGEMENT
================================== */

app.get("/admin/products", authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.product_id,
        p.group_id,
        pg.group_name,
        p.product_code,
        p.product_name,
        p.size_label,
        p.variant_label,
        p.display_name,
        p.barcode,
        p.unit_of_measure,
        p.is_active,
        COALESCE(i.stock_qty, 0) AS stock_qty,
        COALESCE(i.reorder_level, 0) AS reorder_level,
        COALESCE(pl.price, 0) AS price,
        pl.price_level_id,
        pl.price_label
      FROM products p
      INNER JOIN product_groups pg
        ON p.group_id = pg.group_id
      LEFT JOIN inventory i
        ON p.product_id = i.product_id
      LEFT JOIN (
        SELECT x.product_id, x.price_level_id, x.price_label, x.price
        FROM product_price_levels x
        INNER JOIN (
          SELECT product_id, MIN(price_level_id) AS min_price_level_id
          FROM product_price_levels
          WHERE is_active = 1
          GROUP BY product_id
        ) y
          ON x.price_level_id = y.min_price_level_id
      ) pl
        ON p.product_id = pl.product_id
      ORDER BY p.display_name ASC
    `);

    return res.json(rows);
  } catch (error) {
    console.error("ADMIN PRODUCTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch admin products.",
      error: error.message,
    });
  }
});

app.post("/admin/products", authMiddleware, adminOnly, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      group_id,
      product_code,
      product_name,
      size_label,
      variant_label,
      display_name,
      barcode,
      unit_of_measure,
      price,
      price_label,
      reorder_level,
      initial_stock,
    } = req.body;

    if (!group_id || !product_name || !display_name) {
      connection.release();
      return res.status(400).json({
        message: "Group, product name, and display name are required.",
      });
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      `
      INSERT INTO products (
        group_id,
        product_code,
        product_name,
        size_label,
        variant_label,
        display_name,
        barcode,
        unit_of_measure,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
      [
        Number(group_id),
        product_code || null,
        product_name,
        size_label || null,
        variant_label || null,
        display_name,
        barcode || null,
        unit_of_measure || "pack",
      ]
    );

    const productId = result.insertId;

    await connection.query(
      `
      INSERT INTO inventory (
        product_id,
        stock_qty,
        reorder_level
      )
      VALUES (?, ?, ?)
      `,
      [
        productId,
        Number(initial_stock || 0),
        Number(reorder_level || 0),
      ]
    );

    await connection.query(
      `
      INSERT INTO product_price_levels (
        product_id,
        price_label,
        min_qty,
        unit_basis,
        price,
        is_active
      )
      VALUES (?, ?, 1, ?, ?, 1)
      `,
      [
        productId,
        price_label || "Regular",
        unit_of_measure || "pack",
        Number(price || 0),
      ]
    );

    await connection.commit();
    connection.release();

    return res.status(201).json({
      message: "Product added successfully.",
      product_id: productId,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error("ADD PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Failed to add product.",
      error: error.message,
    });
  }
});

app.put("/admin/products/:id", authMiddleware, adminOnly, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const productId = Number(req.params.id);
    const {
      group_id,
      product_code,
      product_name,
      size_label,
      variant_label,
      display_name,
      barcode,
      unit_of_measure,
      price,
      price_label,
      reorder_level,
    } = req.body;

    if (!productId) {
      connection.release();
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    await connection.beginTransaction();

    await connection.query(
      `
      UPDATE products
      SET
        group_id = ?,
        product_code = ?,
        product_name = ?,
        size_label = ?,
        variant_label = ?,
        display_name = ?,
        barcode = ?,
        unit_of_measure = ?
      WHERE product_id = ?
      `,
      [
        Number(group_id),
        product_code || null,
        product_name,
        size_label || null,
        variant_label || null,
        display_name,
        barcode || null,
        unit_of_measure || "pack",
        productId,
      ]
    );

    await connection.query(
      `
      UPDATE inventory
      SET reorder_level = ?
      WHERE product_id = ?
      `,
      [Number(reorder_level || 0), productId]
    );

    const [existingPriceRows] = await connection.query(
      `
      SELECT price_level_id
      FROM product_price_levels
      WHERE product_id = ?
      ORDER BY price_level_id ASC
      LIMIT 1
      `,
      [productId]
    );

    if (existingPriceRows.length > 0) {
      await connection.query(
        `
        UPDATE product_price_levels
        SET
          price_label = ?,
          unit_basis = ?,
          price = ?,
          is_active = 1
        WHERE price_level_id = ?
        `,
        [
          price_label || "Regular",
          unit_of_measure || "pack",
          Number(price || 0),
          existingPriceRows[0].price_level_id,
        ]
      );
    } else {
      await connection.query(
        `
        INSERT INTO product_price_levels (
          product_id,
          price_label,
          min_qty,
          unit_basis,
          price,
          is_active
        )
        VALUES (?, ?, 1, ?, ?, 1)
        `,
        [
          productId,
          price_label || "Regular",
          unit_of_measure || "pack",
          Number(price || 0),
        ]
      );
    }

    await connection.commit();
    connection.release();

    return res.json({
      message: "Product updated successfully.",
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error("UPDATE PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Failed to update product.",
      error: error.message,
    });
  }
});

app.put(
  "/admin/products/:id/deactivate",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const productId = Number(req.params.id);

      if (!productId) {
        return res.status(400).json({
          message: "Invalid product ID.",
        });
      }

      await pool.query(
        `
        UPDATE products
        SET is_active = 0
        WHERE product_id = ?
        `,
        [productId]
      );

      return res.json({
        message: "Product deactivated successfully.",
      });
    } catch (error) {
      console.error("DEACTIVATE PRODUCT ERROR:", error);

      return res.status(500).json({
        message: "Failed to deactivate product.",
        error: error.message,
      });
    }
  }
);

/* ==================================
   ADMIN INVENTORY MANAGEMENT
================================== */

app.post(
  "/admin/inventory/adjust",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const { product_id, adjustment_type, quantity } = req.body;

      const productId = Number(product_id);
      const qty = Number(quantity || 0);
      const type = String(adjustment_type || "").trim();

      if (!productId || !qty || qty <= 0) {
        return res.status(400).json({
          message: "Valid product and quantity are required.",
        });
      }

      if (!["stock_in", "deduct", "set"].includes(type)) {
        return res.status(400).json({
          message: "Invalid adjustment type.",
        });
      }

      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        const [inventoryRows] = await connection.query(
          `
          SELECT stock_qty
          FROM inventory
          WHERE product_id = ?
          LIMIT 1
          `,
          [productId]
        );

        if (inventoryRows.length === 0) {
          throw new Error("Inventory record not found.");
        }

        const currentQty = Number(inventoryRows[0].stock_qty || 0);
        let newQty = currentQty;

        if (type === "stock_in") {
          newQty = currentQty + qty;
        } else if (type === "deduct") {
          newQty = currentQty - qty;

          if (newQty < 0) {
            throw new Error("Cannot deduct more than current stock.");
          }
        } else if (type === "set") {
          newQty = qty;
        }

        await connection.query(
          `
          UPDATE inventory
          SET stock_qty = ?
          WHERE product_id = ?
          `,
          [newQty, productId]
        );

        await connection.commit();
        connection.release();

        return res.json({
          message: "Inventory updated successfully.",
          new_stock_qty: newQty,
        });
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error("INVENTORY ADJUST ERROR:", error);

      return res.status(500).json({
        message: error.message || "Failed to adjust inventory.",
        error: error.message,
      });
    }
  }
);

app.put(
  "/admin/inventory/reorder-level",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const { product_id, reorder_level } = req.body;

      const productId = Number(product_id);
      const reorderLevel = Number(reorder_level || 0);

      if (!productId || reorderLevel < 0) {
        return res.status(400).json({
          message: "Valid product and reorder level are required.",
        });
      }

      await pool.query(
        `
        UPDATE inventory
        SET reorder_level = ?
        WHERE product_id = ?
        `,
        [reorderLevel, productId]
      );

      return res.json({
        message: "Reorder level updated successfully.",
      });
    } catch (error) {
      console.error("UPDATE REORDER LEVEL ERROR:", error);

      return res.status(500).json({
        message: "Failed to update reorder level.",
        error: error.message,
      });
    }
  }
);

/* ==================================
   ADMIN SUPPLIERS
================================== */

app.get("/admin/suppliers", authMiddleware, adminOnly, async (req, res) => {
  try {
    const [suppliers] = await pool.query(`
      SELECT
        supplier_id,
        supplier_name,
        contact_number,
        is_active,
        created_at
      FROM suppliers
      ORDER BY supplier_name ASC
    `);

    const [pairs] = await pool.query(`
      SELECT
        sp.supplier_id,
        p.product_id,
        p.display_name
      FROM supplier_products sp
      INNER JOIN products p
        ON sp.product_id = p.product_id
      ORDER BY p.display_name ASC
    `);

    const groupedProducts = {};

    for (const row of pairs) {
      if (!groupedProducts[row.supplier_id]) {
        groupedProducts[row.supplier_id] = [];
      }

      groupedProducts[row.supplier_id].push({
        product_id: row.product_id,
        display_name: row.display_name,
      });
    }

    const result = suppliers.map((supplier) => ({
      ...supplier,
      products: groupedProducts[supplier.supplier_id] || [],
    }));

    return res.json(result);
  } catch (error) {
    console.error("GET ADMIN SUPPLIERS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch suppliers.",
      error: error.message,
    });
  }
});

app.post("/admin/suppliers", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { supplier_name, contact_number } = req.body;

    if (!supplier_name || !contact_number) {
      return res.status(400).json({
        message: "Supplier name and contact number are required.",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO suppliers (
        supplier_name,
        contact_number,
        is_active
      )
      VALUES (?, ?, 1)
      `,
      [supplier_name, contact_number]
    );

    return res.status(201).json({
      message: "Supplier added successfully.",
      supplier_id: result.insertId,
    });
  } catch (error) {
    console.error("ADD SUPPLIER ERROR:", error);

    return res.status(500).json({
      message: "Failed to add supplier.",
      error: error.message,
    });
  }
});

app.put("/admin/suppliers/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const supplierId = Number(req.params.id);
    const { supplier_name, contact_number, is_active } = req.body;

    if (!supplierId) {
      return res.status(400).json({
        message: "Invalid supplier ID.",
      });
    }

    await pool.query(
      `
      UPDATE suppliers
      SET
        supplier_name = ?,
        contact_number = ?,
        is_active = ?
      WHERE supplier_id = ?
      `,
      [
        supplier_name,
        contact_number,
        Number(is_active ? 1 : 0),
        supplierId,
      ]
    );

    return res.json({
      message: "Supplier updated successfully.",
    });
  } catch (error) {
    console.error("UPDATE SUPPLIER ERROR:", error);

    return res.status(500).json({
      message: "Failed to update supplier.",
      error: error.message,
    });
  }
});

app.put(
  "/admin/suppliers/:id/products",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const supplierId = Number(req.params.id);
      const { product_ids } = req.body;

      if (!supplierId || !Array.isArray(product_ids)) {
        connection.release();
        return res.status(400).json({
          message: "Invalid supplier or products list.",
        });
      }

      await connection.beginTransaction();

      await connection.query(
        `
        DELETE FROM supplier_products
        WHERE supplier_id = ?
        `,
        [supplierId]
      );

      for (const productId of product_ids) {
        await connection.query(
          `
          INSERT INTO supplier_products (
            supplier_id,
            product_id
          )
          VALUES (?, ?)
          `,
          [supplierId, Number(productId)]
        );
      }

      await connection.commit();
      connection.release();

      return res.json({
        message: "Supplier products updated successfully.",
      });
    } catch (error) {
      await connection.rollback();
      connection.release();

      console.error("UPDATE SUPPLIER PRODUCTS ERROR:", error);

      return res.status(500).json({
        message: "Failed to update supplier products.",
        error: error.message,
      });
    }
  }
);

/* ==================================
   ADMIN CASHIER MANAGEMENT
================================== */

app.get("/admin/cashiers", authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        user_id,
        full_name,
        username,
        email,
        role,
        status,
        created_at,
        last_login
      FROM users
      WHERE role = 'cashier'
      ORDER BY full_name ASC
    `);

    return res.json(rows);
  } catch (error) {
    console.error("GET CASHIERS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch cashiers.",
      error: error.message,
    });
  }
});

app.post("/admin/cashiers", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { full_name, username, email, password } = req.body;

    if (!full_name || !username || !email || !password) {
      return res.status(400).json({
        message: "All cashier fields are required.",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    const [existing] = await pool.query(
      `
      SELECT user_id
      FROM users
      WHERE email = ?
         OR username = ?
      LIMIT 1
      `,
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Cashier email or username already exists.",
      });
    }

    const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, rounds);

    const [result] = await pool.query(
      `
      INSERT INTO users (
        full_name,
        username,
        email,
        password_hash,
        role,
        status
      )
      VALUES (?, ?, ?, ?, 'cashier', 'active')
      `,
      [full_name, username, email, passwordHash]
    );

    return res.status(201).json({
      message: "Cashier account created successfully.",
      user_id: result.insertId,
    });
  } catch (error) {
    console.error("ADD CASHIER ERROR:", error);

    return res.status(500).json({
      message: "Failed to create cashier account.",
      error: error.message,
    });
  }
});

app.put("/admin/cashiers/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const cashierId = Number(req.params.id);
    const { full_name, username, email, status, password } = req.body;

    if (!cashierId) {
      return res.status(400).json({
        message: "Invalid cashier ID.",
      });
    }

    if (password && String(password).trim().length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    if (password) {
      const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;
      const passwordHash = await bcrypt.hash(password, rounds);

      await pool.query(
        `
        UPDATE users
        SET
          full_name = ?,
          username = ?,
          email = ?,
          status = ?,
          password_hash = ?
        WHERE user_id = ?
          AND role = 'cashier'
        `,
        [full_name, username, email, status, passwordHash, cashierId]
      );
    } else {
      await pool.query(
        `
        UPDATE users
        SET
          full_name = ?,
          username = ?,
          email = ?,
          status = ?
        WHERE user_id = ?
          AND role = 'cashier'
        `,
        [full_name, username, email, status, cashierId]
      );
    }

    return res.json({
      message: "Cashier account updated successfully.",
    });
  } catch (error) {
    console.error("UPDATE CASHIER ERROR:", error);

    return res.status(500).json({
      message: "Failed to update cashier account.",
      error: error.message,
    });
  }
});

/* ==================================
   ADMIN SALES REPORTS
================================== */

app.get(
  "/admin/reports/sales-summary",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const [dailyRows] = await pool.query(`
        SELECT
          DATE(sale_datetime) AS report_date,
          COUNT(*) AS total_transactions,
          COALESCE(SUM(total_amount), 0) AS total_sales
        FROM sales
        WHERE status = 'completed'
        GROUP BY DATE(sale_datetime)
        ORDER BY report_date DESC
        LIMIT 30
      `);

      const [topProducts] = await pool.query(`
        SELECT
          p.display_name,
          SUM(si.quantity) AS total_qty_sold,
          SUM(si.line_total) AS total_sales
        FROM sale_items si
        INNER JOIN sales s
          ON si.sale_id = s.sale_id
        INNER JOIN products p
          ON si.product_id = p.product_id
        WHERE s.status = 'completed'
        GROUP BY p.product_id, p.display_name
        ORDER BY total_qty_sold DESC
        LIMIT 10
      `);

      return res.json({
        daily_sales: dailyRows.map((row) => ({
          ...row,
          total_transactions: Number(row.total_transactions || 0),
          total_sales: Number(row.total_sales || 0),
        })),
        top_products: topProducts.map((row) => ({
          ...row,
          total_qty_sold: Number(row.total_qty_sold || 0),
          total_sales: Number(row.total_sales || 0),
        })),
      });
    } catch (error) {
      console.error("SALES SUMMARY REPORT ERROR:", error);

      return res.status(500).json({
        message: "Failed to fetch sales summary report.",
        error: error.message,
      });
    }
  }
);

/* ==================================
   ADMIN DEMAND FORECASTING
================================== */

app.get(
  "/admin/forecasting",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT
          p.product_id,
          p.display_name,
          COALESCE(i.stock_qty, 0) AS current_stock,
          COALESCE(i.reorder_level, 0) AS reorder_level,
          COALESCE(SUM(CASE
            WHEN s.sale_datetime >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
            THEN si.quantity
            ELSE 0
          END), 0) AS qty_last_30_days
        FROM products p
        LEFT JOIN inventory i
          ON p.product_id = i.product_id
        LEFT JOIN sale_items si
          ON p.product_id = si.product_id
        LEFT JOIN sales s
          ON si.sale_id = s.sale_id
         AND s.status = 'completed'
        WHERE p.is_active = 1
        GROUP BY
          p.product_id,
          p.display_name,
          i.stock_qty,
          i.reorder_level
        ORDER BY p.display_name ASC
      `);

      const result = rows.map((row) => {
        const qtyLast30Days = Number(row.qty_last_30_days || 0);
        const averageDailySales = qtyLast30Days / 30;
        const suggestedReorderQty = Math.max(
          0,
          Math.ceil(averageDailySales * 14 - Number(row.current_stock || 0))
        );

        return {
          product_id: row.product_id,
          display_name: row.display_name,
          current_stock: Number(row.current_stock || 0),
          reorder_level: Number(row.reorder_level || 0),
          qty_last_30_days: qtyLast30Days,
          average_daily_sales: Number(averageDailySales.toFixed(2)),
          suggested_reorder_qty: suggestedReorderQty,
        };
      });

      return res.json(result);
    } catch (error) {
      console.error("FORECASTING ERROR:", error);

      return res.status(500).json({
        message: "Failed to fetch forecasting data.",
        error: error.message,
      });
    }
  }
);

/* ==================================
   START SERVER
================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});