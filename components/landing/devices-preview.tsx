export function DevicesPreview() {
  return (
    <div aria-hidden="true" className="mt-auto flex items-end justify-center gap-3">
      <span className="flex h-28 w-44 items-end gap-2 rounded-md border border-line bg-surface p-2">
        <span className="h-full w-8 rounded-[5px] bg-raised" />
        <span className="flex flex-1 flex-col items-end gap-2">
          <span className="h-1.5 w-3/4 self-start rounded-full bg-raised" />
          <span className="h-2 w-2/3 rounded-full bg-accent-solid" />
        </span>
      </span>
      <span className="flex h-28 w-22 flex-col items-end justify-end gap-2 rounded-md border border-line bg-surface p-2">
        <span className="h-1.5 w-3/4 self-start rounded-full bg-raised" />
        <span className="h-2 w-2/3 rounded-full bg-accent-solid" />
      </span>
      <span className="flex h-22 w-12 flex-col items-end justify-end gap-2 rounded-md border border-line bg-surface p-1.5">
        <span className="h-1.5 w-3/4 self-start rounded-full bg-raised" />
        <span className="h-2 w-3/4 rounded-full bg-accent-solid" />
      </span>
    </div>
  );
}
