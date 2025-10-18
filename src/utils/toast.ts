import {useToast} from 'react-native-toast-notifications';

// Hook để sử dụng toast trong components
export const useAppToast = () => {
  const toast = useToast();

  return {
    success: (message: string) =>
      toast.show(message, {
        type: 'success',
        placement: 'top',
        duration: 3000,
        animationType: 'slide-in',
      }),

    error: (message: string) =>
      toast.show(message, {
        type: 'danger',
        placement: 'top',
        duration: 4000,
        animationType: 'slide-in',
      }),

    info: (message: string) =>
      toast.show(message, {
        type: 'normal',
        placement: 'top',
        duration: 3000,
        animationType: 'slide-in',
      }),

    warning: (message: string) =>
      toast.show(message, {
        type: 'warning',
        placement: 'top',
        duration: 3500,
        animationType: 'slide-in',
      }),
  };
};

// Toast utility functions that work with ToastProvider context
// These functions need to be called from within a component that has access to toast context
export const showSuccessToast = (message: string) => {
  console.warn(
    'showSuccessToast should be used within a component with useAppToast hook',
  );
};

export const showErrorToast = (message: string) => {
  console.warn(
    'showErrorToast should be used within a component with useAppToast hook',
  );
};

export const showInfoToast = (message: string) => {
  console.warn(
    'showInfoToast should be used within a component with useAppToast hook',
  );
};

export const showWarningToast = (message: string) => {
  console.warn(
    'showWarningToast should be used within a component with useAppToast hook',
  );
};
