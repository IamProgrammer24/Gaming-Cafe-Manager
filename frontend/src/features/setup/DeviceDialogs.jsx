import { useState } from "react";
import Modal from "../../components/ui/Modal.jsx";
import ErrorNote from "../../components/ui/ErrorNote.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { DEVICE_TYPES, typeMeta } from "../../utils/deviceTypes.js";
import { deviceErrorMessage } from "./errors.js";
import {
  useBulkCreateDevices,
  useCreateDevice,
  useDeleteDevice,
  useUpdateDevice,
} from "./hooks.js";

function TypeSelect({ value, onChange, hint }) {
  return (
    <Select
      label="Type"
      name="type"
      value={value}
      onChange={onChange}
      hint={hint}
    >
      {DEVICE_TYPES.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </Select>
  );
}

function DialogButtons({ onClose, pending, submitLabel, variant = "primary" }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button variant="ghost" onClick={onClose} disabled={pending}>
        Cancel
      </Button>
      <Button type="submit" variant={variant} loading={pending}>
        {submitLabel}
      </Button>
    </div>
  );
}

export function AddDeviceDialog({ onClose }) {
  const create = useCreateDevice();
  const [form, setForm] = useState({ name: "", type: "pc", notes: "" });
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    create.mutate(
      {
        name: form.name.trim(),
        type: form.type,
        notes: form.notes.trim() || undefined,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Modal title="Add a device" onClose={onClose} locked={create.isPending}>
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Name"
          name="name"
          required
          maxLength={40}
          autoComplete="off"
          placeholder="PC 21, VIP Room..."
          value={form.name}
          onChange={onChange}
        />
        <TypeSelect value={form.type} onChange={onChange} />
        <Input
          label="Notes (optional)"
          name="notes"
          maxLength={200}
          autoComplete="off"
          value={form.notes}
          onChange={onChange}
        />
        {create.error && (
          <ErrorNote>{deviceErrorMessage(create.error)}</ErrorNote>
        )}
        <DialogButtons
          onClose={onClose}
          pending={create.isPending}
          submitLabel="Add device"
        />
      </form>
    </Modal>
  );
}

export function BulkAddDialog({ onClose }) {
  const bulk = useBulkCreateDevices();
  const [form, setForm] = useState({
    type: "pc",
    count: "10",
    startFrom: "1",
    prefix: "",
  });
  const [localError, setLocalError] = useState("");
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const count = Number(form.count);
  const start = Number(form.startFrom);
  const valid =
    Number.isInteger(count) &&
    count >= 1 &&
    count <= 100 &&
    Number.isInteger(start) &&
    start >= 1 &&
    start <= 999;

  const label = form.prefix.trim() || typeMeta(form.type).prefix;
  const pad = (n) => String(n).padStart(2, "0");
  const preview = !valid
    ? ""
    : count === 1
      ? `${label} ${pad(start)}`
      : `${label} ${pad(start)} to ${label} ${pad(start + count - 1)}`;

  function submit(e) {
    e.preventDefault();
    if (!valid) {
      setLocalError(
        "Enter a count from 1 to 100 and a starting number from 1 to 999.",
      );
      return;
    }
    setLocalError("");
    bulk.mutate(
      {
        type: form.type,
        count,
        startFrom: start,
        ...(form.prefix.trim() && { prefix: form.prefix.trim() }),
      },
      { onSuccess: onClose },
    );
  }

  const error =
    localError || (bulk.error ? deviceErrorMessage(bulk.error) : "");

  return (
    <Modal title="Add many devices" onClose={onClose} locked={bulk.isPending}>
      <form onSubmit={submit} className="space-y-4">
        <TypeSelect value={form.type} onChange={onChange} />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="How many"
            name="count"
            type="number"
            inputMode="numeric"
            min={1}
            max={100}
            value={form.count}
            onChange={onChange}
          />
          <Input
            label="Start numbering at"
            name="startFrom"
            type="number"
            inputMode="numeric"
            min={1}
            max={999}
            value={form.startFrom}
            onChange={onChange}
          />
        </div>
        <Input
          label="Name prefix (optional)"
          name="prefix"
          maxLength={20}
          autoComplete="off"
          hint={`Leave empty to use "${typeMeta(form.type).prefix}"`}
          value={form.prefix}
          onChange={onChange}
        />
        {preview && (
          <p className="rounded-lg border border-line bg-app px-3 py-2 text-sm text-muted">
            This will create:{" "}
            <span className="font-medium text-fg">{preview}</span>
          </p>
        )}
        {error && <ErrorNote>{error}</ErrorNote>}
        <DialogButtons
          onClose={onClose}
          pending={bulk.isPending}
          submitLabel="Create devices"
        />
      </form>
    </Modal>
  );
}

export function EditDeviceDialog({ device, onClose }) {
  const update = useUpdateDevice();
  const [form, setForm] = useState({
    name: device.name,
    type: device.type,
    notes: device.notes ?? "",
  });
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    // Send only what changed. The server blocks type changes on a busy device,
    // even if the type sent is the same as before.
    const changes = {};
    const name = form.name.trim();
    const notes = form.notes.trim();
    if (name !== device.name) changes.name = name;
    if (form.type !== device.type) changes.type = form.type;
    if (notes !== (device.notes ?? "")) changes.notes = notes;

    if (Object.keys(changes).length === 0) return onClose();
    update.mutate({ id: device.id, changes }, { onSuccess: onClose });
  }

  return (
    <Modal
      title={`Edit ${device.name}`}
      onClose={onClose}
      locked={update.isPending}
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Name"
          name="name"
          required
          maxLength={40}
          autoComplete="off"
          value={form.name}
          onChange={onChange}
        />
        <TypeSelect
          value={form.type}
          onChange={onChange}
          hint="The type decides which price applies to new sessions."
        />
        <Input
          label="Notes (optional)"
          name="notes"
          maxLength={200}
          autoComplete="off"
          value={form.notes}
          onChange={onChange}
        />
        {update.error && (
          <ErrorNote>{deviceErrorMessage(update.error)}</ErrorNote>
        )}
        <DialogButtons
          onClose={onClose}
          pending={update.isPending}
          submitLabel="Save changes"
        />
      </form>
    </Modal>
  );
}

export function DeleteDeviceDialog({ device, onClose }) {
  const del = useDeleteDevice();

  function submit(e) {
    e.preventDefault();
    del.mutate(device.id, { onSuccess: onClose });
  }

  return (
    <Modal
      title={`Remove ${device.name}?`}
      onClose={onClose}
      locked={del.isPending}
    >
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted">
          The device disappears from your dashboard. Past sessions and bills
          keep its name, so your revenue history is not affected.
        </p>
        {del.error && <ErrorNote>{deviceErrorMessage(del.error)}</ErrorNote>}
        <DialogButtons
          onClose={onClose}
          pending={del.isPending}
          submitLabel="Remove"
          variant="danger"
        />
      </form>
    </Modal>
  );
}
