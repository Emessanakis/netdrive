import fs from "fs/promises";
import path from "path";
import db from "../models/index.js";
import { v4 as uuidv4 } from "uuid";

export const initDefaultUserFolders = async (userId, username) => {
  const FolderModel = db.folder;
  const defaultFolders = ["photos", "videos", "thumbnails", "files"];
  const folderDisplayNames = {
    photos: "My Photos",
    videos: "My Videos",
    thumbnails: "My Thumbnails",
    files: "My Files"
  };
  const STORAGE_DIR = process.env.LOCAL_STORAGE_DIR || path.join(process.cwd(), "uploads");

  const userRootDir = path.join(STORAGE_DIR, username);
  await fs.mkdir(userRootDir, { recursive: true });

  const folderRecords = [];

  for (const folderType of defaultFolders) {
    const folderPath = path.join(userRootDir, folderType);
    await fs.mkdir(folderPath, { recursive: true });

    const folderRecord = await FolderModel.create({
      id: uuidv4(),
      name: folderDisplayNames[folderType],
      owner_user_id: userId,
      parent_folder_id: null,
      folder_type: folderType,
    });

    folderRecords.push(folderRecord);
  }

  return folderRecords;
};
