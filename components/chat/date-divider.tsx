type DateDividerProps = {
  label: string;
};

export function DateDivider({ label }: DateDividerProps) {
  return (
    <li className="flex justify-center py-2" role="separator" aria-label={label}>
      <span className="rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-muted shadow-xs">
        {label}
      </span>
    </li>
  );
}
