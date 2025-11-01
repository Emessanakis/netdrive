import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import helmet from 'helmet';
import path from 'path';
import db from './app/models/index.js';
import authRoutes from './app/routes/auth.routes.js';
// import userRoutes from './app/routes/user.routes.js';

const app = express();

// Tell Express to trust the X-Forwarded-* headers from Nginx
// This is necessary for secure cookies to be set correctly behind a proxy.
app.set('trust proxy', 1); 

// -------------------- CORS --------------------
// The allowedOrigins now correctly includes both emessanakis.gr and www.emessanakis.gr
const allowedOrigins = process.env.CORS_ORIGINS.split(',');

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow requests with no origin (mobile apps/curl)

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.options('*', cors({ 
    credentials: true,
    origin: allowedOrigins, 
})); 

// -------------------- Security --------------------
app.use(helmet({
  // CRITICAL FIX for Google OAuth: Allow pop-ups to communicate back
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false,
  // FIX: Allow images/files to be loaded from a different origin (your client app)
  crossOriginResourcePolicy: { policy: 'cross-origin' }, 
}));

// -------------------- Body parser --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- Cookie Session --------------------
// sameSite changed to "none" for cross-site cookie setting 
// (required for Google OAuth when client and server origins differ).
app.use(cookieSession({
  name: 'app-secure-data',
  keys: [process.env.COOKIE_SECRET],
  httpOnly: true,
  sameSite: "none", // <-- CHANGED
  secure: true, // required when sameSite is "none"
  path: "/",
  domain: '.emessanakis.gr',
}));

// -------------------- STATIC FILES --------------------
const __dirname = path.resolve();
// CRITICAL FIX: Serve files from the 'uploads' directory under the '/uploads' URL prefix.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -------------------- Database --------------------
const Role = db.role;
const Plan = db.plan; 

//  Run sync, then seed plans, then seed roles
db.sequelize.sync({ force: false })
  .then(async () => {
    // 1. Seed Plan ID 1 before users table alter checks the FK
    await initialPlans(); 
    // 2. Seed Roles
    await initialRoles(); 
  })
  .catch(err => console.error("Error syncing database:", err));

// -------------------- Routes --------------------
authRoutes(app);
// userRoutes(app);

// -------------------- Test route --------------------
// app.get("/api", (req, res) => res.json({ message: "Hello" }));

async function initialRoles() {
  const count = await Role.count();
  if (count === 0) {
    await Role.bulkCreate([
      { id: 1, name: "user" },
      { id: 2, name: "admin" },
      { id: 3, name: "moderator" },
    ]);
    console.log("Roles seeded");
  }
}

async function initialPlans() {
  const count = await Plan.count();
  if (count === 0) {
    await Plan.bulkCreate([
      { id: 1, name: "Free Tier", storage_limit_bytes: 1073741824, max_group_members: 1, price_per_month_usd: 0.00, description: "Standard user access with basic storage limits." },
      { id: 2, name: "Pro Tier", storage_limit_bytes: 107374182400, max_group_members: 1, price_per_month_usd: 9.99, description: "Premium subscription access suitable for professionals." },
      { id: 3, name: "Family Tier", storage_limit_bytes: 536870912000, max_group_members: 5, price_per_month_usd: 19.99, description: "Shared file storage and features for up to 5 family members." },
      { id: 4, name: "Business Tier", storage_limit_bytes: 1099511627776, max_group_members: 10, price_per_month_usd: 49.99, description: "Advanced features and substantially increased storage for small teams." },
    ]);
    console.log("Plans seeded");
  }
}

// -------------------- Start server --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
