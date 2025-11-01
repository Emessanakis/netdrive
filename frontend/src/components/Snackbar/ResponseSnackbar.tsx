// src/components/Dialogs/ResponseDialog.tsx
import React from "react";
import {
  Box,
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon, Check as CheckIcon, Error as ErrorIcon } from "@mui/icons-material";
import { useTheme } from '@mui/material/styles';

export type DialogVariant = 'success' | 'error' | 'warning' | 'info';

interface ResponseDialogProps {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  variant?: DialogVariant;
  showCloseButton?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const getVariantConfig = (variant: DialogVariant) => {
  const config = {
    success: { defaultTitle: 'Success', color: 'success' as const },
    error: { defaultTitle: 'Error', color: 'error' as const },
    warning: { defaultTitle: 'Warning', color: 'warning' as const },
    info: { defaultTitle: 'Information', color: 'info' as const },
  };
  return config[variant];
};

const ResponseDialog: React.FC<ResponseDialogProps> = ({
  open,
  title,
  message,
  onClose,
  variant,
  showCloseButton = true,
}) => {
  // If variant isn't provided, infer from title/message (fallback for existing callers)
  const inferVariant = (t?: string, m?: string): DialogVariant => {
    const txt = `${t ?? ''} ${m ?? ''}`.toLowerCase();
    if (txt.includes('success') || txt.includes('uploaded') || txt.includes('added')) return 'success';
    if (txt.includes('error') || txt.includes('failed') || txt.includes('cannot') || txt.includes('denied')) return 'error';
    if (txt.includes('warning') || txt.includes('limited') || txt.includes('exceed')) return 'warning';
    return 'info';
  };

  const effectiveVariant = variant ?? inferVariant(title, message);
  const variantConfig = getVariantConfig(effectiveVariant);
  // Force canonical titles for success/error so the UI always shows 'Success' or 'Error' on top.
  const displayTitle = (effectiveVariant === 'success')
    ? 'Success'
    : (effectiveVariant === 'error')
      ? 'Error'
      : (title || variantConfig.defaultTitle);

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    // allow clickaway to close by default, but still forward the close
    if (reason === 'timeout') {
      onClose();
      return;
    }
    onClose();
  };

  const theme = useTheme();
  // For success/error use explicit brand colors requested by the product
  const SUCCESS_BG = 'rgb(78, 205, 196)'; // #4ECDC4
  const ERROR_BG = 'rgb(255, 107, 107)'; // #FF6B6B
  const paletteColor = variantConfig.color as 'success' | 'error' | 'warning' | 'info';
  const background =
    paletteColor === 'success' ? SUCCESS_BG : paletteColor === 'error' ? ERROR_BG : theme.palette[paletteColor]?.light ?? undefined;

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      autoHideDuration={4000}
      onClose={handleClose}
    >
      <Alert
        onClose={onClose}
        severity={variantConfig.color}
        variant="standard"
        icon={
          effectiveVariant === 'success' ? (
            <CheckIcon sx={{ color: 'white' }} />
          ) : effectiveVariant === 'error' ? (
            <ErrorIcon sx={{ color: 'white' }} />
          ) : undefined
        }
        sx={{
          minWidth: 320,
          backgroundColor: background,
          color: 'white',
          // Ensure the severity icon and any SVGs inside the Alert are always white
          '& .MuiAlert-icon, & .MuiAlert-icon svg, & .MuiAlert-icon *': {
            color: 'white !important',
            fill: 'white !important',
          }
        }}
        action={
          showCloseButton ? (
            <IconButton
              aria-label="close"
              size="small"
              onClick={onClose}
              sx={{ color: 'white'}}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : undefined
        }
      >
        <AlertTitle sx={{ textTransform: 'capitalize', color: 'white' }}>{displayTitle}</AlertTitle>
        <Box component="span" sx={{ display: 'block', whiteSpace: 'normal', color: 'white' }}>{message}</Box>
      </Alert>
    </Snackbar>
  );
};

export default ResponseDialog;