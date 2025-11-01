import jwt from "jsonwebtoken";
import config from "../config/auth.config.js";
import db from "../models/index.js";

const { file: File } = db;

/**
 * Prepares a standard user response including JWT, roles, and plan usage
 * @param {Object} user - Sequelize User instance with optional plan included
 * @returns {Object} { token, authorities, planDetails }
 */
export async function prepareUserResponse(user) {
  const roles = await user.getRoles();
  const authorities = roles.map(r => "ROLE_" + r.name.toUpperCase());

  const currentUsageBytes =
    (await File.sum("size_bytes", { where: { ownerId: user.id } })) || 0;

  const planDetails = user.plan
    ? {
        id: user.plan.id,
        name: user.plan.name,
        storageLimitBytes: user.plan.storage_limit_bytes,
      }
    : null;

  const token = jwt.sign({ id: user.id, role: authorities[0] }, config.secret, {
    algorithm: "HS256",
    expiresIn: 86400,
  });

  return { token, authorities, planDetails };
}
