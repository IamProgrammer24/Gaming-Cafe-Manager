import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { fieldErrorsFrom } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
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
      await login(form); // on success the route guard redirects
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
      title="Welcome back"
      subtitle="Log in to manage your café."
      footer={
        <>
          New here?{" "}
          <Link
            to="/register"
            className="font-medium text-brand hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-busy/40 bg-busy/10 px-3 py-2 text-sm text-busy"
          >
            {error}
          </div>
        )}
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
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={onChange}
          error={fieldErrors.password}
        />
        <Button type="submit" loading={busy} className="w-full">
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
