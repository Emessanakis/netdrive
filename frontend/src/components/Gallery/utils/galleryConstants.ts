// src/components/MediaGallery/utils/constants.ts
export const FILES_PER_PAGE = 18;
export const API_URL = import.meta.env.VITE_API_URL || '';

export const MIRROR_BUTTON_STYLE = {
  bgcolor: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(5px)',
  WebkitBackdropFilter: 'blur(5px)', 
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.3)', 
  boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
  fontSize: '0.7rem',
  py: 0.5, 
  textTransform: 'capitalize' as const,
  minWidth: 0,
  borderRadius: 1,
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
  },
};

export const DIALOG_BUTTON_STYLE = {
  ...MIRROR_BUTTON_STYLE,
  fontSize: '0.8rem',
  py: 0.75,
};

export const BREAKPOINTS = {
  xs: '0 0 calc(50% - 8px)',
  sm: '0 0 calc(33.33% - 10.67px)',
  md: '0 0 calc(25% - 12px)',
  lg: '0 0 calc(20% - 12.8px)',
  xl: '0 0 calc(16.66% - 13.33px)',
};

export const EMPTY_MESSAGES = {
  gallery: {
    title: 'Gallery section is empty',
    description: 'Upload some files to see them here'
  },
  favorites: {
    title: 'Favorites section is empty',
    description: 'Mark some files as favorite to see them here'
  },
  trash: {
    title: 'Deleted section is empty',
    description: 'Deleted files will appear here for 30 days before being permanently deleted'
  }
};

export const API_ENDPOINTS = {
  GET_FILES: `${API_URL}/api/auth/getfiles`,
  GET_DELETED_FILES: `${API_URL}/api/auth/get-deleted-files`,
  GET_FAVORITE_FILES: `${API_URL}/api/auth/favorite-files`,
  DELETE_FILE: `${API_URL}/api/auth/delete`,
  FAVORITE_FILE: `${API_URL}/api/auth/favorite`,
  RESTORE_FILE: `${API_URL}/api/auth/restore`,
  PERMANENT_DELETE: `${API_URL}/api/auth/permanent-delete`,
};