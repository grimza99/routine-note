import { Button } from '../buttons/Button';
import { BouncingDots } from '../loaders/BouncingDots';

interface CommonConfirmModalProps {
  title: string;
  message?: string;
  onConfirm: () => void;
  onClose: () => void;
  isPending?: boolean;
  ariaLabel?: { leftButton: string; rightButton: string };
}
export function CommonConfirmModal({
  title,
  message,
  onConfirm,
  onClose,
  isPending,
  ariaLabel,
}: CommonConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="flex flex-col gap-6 p-6 items-center">
      <header className="flex flex-col gap-2 text-center">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <p className="text-sm text-text-secondary">{message}</p>
      </header>
      <div className="flex gap-2 w-full">
        <Button label="취소" onClick={onClose} variant="secondary" aria-label={ariaLabel?.leftButton} />
        <Button
          label={isPending ? <BouncingDots /> : `확인`}
          onClick={handleConfirm}
          aria-label={ariaLabel?.rightButton}
        />
      </div>
    </div>
  );
}
