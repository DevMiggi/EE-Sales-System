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

app.get("/", (req, res) => {
  res.send("E&E Sales API is running");
});

/* =========================
   AUTH
========================= */

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const usernameBase = email.split("@")[0].toLowerCase();

    const [existing] = await pool.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const [existingUsername] = await pool.query(
      "SELECT user_id FROM users WHERE username = ?",
      [usernameBase]
    );

    const username =
      existingUsername.length > 0 ? `${usernameBase}_${Date.now()}` : usernameBase;

    const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, rounds);

    const [result] = await pool.query(
      `INSERT INTO users (full_name, username, email, password_hash, role, status)
       VALUES (?, ?, ?, ?, 'cashier', 'active')`,
      [name, username, email, passwordHash]
    );

    const token = jwt.sign(
      { user_id: result.insertId, email, role: "cashier" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

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
      message: "Server error during registration.",
      error: error.message,
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND status = 'active'",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = rows[0];

    if (!user.password_hash) {
      return res
        .status(401)
        .json({ message: "This account needs password reset." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    await pool.query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?",
      [user.user_id]
    );

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

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
      message: "Server error during login.",
      error: error.message,
    });
  }
});

/* =========================
   PRODUCTS
========================= */

app.get("/products", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.product_id,
        p.display_name,
        pg.group_name,
        COALESCE(i.stock_qty, 0) AS stock_qty,
        COALESCE(pl.price, 0) AS price
      FROM products p
      INNER JOIN product_groups pg
        ON p.group_id = pg.group_id
      LEFT JOIN inventory i
        ON p.product_id = i.product_id
      LEFT JOIN (
        SELECT product_id, MIN(price) AS price
        FROM product_price_levels
        WHERE is_active = 1
        GROUP BY product_id
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

/* =========================
   SUPPLIERS
========================= */

app.get("/suppliers", async (req, res) => {
  try {
    const [supplierRows] = await pool.query(`
      SELECT
        s.supplier_id,
        s.supplier_name,
        s.contact_number
      FROM suppliers s
      ORDER BY s.supplier_name ASC
    `);

    const [supplierProductRows] = await pool.query(`
      SELECT
        sp.supplier_id,
        p.display_name
      FROM supplier_products sp
      INNER JOIN products p
        ON sp.product_id = p.product_id
      WHERE p.is_active = 1
      ORDER BY p.display_name ASC
    `);

    const productMap = {};

    for (const row of supplierProductRows) {
      if (!productMap[row.supplier_id]) {
        productMap[row.supplier_id] = [];
      }
      productMap[row.supplier_id].push(row.display_name);
    }

    const result = supplierRows.map((supplier) => ({
      supplier_id: supplier.supplier_id,
      supplier_name: supplier.supplier_name,
      contact_number: supplier.contact_number || "",
      products: productMap[supplier.supplier_id] || [],
    }));

    return res.json(result);
  } catch (error) {
    console.error("GET SUPPLIERS ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch suppliers.",
      error: error.message,
    });
  }
});

app.post("/suppliers", async (req, res) => {
  try {
    const { supplier_name, contact_number } = req.body;

    if (!supplier_name || !supplier_name.trim()) {
      return res.status(400).json({ message: "Supplier name is required." });
    }

    const [result] = await pool.query(
      `
      INSERT INTO suppliers (supplier_name, contact_number)
      VALUES (?, ?)
      `,
      [supplier_name.trim(), (contact_number || "").trim()]
    );

    return res.status(201).json({
      message: "Supplier added successfully.",
      supplier_id: result.insertId,
    });
  } catch (error) {
    console.error("POST SUPPLIER ERROR:", error);
    return res.status(500).json({
      message: "Failed to add supplier.",
      error: error.message,
    });
  }
});

app.put("/suppliers/:id", async (req, res) => {
  try {
    const supplierId = Number(req.params.id);
    const { supplier_name, contact_number } = req.body;

    if (!supplierId) {
      return res.status(400).json({ message: "Invalid supplier id." });
    }

    if (!supplier_name || !supplier_name.trim()) {
      return res.status(400).json({ message: "Supplier name is required." });
    }

    await pool.query(
      `
      UPDATE suppliers
      SET supplier_name = ?, contact_number = ?
      WHERE supplier_id = ?
      `,
      [supplier_name.trim(), (contact_number || "").trim(), supplierId]
    );

    return res.json({
      message: "Supplier updated successfully.",
    });
  } catch (error) {
    console.error("PUT SUPPLIER ERROR:", error);
    return res.status(500).json({
      message: "Failed to update supplier.",
      error: error.message,
    });
  }
});

/* =========================
   TRANSACTIONS
========================= */

app.get("/transactions", async (req, res) => {
  try {
    const [salesRows] = await pool.query(`
      SELECT
        sale_id,
        receipt_number,
        sale_datetime,
        total_amount,
        amount_paid,
        change_amount,
        status
      FROM sales
      ORDER BY sale_datetime DESC
      LIMIT 100
    `);

    if (!salesRows || salesRows.length === 0) {
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
      customer_name: "Guest",
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
/* =========================
   SALES
========================= */

app.post("/sales", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { items, amount_paid } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      connection.release();
      return res.status(400).json({ message: "No sale items provided." });
    }

    const paid = Number(amount_paid || 0);

    await connection.beginTransaction();

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const { product_id, quantity } = item;

      if (!product_id || !quantity || quantity <= 0) {
        throw new Error("Invalid product or quantity.");
      }

      const [productRows] = await connection.query(
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
        ORDER BY ppl.price ASC
        LIMIT 1
        `,
        [product_id]
      );

      if (productRows.length === 0) {
        throw new Error(`Product not found: ${product_id}`);
      }

      const product = productRows[0];

      if (Number(product.stock_qty) < Number(quantity)) {
        throw new Error(`Insufficient stock for ${product.display_name}`);
      }

      const unitPrice = Number(product.price || 0);
      const lineTotal = unitPrice * Number(quantity);

      subtotal += lineTotal;

      validatedItems.push({
        product_id: product.product_id,
        price_level_id: product.price_level_id || null,
        quantity: Number(quantity),
        unit_price: unitPrice,
        line_total: lineTotal,
      });
    }

    const totalAmount = subtotal;

    if (paid < totalAmount) {
      throw new Error("Amount paid is not enough.");
    }

    const changeAmount = paid - totalAmount;
    const receiptNumber = `RCPT-${Date.now()}`;
    const cashierId = 1;

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
      ) VALUES (?, ?, ?, 0, ?, 'cash', ?, ?, 'completed')
      `,
      [receiptNumber, cashierId, subtotal, totalAmount, paid, changeAmount]
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
        ) VALUES (?, ?, ?, ?, ?, ?)
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

      await connection.query(
        `
        INSERT INTO stock_movements (
          product_id,
          movement_type,
          quantity,
          reference_id,
          reference_type,
          remarks,
          created_by
        ) VALUES (?, 'sale', ?, ?, 'sale', ?, ?)
        `,
        [
          item.product_id,
          item.quantity,
          saleId,
          `Sale receipt ${receiptNumber}`,
          cashierId,
        ]
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
      message: error.message || "Failed to complete sale.",
      error: error.message,
    });
  }
});

/* =========================
   INVENTORY ADJUST
========================= */

app.post("/inventory/adjust", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { product_id, quantity, type, remarks, user_id } = req.body;

    if (!product_id || quantity === undefined || !type) {
      connection.release();
      return res.status(400).json({ message: "Missing required fields." });
    }

    const qty = Number(quantity);

    if (Number.isNaN(qty) || qty <= 0) {
      connection.release();
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0." });
    }

    if (!["stock_in", "adjustment", "damaged"].includes(type)) {
      connection.release();
      return res.status(400).json({ message: "Invalid adjustment type." });
    }

    await connection.beginTransaction();

    const [inventoryRows] = await connection.query(
      `SELECT stock_qty FROM inventory WHERE product_id = ? LIMIT 1`,
      [product_id]
    );

    if (inventoryRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res
        .status(404)
        .json({ message: "Inventory record not found for this product." });
    }

    const currentStock = Number(inventoryRows[0].stock_qty || 0);

    if (type === "stock_in" || type === "adjustment") {
      await connection.query(
        `UPDATE inventory SET stock_qty = stock_qty + ? WHERE product_id = ?`,
        [qty, product_id]
      );
    } else if (type === "damaged") {
      if (qty > currentStock) {
        await connection.rollback();
        connection.release();
        return res
          .status(400)
          .json({ message: "Cannot subtract more than current stock." });
      }

      await connection.query(
        `UPDATE inventory SET stock_qty = stock_qty - ? WHERE product_id = ?`,
        [qty, product_id]
      );
    }

    await connection.query(
      `
      INSERT INTO stock_movements (
        product_id,
        movement_type,
        quantity,
        reference_id,
        reference_type,
        remarks,
        created_by
      ) VALUES (?, ?, ?, NULL, 'manual_adjustment', ?, ?)
      `,
      [product_id, type, qty, remarks || null, user_id || 1]
    );

    await connection.commit();
    connection.release();

    return res.json({ message: "Inventory updated successfully." });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("INVENTORY ADJUST ERROR:", error);
    return res.status(500).json({
      message: "Failed to adjust inventory.",
      error: error.message,
    });
  }
});

/* =========================
   LOW STOCK
========================= */

app.get("/low-stock", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.product_id,
        p.display_name,
        pg.group_name,
        i.stock_qty,
        i.reorder_level
      FROM inventory i
      INNER JOIN products p
        ON i.product_id = p.product_id
      INNER JOIN product_groups pg
        ON p.group_id = pg.group_id
      WHERE i.stock_qty <= i.reorder_level
      ORDER BY i.stock_qty ASC, p.display_name ASC
    `);

    return res.json(rows);
  } catch (error) {
    console.error("LOW STOCK ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch low stock items.",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});