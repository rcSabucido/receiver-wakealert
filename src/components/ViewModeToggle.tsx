type ViewMode = "card" | "list";

type ViewModeToggleProps = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg bg-[#3F8EFC] p-1" role="radiogroup" aria-label="View mode">
      <button
        type="button"
        role="radio"
        aria-checked={value === "card"}
        onClick={() => onChange("card")}
        className={`min-w-35 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
          value === "card" ? "bg-[#D5FF9E] text-black" : "text-white"
        }`}
      >
        Card View
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "list"}
        onClick={() => onChange("list")}
        className={`min-w-35 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
          value === "list" ? "bg-[#D5FF9E] text-black" : "text-white"
        }`}
      >
        List View
      </button>
    </div>
  );
}
