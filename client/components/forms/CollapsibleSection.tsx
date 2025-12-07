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
    <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl mb-4 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <h2 className="text-lg font-bold flex items-center gap-3">
          {icon && <div>{icon}</div>}
          <span>{title}</span>
        </h2>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-6 pb-6 border-t border-white/10 pt-6">
          <div className="space-y-4">{children}</div>
        </div>
      )}
    </section>
  );
}
