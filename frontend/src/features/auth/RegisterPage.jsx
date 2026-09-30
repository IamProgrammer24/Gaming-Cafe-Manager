import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { fieldErrorsFrom } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    cafeName: "",
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setBusy(true);
    try {
      await register(form);
    } catch (err) {
      const fe = fieldErrorsFrom(err);
      setFieldErrors(fe);
      setError(Object.keys(fe).length ? "" : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Start your free trial"
      subtitle="15 days free. No card needed."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-busy/40 bg-busy/10 px-3 py-2 text-sm text-busy"
          >
            {error}
          </div>
        )}
        <Input
          label="Café name"
          name="cafeName"
          autoComplete="off"
          required
          minLength={2}
          maxLength={100}
          value={form.cafeName}
          onChange={onChange}
          error={fieldErrors.cafeName}
        />
        <Input
          label="Your name"
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={80}
          value={form.name}
          onChange={onChange}
          error={fieldErrors.name}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={onChange}
          error={fieldErrors.email}
        />
        <Input
          label="Phone (optional)"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={onChange}
          error={fieldErrors.phone}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          hint="At least 8 characters"
          value={form.password}
          onChange={onChange}
          error={fieldErrors.password}
        />
        <Button type="submit" loading={busy} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
