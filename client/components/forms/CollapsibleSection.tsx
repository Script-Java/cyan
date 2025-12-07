import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
}

export default function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = true,
  disabled = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl mb-3 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <h2 className="text-base font-bold flex items-center gap-2">
          {icon && <div className="scale-75">{icon}</div>}
          <span>{title}</span>
        </h2>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-5 pb-4 border-t border-white/10 pt-4">
          <div className="space-y-3">{children}</div>
        </div>
      )}
    </section>
  );
}
