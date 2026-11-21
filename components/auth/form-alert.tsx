import { AlertCircleIcon } from "@/components/icons/alert-circle-icon";

type FormAlertProps = {
  message: string;
};

export function FormAlert({ message }: FormAlertProps) {
  return (
    <p
      role="alert"
      className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger-text"
    >
      <AlertCircleIcon size={16} />
      {message}
    </p>
  );
}
