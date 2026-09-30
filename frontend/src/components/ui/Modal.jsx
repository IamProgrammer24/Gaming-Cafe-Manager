import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

// Mount it to open it, unmount it to close it. That resets any form state each time.
// locked = true blocks closing while a request is in progress.
export default function Modal({ title, onClose, locked = false, children }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const requestClose = () => {
    if (!locked) onClose();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault(); // Escape key: let our own logic decide
        requestClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) requestClose(); // click on the backdrop
      }}
      className="mx-0 mb-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-t-2xl border border-line bg-surface p-0 text-fg backdrop:bg-black/60 sm:m-auto sm:max-w-md sm:rounded-2xl"
    >
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-fg">
            {title}
          </h2>
          <button
            type="button"
            onClick={requestClose}
            disabled={locked}
            aria-label="Close"
            className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition hover:text-fg disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
