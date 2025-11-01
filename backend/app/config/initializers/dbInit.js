import db from '../../models/index.js'; // CORRECTED PATH: Should resolve the ERR_MODULE_NOT_FOUND

const Role = db.role;
const Plan = db.plan;

/**
 * Ensures the 'roles' table is populated with default entries.
 */
export async function initialRoles() {
  try {
    // You should use the Role model directly from db
    await Role.bulkCreate([
      { id: 1, name: "user" },
      { id: 2, name: "moderator" },
      { id: 3, name: "admin" },
    ], 
    { 
      ignoreDuplicates: true,
      updateOnDuplicate: ["name"] 
    });
    console.log("Roles initialized successfully.");
  } catch (err) {
    console.error("Error during role initialization:", err);
  }
}

/**
 * Ensures the 'plans' table is populated with default entries.
 * This MUST run before the 'users' table is altered/created due to the FK constraint.
 */
export async function initialPlans() {
  try {
    await Plan.bulkCreate([
      { 
        id: 1, 
        name: "Basic", 
        storage_limit_bytes: 10737418240, // 10 GB (10 * 1024^3 bytes)
        max_group_members: 1, 
        price_per_month_usd: 0.00 
      },
      { 
        id: 2, 
        name: "Pro", 
        storage_limit_bytes: 1099511627776, // 1 TB (1 * 1024^4 bytes)
        max_group_members: 5, 
        price_per_month_usd: 9.99
      },
      { 
        id: 3, 
        name: "Family", 
        storage_limit_bytes: 5497558138880, // 5 TB
        max_group_members: 10, 
        price_per_month_usd: 19.99
      },
    ], 
    { 
      ignoreDuplicates: true,
      updateOnDuplicate: ["name", "storage_limit_bytes", "max_group_members", "price_per_month_usd"] 
    });
    console.log("Plans initialized successfully.");
  } catch (err) {
    console.error("Error during plan initialization:", err);
  }
}
