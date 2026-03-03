interface WindowProps {
  title: string;
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
  statusBar?: string;
}

export function Window({
  title,
  className = "",
  children,
  onClose,
  statusBar,
}: WindowProps) {
  return (
    <div
      className={`bg-win95-bg shadow-win95-raised flex flex-col ${className}`}
    >
      <div className="win95-titlebar">
        <span className="truncate">{title}</span>
        <div className="flex gap-0.5">
          {onClose && (
            <button
              onClick={onClose}
              className="bg-win95-bg shadow-win95-button w-4 h-3.5 flex items-center justify-center text-[9px] leading-none font-bold"
            >
              x
            </button>
          )}
        </div>
      </div>
      <div className="p-3 flex-1">{children}</div>
      {statusBar && (
        <div className="shadow-win95-sunken mx-1 mb-1 px-2 py-0.5 text-[11px]">
          {statusBar}
        </div>
      )}
    </div>
  );
}
