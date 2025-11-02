import db from "../../../models/index.js";

/**
 * Calculates detailed storage usage statistics for the authenticated user.
 * Uses raw SQL queries to avoid ambiguous column references.
 * NOTE: Storage calculations include BOTH active and deleted files since 
 * deleted files still consume storage until permanently removed.
 */
const getStorageStats = async (req, res) => {
  const userId = req.userId;
  const user = req.user; 

  if (!userId || !user) {
    return res.status(401).json({ status: "Error", message: "Unauthorized or User data missing." });
  }

  try {
    // 1. Get user's plan details to get storage limit
    const userPlanResult = await db.sequelize.query(
      `SELECT plans.storage_limit_bytes, plans.name as plan_name
       FROM users
       INNER JOIN plans ON users."planId" = plans.id
       WHERE users.id = $1`,
      {
        bind: [userId],
        type: db.sequelize.QueryTypes.SELECT,
        plain: true
      }
    );

    if (!userPlanResult) {
      return res.status(404).json({ status: "Error", message: "User plan not found." });
    }

    const storageLimitBytes = Number(userPlanResult.storage_limit_bytes);
    const planName = userPlanResult.plan_name;

    // 2. Get TOTAL size including files + thumbnails (including deleted files since they consume storage)
    const totalSizeResult = await db.sequelize.query(
      `SELECT SUM(files.size_bytes + COALESCE(thumbnails.size_bytes, 0)) AS total_size
       FROM files
       LEFT JOIN thumbnails ON thumbnails.file_id = files.id
       WHERE files.is_hidden = FALSE
         AND files."ownerId" = $1`,
      {
        bind: [userId],
        type: db.sequelize.QueryTypes.SELECT,
        plain: true
      }
    );

    // 3. Get TOTAL file size only (excluding thumbnails, including deleted files)
    const filesOnlySizeResult = await db.sequelize.query(
      `SELECT SUM(files.size_bytes) AS files_size
       FROM files
       WHERE files.is_hidden = FALSE
         AND files."ownerId" = $1`,
      {
        bind: [userId],
        type: db.sequelize.QueryTypes.SELECT,
        plain: true
      }
    );

    // 4. Get thumbnail-only total size (including for deleted files)
    const thumbnailsOnlySizeResult = await db.sequelize.query(
      `SELECT SUM(thumbnails.size_bytes) AS thumbnails_size
       FROM thumbnails
       INNER JOIN files ON thumbnails.file_id = files.id
       WHERE files.is_hidden = FALSE
         AND thumbnails."ownerId" = $1`,
      {
        bind: [userId],
        type: db.sequelize.QueryTypes.SELECT,
        plain: true
      }
    );

    // 5. Get size and count for IMAGES (including deleted files)
    const imagesSizeResult = await db.sequelize.query(
      `SELECT SUM(files.size_bytes + COALESCE(thumbnails.size_bytes, 0)) AS category_size
       FROM files
       LEFT JOIN thumbnails ON thumbnails.file_id = files.id
       WHERE files.is_hidden = FALSE
         AND files."ownerId" = $1
         AND files.file_type = 'image'`,
      {
        bind: [userId],
        type: db.sequelize.QueryTypes.SELECT,
        plain: true
      }
    );

    const imagesCountResult = await db.sequelize.query(
      `SELECT COUNT(files.id) AS file_count
       FROM files
       WHERE files.is_hidden = FALSE
         AND files."ownerId" = $1
         AND files.file_type = 'image'`,
      {
        bind: [userId],
        type: db.sequelize.QueryTypes.SELECT,
        plain: true
      }
    );

    // 6. Get size and count for VIDEOS (including deleted files)
    const videosSizeResult = await db.sequelize.query(
      `SELECT SUM(files.size_bytes + COALESCE(thumbnails.size_bytes, 0)) AS category_size
       FROM files
       LEFT JOIN thumbnails ON thumbnails.file_id = files.id
       WHERE files.is_hidden = FALSE
         AND files."ownerId" = $1
         AND files.file_type = 'video'`,
      {
        bind: [userId],
        type: db.sequelize.QueryTypes.SELECT,
        plain: true
      }
    );

    const videosCountResult = await db.sequelize.query(
      `SELECT COUNT(files.id) AS file_count
       FROM files
       WHERE files.is_hidden = FALSE
         AND files."ownerId" = $1
         AND files.file_type = 'video'`,
      {
        bind: [userId],
        type: db.sequelize.QueryTypes.SELECT,
        plain: true
      }
    );

    // 7. Get size and count for DOCUMENTS (including deleted files)
    const documentsSizeResult = await db.sequelize.query(
      `SELECT SUM(files.size_bytes + COALESCE(thumbnails.size_bytes, 0)) AS category_size
       FROM files
       LEFT JOIN thumbnails ON thumbnails.file_id = files.id
       WHERE files.is_hidden = FALSE
         AND files."ownerId" = $1
         AND files.file_type = 'document'`,
      {
        bind: [userId],
        type: db.sequelize.QueryTypes.SELECT,
        plain: true
      }
    );

    const documentsCountResult = await db.sequelize.query(
      `SELECT COUNT(files.id) AS file_count
       FROM files
       WHERE files.is_hidden = FALSE
         AND files."ownerId" = $1
         AND files.file_type = 'document'`,
      {
        bind: [userId],
        type: db.sequelize.QueryTypes.SELECT,
        plain: true
      }
    );

    // 8. Get size and count for OTHERS (including deleted files)
    const othersSizeResult = await db.sequelize.query(
      `SELECT SUM(files.size_bytes + COALESCE(thumbnails.size_bytes, 0)) AS category_size
       FROM files
       LEFT JOIN thumbnails ON thumbnails.file_id = files.id
       WHERE files.is_hidden = FALSE
         AND files."ownerId" = $1
         AND files.file_type = 'other'`,
      {
        bind: [userId],
        type: db.sequelize.QueryTypes.SELECT,
        plain: true
      }
    );

    const othersCountResult = await db.sequelize.query(
      `SELECT COUNT(files.id) AS file_count
       FROM files
       WHERE files.is_hidden = FALSE
         AND files."ownerId" = $1
         AND files.file_type = 'other'`,
      {
        bind: [userId],
        type: db.sequelize.QueryTypes.SELECT,
        plain: true
      }
    );

    // Calculate all the values
    const totalSize = Number(totalSizeResult?.total_size) || 0;
    const filesOnlySize = Number(filesOnlySizeResult?.files_size) || 0;
    const thumbnailsOnlySize = Number(thumbnailsOnlySizeResult?.thumbnails_size) || 0;

    const imagesSize = Number(imagesSizeResult?.category_size) || 0;
    const imagesCount = Number(imagesCountResult?.file_count) || 0;
    
    const videosSize = Number(videosSizeResult?.category_size) || 0;
    const videosCount = Number(videosCountResult?.file_count) || 0;
    
    const documentsSize = Number(documentsSizeResult?.category_size) || 0;
    const documentsCount = Number(documentsCountResult?.file_count) || 0;
    
    const othersSize = Number(othersSizeResult?.category_size) || 0;
    const othersCount = Number(othersCountResult?.file_count) || 0;

    const totalFilesCount = imagesCount + videosCount + documentsCount + othersCount;

    // Calculate remaining space
    const remainingSpaceBytes = Math.max(0, storageLimitBytes - totalSize);
    const usagePercentage = storageLimitBytes > 0 ? (totalSize / storageLimitBytes) * 100 : 0;

    // Prepare chart data (combining documents + others)
    const chartData = {
      documents: documentsSize + othersSize,
      images: imagesSize,
      videos: videosSize,
      freeSpace: remainingSpaceBytes,
      totalSpace: storageLimitBytes,
    };

    const finalResponse = {
      // Total sizes
      totalSizeBytes: totalSize,
      filesOnlySizeBytes: filesOnlySize,
      thumbnailsOnlySizeBytes: thumbnailsOnlySize,
      currentUsageBytes: totalSize,
      
      // Storage limits and remaining space
      storageLimitBytes: storageLimitBytes,
      remainingSpaceBytes: remainingSpaceBytes,
      usagePercentage: Math.round(usagePercentage * 100) / 100, // Rounded to 2 decimal places
      planName: planName,
      
      // File counts per category
      photos_counter: imagesCount,
      videos_counter: videosCount,
      documents_counter: documentsCount,
      others_counter: othersCount,
      files_counter: totalFilesCount,
      
      // Chart data (for the donut chart) - now includes freeSpace and totalSpace
      chartData: chartData,
    };

    console.log('Storage stats fetched successfully for user:', userId);
    console.log('Usage:', totalSize, '/', storageLimitBytes, 'bytes (', usagePercentage.toFixed(2), '%)');
    
    return res.status(200).json({ status: "Success", data: finalResponse });

  } catch (error) {
    console.error("Error fetching storage stats:", error);
    return res.status(500).json({ 
      status: "Error", 
      message: "Internal server error while fetching storage statistics." 
    });
  }
};

export default getStorageStats;