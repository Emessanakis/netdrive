// backend/controllers/auth/permanentDelete.controller.js
import fs from "fs";
import path from "path";
import db from "../../models/index.js";

const { file: File, thumbnail: Thumbnail, folder: Folder } = db;
const uploadBaseDir = path.join(process.cwd(), "uploads");

/**
 * Controller to permanently delete a file and its thumbnail
 * Removes from file system and database
 */
const permanentDelete = async (req, res) => {
  try {
    const fileId = req.params.id;

    // 1. Find the file with its folder and thumbnail information
    const fileRecord = await File.findOne({
      where: { 
        id: fileId, 
        ownerId: req.user.id,
        is_deleted: true // Only allow permanent deletion of soft-deleted files
      },
      include: [
        { 
          model: Folder, 
          as: 'folder', 
          attributes: ['folder_type'],
          foreignKey: 'folderId',
        },
        {
          model: Thumbnail,
          as: 'thumbnail',
          attributes: ['id', 'storage_filename', 'folder_id'],
          required: false
        }
      ]
    });

    if (!fileRecord) {
      return res.status(404).json({ 
        message: "File not found, already permanently deleted, or not owned by you." 
      });
    }

    // 2. Construct file paths
    const folderName = fileRecord.folder?.folder_type || 'unknown';
    const filePath = path.join(
      uploadBaseDir, 
      req.user.username, 
      folderName, 
      fileRecord.storage_filename
    );

    let thumbnailPath = null;
    if (fileRecord.thumbnail) {
      const thumbnailFolderName = fileRecord.thumbnail.folder_id ? 'thumbnails' : 'unknown';
      thumbnailPath = path.join(
        uploadBaseDir,
        req.user.username,
        thumbnailFolderName,
        fileRecord.thumbnail.storage_filename
      );
    }

    // 3. Delete files from file system
    const deletionPromises = [];

    // Delete main file
    if (fs.existsSync(filePath)) {
      deletionPromises.push(
        fs.promises.unlink(filePath).catch(err => {
          console.warn(`Failed to delete file from storage: ${filePath}`, err);
          // Continue with database deletion even if file system deletion fails
        })
      );
    }

    // Delete thumbnail file if exists
    if (thumbnailPath && fs.existsSync(thumbnailPath)) {
      deletionPromises.push(
        fs.promises.unlink(thumbnailPath).catch(err => {
          console.warn(`Failed to delete thumbnail from storage: ${thumbnailPath}`, err);
          // Continue with database deletion even if file system deletion fails
        })
      );
    }

    // 4. Wait for all file system deletions to complete
    await Promise.allSettled(deletionPromises);

    // 5. Delete from database in transaction to ensure data consistency
    const transaction = await db.sequelize.transaction();

    try {
      // Delete thumbnail record if exists
      if (fileRecord.thumbnail) {
        await Thumbnail.destroy({
          where: { id: fileRecord.thumbnail.id },
          transaction
        });
      }

      // Delete file record
      await File.destroy({
        where: { id: fileId },
        transaction
      });

      // Commit transaction
      await transaction.commit();

      // 6. Update user storage usage (subtract the deleted file size)
      const newStorageUsed = Math.max(0, req.user.storage_used_bytes - fileRecord.size_bytes);
      
      await db.user.update(
        { storage_used_bytes: newStorageUsed },
        { where: { id: req.user.id } }
      );

      res.json({
        message: "File permanently deleted successfully",
        deletedFile: {
          id: fileRecord.id,
          name: fileRecord.original_filename,
          size: fileRecord.size_bytes,
          storageFreed: fileRecord.size_bytes
        }
      });

    } catch (dbError) {
      await transaction.rollback();
      throw dbError;
    }

  } catch (err) {
    console.error("Error during permanent deletion:", err);
    
    if (err.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ 
        message: "Database error during deletion." 
      });
    }

    res.status(500).json({ 
      message: "Failed to permanently delete file.",
      error: err.message 
    });
  }
};

/**
 * Controller to permanently delete multiple files in batch
 */
const permanentDeleteMultiple = async (req, res) => {
  try {
    const { fileIds } = req.body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ 
        message: "File IDs array is required." 
      });
    }

    // 1. Find all files with their folder and thumbnail information
    const fileRecords = await File.findAll({
      where: { 
        id: fileIds, 
        ownerId: req.user.id,
        is_deleted: true // Only allow permanent deletion of soft-deleted files
      },
      include: [
        { 
          model: Folder, 
          as: 'folder', 
          attributes: ['folder_type'],
          foreignKey: 'folderId',
        },
        {
          model: Thumbnail,
          as: 'thumbnail',
          attributes: ['id', 'storage_filename', 'folder_id'],
          required: false
        }
      ]
    });

    if (fileRecords.length === 0) {
      return res.status(404).json({ 
        message: "No files found for permanent deletion." 
      });
    }

    const foundFileIds = fileRecords.map(f => f.id);
    const notFoundIds = fileIds.filter(id => !foundFileIds.includes(id));

    // 2. Delete files from file system
    const fileSystemDeletions = [];
    let totalFreedStorage = 0;

    for (const fileRecord of fileRecords) {
      const folderName = fileRecord.folder?.folder_type || 'unknown';
      const filePath = path.join(
        uploadBaseDir, 
        req.user.username, 
        folderName, 
        fileRecord.storage_filename
      );

      // Delete main file
      if (fs.existsSync(filePath)) {
        fileSystemDeletions.push(
          fs.promises.unlink(filePath).catch(err => {
            console.warn(`Failed to delete file from storage: ${filePath}`, err);
          })
        );
      }

      // Delete thumbnail if exists
      if (fileRecord.thumbnail) {
        const thumbnailFolderName = fileRecord.thumbnail.folder_id ? 'thumbnails' : 'unknown';
        const thumbnailPath = path.join(
          uploadBaseDir,
          req.user.username,
          thumbnailFolderName,
          fileRecord.thumbnail.storage_filename
        );

        if (fs.existsSync(thumbnailPath)) {
          fileSystemDeletions.push(
            fs.promises.unlink(thumbnailPath).catch(err => {
              console.warn(`Failed to delete thumbnail from storage: ${thumbnailPath}`, err);
            })
          );
        }
      }

      totalFreedStorage += fileRecord.size_bytes;
    }

    // Wait for all file system deletions to complete
    await Promise.allSettled(fileSystemDeletions);

    // 3. Delete from database in transaction
    const transaction = await db.sequelize.transaction();

    try {
      // Get thumbnail IDs to delete
      const thumbnailIds = fileRecords
        .map(f => f.thumbnail?.id)
        .filter(id => id !== undefined);

      // Delete thumbnails
      if (thumbnailIds.length > 0) {
        await Thumbnail.destroy({
          where: { id: thumbnailIds },
          transaction
        });
      }

      // Delete files
      await File.destroy({
        where: { id: foundFileIds },
        transaction
      });

      await transaction.commit();

      // 4. Update user storage usage
      const newStorageUsed = Math.max(0, req.user.storage_used_bytes - totalFreedStorage);
      
      await db.user.update(
        { storage_used_bytes: newStorageUsed },
        { where: { id: req.user.id } }
      );

      res.json({
        message: `${fileRecords.length} files permanently deleted successfully`,
        deletedCount: fileRecords.length,
        storageFreed: totalFreedStorage,
        notFoundIds: notFoundIds.length > 0 ? notFoundIds : undefined
      });

    } catch (dbError) {
      await transaction.rollback();
      throw dbError;
    }

  } catch (err) {
    console.error("Error during batch permanent deletion:", err);
    
    res.status(500).json({ 
      message: "Failed to permanently delete files.",
      error: err.message 
    });
  }
};

export default {
  permanentDelete,
  permanentDeleteMultiple
};