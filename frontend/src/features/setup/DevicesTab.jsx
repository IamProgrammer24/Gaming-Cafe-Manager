import { useState } from "react";
import { Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/Button.jsx";
import { DEVICE_TYPES } from "../../utils/deviceTypes.js";
import { useDevices } from "./hooks.js";
import {
  AddDeviceDialog,
  BulkAddDialog,
  DeleteDeviceDialog,
  EditDeviceDialog,
} from "./DeviceDialogs.jsx";

const ICON_BTN =
  "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition hover:bg-app";

export default function DevicesTab() {
  const { data, isPending, error, refetch } = useDevices();
  const [dialog, setDialog] = useState(null); // { kind: 'add' | 'bulk' | 'edit' | 'delete', device? }
  const close = () => setDialog(null);

  if (isPending) {
    return (
      <div
        className="h-48 animate-pulse rounded-2xl border border-line bg-surface"
        aria-busy="true"
      />
    );
  }
  if (error && !data) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-busy/40 bg-busy/10 p-5 text-center"
      >
        <p className="text-busy">{error.message}</p>
        <Button variant="ghost" className="mt-3" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const devices = data.devices;
  const groups = DEVICE_TYPES.map((t) => ({
    ...t,
    items: devices.filter((d) => d.type === t.value),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {devices.length} device{devices.length === 1 ? "" : "s"}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setDialog({ kind: "add" })}>
            <Plus className="size-4" aria-hidden /> Add device
          </Button>
          <Button onClick={() => setDialog({ kind: "bulk" })}>
            <Layers className="size-4" aria-hidden /> Add many
          </Button>
        </div>
      </div>

      {devices.length === 0 && (
        <div className="rounded-2xl border border-line bg-surface p-8 text-center">
          <h2 className="text-lg font-semibold text-fg">No devices yet</h2>
          <p className="mt-1 text-sm text-muted">
            Use <strong>Add many</strong> to create all your PCs at once, for
            example PC 01 to PC 20.
          </p>
        </div>
      )}

      {groups.map((g) => (
        <section
          key={g.value}
          className="rounded-2xl border border-line bg-surface p-4 sm:p-5"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {g.label} · {g.items.length}
          </h2>
          <ul className="mt-2 divide-y divide-line">
            {g.items.map((d) => (
              <li key={d.id} className="flex items-center gap-2 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-fg">{d.name}</p>
                  {d.notes && (
                    <p className="truncate text-sm text-muted">{d.notes}</p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`Edit ${d.name}`}
                  className={`${ICON_BTN} hover:text-fg`}
                  onClick={() => setDialog({ kind: "edit", device: d })}
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${d.name}`}
                  className={`${ICON_BTN} hover:text-busy`}
                  onClick={() => setDialog({ kind: "delete", device: d })}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {dialog?.kind === "add" && <AddDeviceDialog onClose={close} />}
      {dialog?.kind === "bulk" && <BulkAddDialog onClose={close} />}
      {dialog?.kind === "edit" && (
        <EditDeviceDialog device={dialog.device} onClose={close} />
      )}
      {dialog?.kind === "delete" && (
        <DeleteDeviceDialog device={dialog.device} onClose={close} />
      )}
    </div>
  );
}
