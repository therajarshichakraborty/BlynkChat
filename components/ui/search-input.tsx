import type { InputHTMLAttributes } from "react";
import { SearchIcon } from "@/components/icons/search-icon";
import { cn } from "@/lib/utils/cn";
import { Kbd } from "./kbd";

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label: string;
  shortcut?: string;
  size?: "md" | "lg";
};

export function SearchInput({
  label,
  shortcut,
  size = "md",
  className,
  ...props
}: SearchInputProps) {
  return (
    <label
      className={cn(
        "flex w-full items-center gap-2.5 border border-line bg-surface text-muted transition-[border-color,box-shadow,background-color] duration-150 focus-within:border-accent focus-within:bg-card focus-within:ring-4 focus-within:ring-ring",
        size === "md" ? "h-10 rounded-lg px-3" : "h-13 rounded-full px-5 shadow-sm",
        className,
      )}
    >
      <SearchIcon size={size === "md" ? 17 : 19} />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        className="h-full min-w-0 flex-1 bg-transparent text-base text-fg outline-none [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {shortcut ? <Kbd className="max-md:hidden">{shortcut}</Kbd> : null}
    </label>
  );
}
