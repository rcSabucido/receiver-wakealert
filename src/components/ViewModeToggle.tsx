type ViewMode = "card" | "list";

type ViewModeToggleProps = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="inline-flex items-center rounded-full bg-gray-100 p-1" role="radiogroup" aria-label="View mode">
      <button
        type="button"
        role="radio"
        aria-checked={value === "card"}
        onClick={() => onChange("card")}
        className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
          value === "card" ? "bg-white text-black shadow-sm" : "text-gray-600"
        }`}
      >
        Card View
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "list"}
        onClick={() => onChange("list")}
        className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
          value === "list" ? "bg-white text-black shadow-sm" : "text-gray-600"
        }`}
      >
        List View
      </button>
    </div>
  );
}
