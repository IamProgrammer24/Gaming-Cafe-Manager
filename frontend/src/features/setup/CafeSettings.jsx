import { useState } from "react";
import { fieldErrorsFrom } from "../../api/client.js";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import ErrorNote from "../../components/ui/ErrorNote.jsx";
import { formatDate } from "../../utils/format.js";
import { useCafe, useUpdateCafe } from "./hooks.js";
import { Switch } from "../../components/ui/Switch.jsx";

function CafeForm({ cafe }) {
  const update = useUpdateCafe();
  const [form, setForm] = useState({
    name: cafe.name ?? "",
    phone: cafe.phone ?? "",
    address: cafe.address ?? "",
    open: cafe.openingHours?.open ?? "10:00",
    close: cafe.openingHours?.close ?? "23:00",
    roundUpBills: Boolean(cafe.roundUpBills),
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    update.mutate(
      {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        openingHours: { open: form.open, close: form.close },
        roundUpBills: form.roundUpBills,
      },
      {
        onError: (err) => {
          const fe = fieldErrorsFrom(err);
          setFieldErrors(fe);
          setError(Object.keys(fe).length ? "" : err.message);
        },
      },
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-line bg-surface p-4 sm:p-5"
    >
      {error && <ErrorNote>{error}</ErrorNote>}
      <Input
        label="Café name"
        name="name"
        required
        minLength={2}
        maxLength={100}
        autoComplete="off"
        value={form.name}
        onChange={onChange}
        error={fieldErrors.name}
      />
      <Input
        label="Contact number"
        name="phone"
        type="tel"
        autoComplete="off"
        value={form.phone}
        onChange={onChange}
        error={fieldErrors.phone}
      />
      <Input
        label="Address"
        name="address"
        maxLength={300}
        autoComplete="off"
        value={form.address}
        onChange={onChange}
        error={fieldErrors.address}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Opens at"
          name="open"
          type="time"
          required
          value={form.open}
          onChange={onChange}
          error={fieldErrors["openingHours.open"]}
        />
        <Input
          label="Closes at"
          name="close"
          type="time"
          required
          value={form.close}
          onChange={onChange}
          error={fieldErrors["openingHours.close"]}
        />
      </div>

      <div className="space-y-3 border-t border-line pt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Billing
        </h2>
        <Switch
          label="Round bills up to the next ₹5"
          hint="Applies to every device. Example: ₹4.10 becomes ₹5 and ₹6.07 becomes ₹10. Amounts already on a multiple of ₹5 stay as they are. A minimum charge is applied first."
          checked={form.roundUpBills}
          onChange={(value) => setForm((f) => ({ ...f, roundUpBills: value }))}
        />
      </div>

      <Button
        type="submit"
        loading={update.isPending}
        className="w-full sm:w-auto"
      >
        Save details
      </Button>
      <p className="text-sm text-muted">
        Subscription: <span className="capitalize">{cafe.effectiveStatus}</span>{" "}
        · ends {formatDate(cafe.expiresAt)}
      </p>
    </form>
  );
}

export default function CafeSettings() {
  const { data, isPending, error, refetch } = useCafe();

  if (isPending) {
    return (
      <div
        className="h-72 animate-pulse rounded-2xl border border-line bg-surface"
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
  return <CafeForm cafe={data.cafe} />;
}
