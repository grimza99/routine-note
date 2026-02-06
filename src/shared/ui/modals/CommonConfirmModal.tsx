import { Button } from '../buttons/Button';
import { BouncingDots } from '../loaders/BouncingDots';

interface CommonConfirmModalProps {
  title: string;
  message?: string;
  onConfirm: () => void;
  onClose: () => void;
  isPending?: boolean;
}
export function CommonConfirmModal({ title, message, onConfirm, onClose, isPending }: CommonConfirmModalProps) {
  const handleConfirm = () => {
    try {
      onConfirm();
    } catch {
      return;
    }
    onClose();
  };
  return (
    <div className="flex flex-col gap-6 p-6 items-center">
      <header className="flex flex-col gap-2 text-center">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <p className="text-sm text-text-secondary">{message}</p>
      </header>
      <div className="flex gap-2 w-full">
        <Button label="취소" onClick={onClose} variant="secondary" />
        <Button label={isPending ? <BouncingDots /> : `확인`} onClick={handleConfirm} />
      </div>
    </div>
  );
}
