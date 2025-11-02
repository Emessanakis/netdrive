// backend/models/associations.js
// This file defines all the relationships between Sequelize models

const defineAssociations = (db) => {
  // -------------------- User & Role Associations --------------------
  
  // 1. User <-> Role (Many-to-Many)
  db.role.belongsToMany(db.user, { 
    through: "user_roles", 
    foreignKey: "roleId" 
  });
  db.user.belongsToMany(db.role, { 
    through: "user_roles", 
    foreignKey: "userId" 
  });

  // -------------------- User & Plan Associations --------------------
  
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

  // -------------------- File & User Associations --------------------
  
  // 3. File <-> User (File Owner - One-to-Many)
  db.user.hasMany(db.file, { 
    foreignKey: 'ownerId', 
    as: 'files' 
  });
  db.file.belongsTo(db.user, { 
    foreignKey: 'ownerId', 
    as: 'owner' 
  });

  // -------------------- Folder & User Associations --------------------
  
  // 4. Folder <-> User (Folder Owner - One-to-Many)
  db.user.hasMany(db.folder, { 
    foreignKey: 'owner_user_id', 
    as: 'ownedFolders' 
  });
  db.folder.belongsTo(db.user, { 
    foreignKey: 'owner_user_id', 
    as: 'owner' 
  });

  // -------------------- Folder Hierarchical Associations --------------------
  
  // 5. Folder <-> Folder (Hierarchical/Self-Reference)
  db.folder.belongsTo(db.folder, { 
    foreignKey: 'parent_folder_id', 
    as: 'parent' 
  });
  db.folder.hasMany(db.folder, { 
    foreignKey: 'parent_folder_id', 
    as: 'children' 
  });

  // -------------------- File & Folder Associations --------------------
  
  // 6. File <-> Folder (One-to-Many - Files belong to a folder)
  db.folder.hasMany(db.file, { 
    foreignKey: 'folderId', 
    as: 'files' 
  });
  db.file.belongsTo(db.folder, { 
    foreignKey: 'folderId', 
    as: 'folder' 
  });

  // -------------------- Thumbnail Associations --------------------
  
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

  // -------------------- Group Associations --------------------
  
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

  // -------------------- File Share Associations --------------------
  
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

  // -------------------- Audit Log Associations --------------------
  
  // 12. Audit Log
  db.auditLog.belongsTo(db.user, { 
    foreignKey: 'userId', 
    as: 'user' 
  });
  db.user.hasMany(db.auditLog, { 
    foreignKey: 'userId', 
    as: 'auditLogs' 
  });

  // -------------------- Subscription Associations --------------------
  
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
};

export default defineAssociations;