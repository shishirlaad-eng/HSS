import { FormModal, FormFooter } from './hb/common/Form';
import { PrimaryButton, SecondaryButton } from './hb/listing';
import { AlertCircle } from 'lucide-react';

interface UserStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  action: 'activate' | 'deactivate' | 'self-deactivate';
}

export function UserStatusModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  action,
}: UserStatusModalProps) {
  const getModalConfig = () => {
    switch (action) {
      case 'deactivate':
        return {
          title: 'Deactivate User',
          message: `Are you sure you want to deactivate ${userName}? The user will not be able to log in.`,
          primaryButton: 'Confirm',
          showCancel: true,
          isWarning: true,
        };
      case 'activate':
        return {
          title: 'Activate User',
          message: `Are you sure you want to activate ${userName}? The user will be able to log in again.`,
          primaryButton: 'Confirm',
          showCancel: true,
          isWarning: false,
        };
      case 'self-deactivate':
        return {
          title: 'Action Not Allowed',
          message: 'You cannot deactivate your own account.',
          primaryButton: 'Close',
          showCancel: false,
          isWarning: true,
        };
      default:
        return {
          title: 'Confirmation',
          message: 'Are you sure you want to proceed?',
          primaryButton: 'Confirm',
          showCancel: true,
          isWarning: false,
        };
    }
  };

  const config = getModalConfig();

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          {config.isWarning && (
            <div className="w-10 h-10 rounded-full bg-error-50 dark:bg-error-950/30 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400" />
            </div>
          )}
          <div className="flex-1 pt-2">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {config.message}
            </p>
          </div>
        </div>

        <FormFooter>
          {config.showCancel && (
            <SecondaryButton onClick={onClose}>
              Cancel
            </SecondaryButton>
          )}
          <PrimaryButton 
            onClick={() => {
              if (action !== 'self-deactivate') {
                onConfirm();
              } else {
                onClose();
              }
            }}
            className={config.isWarning && action !== 'self-deactivate' ? 'bg-error-600 hover:bg-error-700' : ''}
          >
            {config.primaryButton}
          </PrimaryButton>
        </FormFooter>
      </div>
    </FormModal>
  );
}
