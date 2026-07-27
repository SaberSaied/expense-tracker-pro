import React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  /** Whether the dialog is visible. */
  isOpen: boolean;
  /** Callback fired when the dialog should close. */
  onClose: () => void;
  /** Callback fired when the destructive action is confirmed. */
  onConfirm: () => void;
  /** Dialog title. */
  title: string;
  /** Descriptive message explaining the consequences. */
  description: string;
  /** Confirm button label. */
  confirmLabel?: string;
  /** Whether the confirm action is in progress. */
  isLoading?: boolean;
}

/**
 * Danger confirmation dialog for irreversible destructive actions.
 * Uses the Modal component with a red accent header.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm Delete",
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center">
        <div className="size-14 rounded-2xl bg-error/15 flex items-center justify-center mb-4">
          <AlertTriangle className="size-7 text-error" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {title}
        </h3>
        <p className="text-sm text-text-secondary mb-6 max-w-xs">
          {description}
        </p>
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
