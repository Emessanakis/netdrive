# Database Models Structure

This document explains the organization of database models and their associations in the NetDrive application.

## 📁 File Organization

### **Individual Model Files**
Each model is defined in its own file with clear responsibilities:

```
models/
├── user.model.js           # User entity definition
├── role.model.js           # Role entity definition  
├── plan.model.js           # Subscription plan definition
├── files.model.js          # File entity definition
├── folder.model.js         # Folder entity definition
├── thumbnail.model.js      # Thumbnail entity definition
├── group.model.js          # Group entity definition
├── groupMembership.model.js # Group membership junction table
├── fileShare.model.js      # File sharing entity
├── auditLog.model.js       # Audit logging entity
├── subscription.model.js   # User subscription entity
├── associations.js         # 🆕 All model relationships
└── index.js               # 🔄 Sequelize setup & model registration
```

## 🔗 Associations Structure

### **Separated Concerns**
- **Model Files**: Define table structure, validations, hooks, and methods
- **associations.js**: Define all relationships between models
- **index.js**: Bootstrap Sequelize and register models

### **Association Categories**

#### **1. User & Authentication**
- User ↔ Role (Many-to-Many via user_roles)
- User ↔ Plan (Many-to-One)

#### **2. File System Structure**  
- User ↔ File (One-to-Many - ownership)
- User ↔ Folder (One-to-Many - ownership)
- Folder ↔ Folder (Self-reference - hierarchy)
- File ↔ Folder (Many-to-One - organization)

#### **3. Media & Thumbnails**
- File ↔ Thumbnail (One-to-One)
- Folder ↔ Thumbnail (One-to-Many)
- User ↔ Thumbnail (One-to-Many - ownership)

#### **4. Groups & Sharing**
- User ↔ Group (One-to-Many - ownership)
- User ↔ Group (Many-to-Many - membership via GroupMembership)
- File ↔ FileShare (One-to-Many)
- User ↔ FileShare (One-to-Many - received shares)

#### **5. Subscriptions & Audit**
- User ↔ Subscription (One-to-Many)
- Plan ↔ Subscription (One-to-Many)
- User ↔ AuditLog (One-to-Many)

## 🎯 Benefits of This Structure

### **✅ Clarity**
- Model definitions focus purely on entity structure
- Associations are centralized and clearly documented
- Easy to understand relationships at a glance

### **✅ Maintainability**
- Changes to relationships are made in one place
- No scattered association definitions across files
- Clear separation of concerns

### **✅ Discoverability**
- New developers can find all relationships in associations.js
- Model files remain focused and readable
- Relationship categories are clearly organized

### **✅ Debugging**
- Easier to troubleshoot relationship issues
- Clear mapping of foreign keys and aliases
- Organized by functional domains

## 🚀 Usage

The models are imported and used exactly the same way:

```javascript
import db from "./models/index.js";

// Models are available as before
const { user: User, file: File, folder: Folder } = db;

// All associations are automatically configured
const userWithFiles = await User.findByPk(userId, {
  include: ['files', 'folders', 'plan']
});
```

## 📝 Model Definition Guidelines

### **Individual Model Files Should Contain:**
- ✅ Table schema and field definitions
- ✅ Validation rules
- ✅ Hooks (beforeCreate, beforeUpdate, etc.)
- ✅ Instance methods
- ✅ Static methods
- ❌ **NO** associations (moved to associations.js)

### **associations.js Should Contain:**
- ✅ All belongsTo/hasMany/belongsToMany relationships
- ✅ Through table definitions for many-to-many
- ✅ Foreign key specifications
- ✅ Relationship aliases (as: 'alias')
- ✅ Cascade and constraint options

This structure provides a clean, maintainable, and scalable approach to managing database models and their relationships.