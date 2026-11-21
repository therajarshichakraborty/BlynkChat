type SystemMessageProps = {
  text: string;
};

export function SystemMessage({ text }: SystemMessageProps) {
  return (
    <li className="flex justify-center py-1">
      <span className="max-w-md rounded-full bg-surface px-3 py-1 text-center text-xs text-muted">{text}</span>
    </li>
  );
}
