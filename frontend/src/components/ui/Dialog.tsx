import clsx from "clsx";
import { X } from "lucide-react";

interface DialogProps {
  onClose?: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Dialog({
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  return (
    <dialog className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center w-full h-full z-10">
      <div
        className={clsx(
          "flex flex-col min-w-sm min-h-100 max-h-[90%] bg-white border border-slate-200 rounded-2xl w-full max-w-md",
          className,
        )}
      >
        <div className="flex items-start justify-between pb-3 ">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-slate-800 leading-8">
              {title}
            </h1>
            {description && (
              <p className="text-slate-600 font-normal text-sm leading-5">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="bg-red-500 text-white min-h-6 min-w-6 w-6 h-6 rounded-full flex items-center justify-center mt-1 hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
