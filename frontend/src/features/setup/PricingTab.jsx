import { useState } from "react";
import { fieldErrorsFrom } from "../../api/client.js";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Select } from "../../components/ui/Select.jsx";
import ErrorNote from "../../components/ui/ErrorNote.jsx";
import { DEVICE_TYPES } from "../../utils/deviceTypes.js";
import { MAX_PAISE, paiseToInput, rupeesToPaise } from "../../utils/money.js";
import { useCafe, useDevices, usePricing, useSavePricing } from "./hooks.js";
import { Link } from "react-router-dom";

const GROUP_SIZES = [2, 3, 4];
const MAIN_FIELDS = [
  "ratePerHour",
  "weekendRatePerHour",
  "billingUnit",
  "minCharge",
];

const UNIT_OPTIONS = [
  ["1", "Per minute (exact time)"],
  ["15", "Round up to 15 minutes"],
  ["30", "Round up to 30 minutes"],
];

function checkMoney(value, { required, label }) {
  const paise = rupeesToPaise(value);
  if (paise === null)
    return required
      ? { error: `Enter the ${label}, for example 60` }
      : { paise: null };
  if (Number.isNaN(paise))
    return { error: "Use numbers only, with up to 2 decimals" };
  if (paise > MAX_PAISE) return { error: "The maximum is 10,000" };
  return { paise };
}

function groupFormFrom(rule) {
  const out = {};
  for (const n of GROUP_SIZES) {
    const row = rule?.groupRates?.find((r) => r.players === n);
    out[n] = {
      rate: paiseToInput(row?.ratePerHour),
      weekend: paiseToInput(row?.weekendRatePerHour),
    };
  }
  return out;
}

function PricingCard({ type, deviceCount, rule }) {
  const save = useSavePricing();
  const [form, setForm] = useState({
    rate: paiseToInput(rule?.ratePerHour),
    weekend: paiseToInput(rule?.weekendRatePerHour),
    unit: String(rule?.billingUnit ?? 1),
    minCharge: rule?.minCharge ? paiseToInput(rule.minCharge) : "",
  });
  const [groups, setGroups] = useState(() => groupFormFrom(rule));
  const [errors, setErrors] = useState({});
  const [groupErrors, setGroupErrors] = useState({});

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onGroupChange = (n, field) => (e) =>
    setGroups((g) => ({ ...g, [n]: { ...g[n], [field]: e.target.value } }));

  function submit(e) {
    e.preventDefault();
    save.reset();

    const rate = checkMoney(form.rate, {
      required: true,
      label: "hourly rate",
    });
    const weekend = checkMoney(form.weekend, { required: false });
    const min = checkMoney(form.minCharge, { required: false });

    const next = {};
    if (rate.error) next.ratePerHour = rate.error;
    if (weekend.error) next.weekendRatePerHour = weekend.error;
    if (min.error) next.minCharge = min.error;
    // setErrors(next);
    // if (Object.keys(next).length) return;

    // Rows for 2, 3 and 4 players: an empty weekday rate means "not offered"
    const nextGroupErrors = {};
    const groupRates = [];
    for (const n of GROUP_SIZES) {
      const r = checkMoney(groups[n].rate, { required: false });
      const w = checkMoney(groups[n].weekend, { required: false });
      const rowErrors = {};
      if (r.error) rowErrors.rate = r.error;
      if (w.error) rowErrors.weekend = w.error;
      if (!r.error && !w.error && r.paise === null && w.paise !== null) {
        rowErrors.rate = "Enter the weekday rate, or clear the weekend rate";
      }
      if (Object.keys(rowErrors).length) nextGroupErrors[n] = rowErrors;
      else if (r.paise !== null) {
        groupRates.push({
          players: n,
          ratePerHour: r.paise,
          weekendRatePerHour: w.paise,
        });
      }
    }

    setErrors(next);
    setGroupErrors(nextGroupErrors);
    if (Object.keys(next).length || Object.keys(nextGroupErrors).length) return;

    save.mutate(
      {
        deviceType: type.value,
        ratePerHour: rate.paise,
        weekendRatePerHour: weekend.paise, // null means "same as the normal rate"
        billingUnit: Number(form.unit),
        minCharge: min.paise ?? 0,
        groupRates,
      },
      { onError: (err) => setErrors(fieldErrorsFrom(err)) },
    );
  }

  const showGenericError =
    save.error && !Object.keys(errors).some((k) => MAIN_FIELDS.includes(k));

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-2xl border border-line bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-fg">{type.label}</h2>
          <p className="text-sm text-muted">
            {deviceCount} device{deviceCount === 1 ? "" : "s"}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            rule ? "bg-free/15 text-free" : "bg-paused/15 text-paused"
          }`}
        >
          {rule ? "Price set" : "Not set"}
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          label="Rate per hour (₹)"
          name="rate"
          inputMode="decimal"
          autoComplete="off"
          placeholder="60"
          value={form.rate}
          onChange={onChange}
          error={errors.ratePerHour}
        />
        <Input
          label="Weekend rate per hour (₹, optional)"
          name="weekend"
          inputMode="decimal"
          autoComplete="off"
          placeholder="80"
          hint="Saturday and Sunday. Leave empty to use the normal rate."
          value={form.weekend}
          onChange={onChange}
          error={errors.weekendRatePerHour}
        />
        <Select
          label="Billing unit"
          name="unit"
          value={form.unit}
          onChange={onChange}
          hint="With a 15-minute unit, a 10-minute session is billed as 15 minutes."
          error={errors.billingUnit}
        >
          {UNIT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Input
          label="Minimum charge (₹, optional)"
          name="minCharge"
          inputMode="decimal"
          autoComplete="off"
          placeholder="10"
          hint="The lowest amount billed for any session."
          value={form.minCharge}
          onChange={onChange}
          error={errors.minCharge}
        />
      </div>

      <fieldset className="mt-5 rounded-xl border border-line p-3 sm:p-4">
        <legend className="px-1 text-sm font-semibold text-fg">
          More players (optional)
        </legend>
        <p className="text-sm text-muted">
          Set the <strong>total</strong> price per hour for the whole group.
          Leave a row empty if you don't offer it. Staff will choose the number
          of players when they start a session.
        </p>
        <div className="mt-3 space-y-4">
          {GROUP_SIZES.map((n) => (
            <div key={n} className="grid gap-3 sm:grid-cols-2">
              <Input
                label={`${n} players: rate per hour (₹)`}
                inputMode="decimal"
                autoComplete="off"
                value={groups[n].rate}
                onChange={onGroupChange(n, "rate")}
                error={groupErrors[n]?.rate}
              />
              <Input
                label={`${n} players: weekend rate (₹, optional)`}
                inputMode="decimal"
                autoComplete="off"
                value={groups[n].weekend}
                onChange={onGroupChange(n, "weekend")}
                error={groupErrors[n]?.weekend}
              />
            </div>
          ))}
        </div>
      </fieldset>

      {showGenericError && (
        <div className="mt-4">
          <ErrorNote>{save.error.message}</ErrorNote>
        </div>
      )}

      {/* {save.error && Object.keys(errors).length === 0 && (
        <div className="mt-4">
          <ErrorNote>{save.error.message}</ErrorNote>
        </div>
      )} */}

      <Button
        type="submit"
        loading={save.isPending}
        className="mt-4 w-full sm:w-auto"
      >
        Save {type.label} pricing
      </Button>
    </form>
  );
}

export default function PricingTab() {
  const devicesQ = useDevices();
  const pricingQ = usePricing();
  const cafeQ = useCafe();

  if (devicesQ.isPending || pricingQ.isPending) {
    return (
      <div
        className="h-64 animate-pulse rounded-2xl border border-line bg-surface"
        aria-busy="true"
      />
    );
  }
  if (
    (devicesQ.error && !devicesQ.data) ||
    (pricingQ.error && !pricingQ.data)
  ) {
    const err = devicesQ.error ?? pricingQ.error;
    return (
      <div
        role="alert"
        className="rounded-2xl border border-busy/40 bg-busy/10 p-5 text-center"
      >
        <p className="text-busy">{err.message}</p>
        <Button
          variant="ghost"
          className="mt-3"
          onClick={() => {
            devicesQ.refetch();
            pricingQ.refetch();
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  const ruleByType = new Map(pricingQ.data.rules.map((r) => [r.deviceType, r]));
  const countByType = new Map();
  for (const d of devicesQ.data.devices)
    countByType.set(d.type, (countByType.get(d.type) ?? 0) + 1);

  const types = DEVICE_TYPES.filter(
    (t) => countByType.has(t.value) || ruleByType.has(t.value),
  );

  if (types.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <h2 className="text-lg font-semibold text-fg">
          Add your devices first
        </h2>
        <p className="mt-1 text-sm text-muted">
          Prices are set per device type, so they appear here once you have
          devices.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {cafeQ.data?.cafe.roundUpBills && (
        <p className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-muted">
          Bills are rounded up to the next ₹5.{" "}
          <Link
            to="/setup?tab=cafe"
            className="font-medium text-brand hover:underline"
          >
            Change this in Café details
          </Link>
        </p>
      )}
      {types.map((t) => (
        <PricingCard
          key={t.value}
          type={t}
          deviceCount={countByType.get(t.value) ?? 0}
          rule={ruleByType.get(t.value)}
        />
      ))}
    </div>
  );
}
