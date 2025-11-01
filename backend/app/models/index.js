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

// 1. User <-> Role (Many-to-Many)
db.role.belongsToMany(db.user, { through: "user_roles", foreignKey: "roleId" });
db.user.belongsToMany(db.role, { through: "user_roles", foreignKey: "userId" });

// 2. User <-> Plan (One-to-Many)
db.user.belongsTo(db.plan, {
  foreignKey: "planId", 
  targetKey: "id",
  as: 'plan',
  onDelete: "NO ACTION", 
  onUpdate: "CASCADE",
});
db.plan.hasMany(db.user, {
  foreignKey: "planId", 
  sourceKey: "id",
  as: 'users',
  onDelete: "NO ACTION",
  onUpdate: "CASCADE",
});

// 3. File <-> User (File Owner - One-to-Many)
db.user.hasMany(db.file, { 
  foreignKey: 'ownerId', 
  as: 'files' 
});
db.file.belongsTo(db.user, { 
  foreignKey: 'ownerId', 
  as: 'owner' 
});

// 4. Folder <-> User (Folder Owner - One-to-Many)
db.user.hasMany(db.folder, { 
  foreignKey: 'owner_user_id', 
  as: 'ownedFolders' 
});
db.folder.belongsTo(db.user, { 
  foreignKey: 'owner_user_id', 
  as: 'owner' 
});

// 5. Folder <-> Folder (Hierarchical/Self-Reference)
db.folder.belongsTo(db.folder, { 
  foreignKey: 'parent_folder_id', 
  as: 'parent' 
});
db.folder.hasMany(db.folder, { 
  foreignKey: 'parent_folder_id', 
  as: 'children' 
});

// 6. File <-> Folder (One-to-Many - Files belong to a folder)
db.folder.hasMany(db.file, { 
  foreignKey: 'folderId', 
  as: 'files' 
});
db.file.belongsTo(db.folder, { 
  foreignKey: 'folderId', 
  as: 'folder' 
});

// 7. Thumbnail <-> File (One-to-One)
db.file.belongsTo(db.thumbnail, { 
  foreignKey: 'thumbnail_id', 
  as: 'thumbnail' 
}); 
db.thumbnail.belongsTo(db.file, { 
  foreignKey: 'file_id', 
  as: 'file' 
});
db.thumbnail.hasOne(db.file, { 
  foreignKey: 'thumbnail_id', 
  as: 'originalFile' 
});

// 8. Thumbnail <-> Folder (One-to-Many - Thumbnails belong to a folder)
db.folder.hasMany(db.thumbnail, { 
  foreignKey: 'folder_id', 
  as: 'thumbnails' 
});
db.thumbnail.belongsTo(db.folder, { 
  foreignKey: 'folder_id', 
  as: 'folder' 
});

// 8.5. Thumbnail <-> User (Thumbnail Owner - One-to-Many)
db.user.hasMany(db.thumbnail, { 
  foreignKey: 'ownerId', 
  as: 'thumbnails' 
});
db.thumbnail.belongsTo(db.user, { 
  foreignKey: 'ownerId', 
  as: 'owner' 
});

// 9. Group <-> User (Group Owner - One-to-Many)
db.user.hasMany(db.group, { 
  foreignKey: 'ownerId', 
  as: 'ownedGroups' 
});
db.group.belongsTo(db.user, { 
  foreignKey: 'ownerId', 
  as: 'owner' 
});

// 10. Group <-> User (Many-to-Many via GroupMembership)
db.user.belongsToMany(db.group, { 
  through: db.groupMembership, 
  foreignKey: 'userId', 
  as: 'groups' 
});
db.group.belongsToMany(db.user, { 
  through: db.groupMembership, 
  foreignKey: 'groupId', 
  as: 'members' 
});
db.groupMembership.belongsTo(db.user, { 
  foreignKey: 'userId', 
  as: 'member' 
});
db.groupMembership.belongsTo(db.group, { 
  foreignKey: 'groupId', 
  as: 'group' 
});

// 11. FileShare
db.fileShare.belongsTo(db.file, { 
  foreignKey: 'fileId', 
  as: 'file' 
});
db.file.hasMany(db.fileShare, { 
  foreignKey: 'fileId', 
  as: 'shares' 
});

db.fileShare.belongsTo(db.user, { 
  foreignKey: 'sharedWithUserId', 
  as: 'sharedWithUser' 
});
db.user.hasMany(db.fileShare, { 
  foreignKey: 'sharedWithUserId', 
  as: 'receivedShares' 
});

// 12. Audit Log
db.auditLog.belongsTo(db.user, { 
  foreignKey: 'userId', 
  as: 'user' 
});
db.user.hasMany(db.auditLog, { 
  foreignKey: 'userId', 
  as: 'auditLogs' 
});

// 13. Subscriptions
db.subscription.belongsTo(db.user, { 
  foreignKey: 'userId', 
  as: 'user' 
});
db.user.hasMany(db.subscription, { 
  foreignKey: 'userId', 
  as: 'subscriptions' 
});
db.subscription.belongsTo(db.plan, { 
  foreignKey: 'planId', 
  as: 'plan' 
});
db.plan.hasMany(db.subscription, { 
  foreignKey: 'planId', 
  as: 'subscriptions' 
});

export default db;