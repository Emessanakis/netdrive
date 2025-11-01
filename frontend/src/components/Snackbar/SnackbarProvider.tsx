import React, { createContext, useCallback, useContext, useState } from 'react';
import ResponseDialog from './ResponseSnackbar';
import type { DialogVariant } from './ResponseSnackbar';

interface SnackbarContextValue {
  showSnackbar: (message: string, variant?: DialogVariant) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export const SnackbarProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState<DialogVariant>('info');

  const showSnackbar = useCallback((msg: string, v: DialogVariant = 'info') => {
    setMessage(msg);
    setVariant(v);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <ResponseDialog open={open} message={message} variant={variant} onClose={handleClose} />
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextValue => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within a SnackbarProvider');
  return ctx;
};

export default SnackbarProvider;
