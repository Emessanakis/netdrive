// backend/models/index.js

import config from "../config/db.config.js";
import { Sequelize } from "sequelize";

import userModel from "./user.model.js";
import roleModel from "./role.model.js";
import planModel from "./plan.model.js";
import fileModel from "./files.model.js";
import folderModel from "./folder.model.js";
import groupModel from "./group.model.js";
import groupMembershipModel from "./groupMembership.model.js";
import fileShareModel from "./fileShare.model.js";
import auditLogModel from "./auditLog.model.js";
import subscriptionModel from "./subscription.model.js";
import thumbnailModel from "./thumbnail.model.js";
import defineAssociations from "./associations.js";

const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    port: config.port,
    dialect: config.dialect,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load Models
db.user = userModel(sequelize, Sequelize);
db.role = roleModel(sequelize, Sequelize);
db.plan = planModel(sequelize, Sequelize);
db.file = fileModel(sequelize, Sequelize);
db.folder = folderModel(sequelize, Sequelize);
db.group = groupModel(sequelize, Sequelize);
db.groupMembership = groupMembershipModel(sequelize, Sequelize);
db.fileShare = fileShareModel(sequelize, Sequelize);
db.auditLog = auditLogModel(sequelize, Sequelize);
db.subscription = subscriptionModel(sequelize, Sequelize);
db.thumbnail = thumbnailModel(sequelize, Sequelize);

// -------------------- Associations --------------------
// Define all model associations
defineAssociations(db);

export default db;