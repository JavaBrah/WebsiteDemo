import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(form);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full grid place-items-center p-6 bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          className="w-full border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring"
          value={form.email}
          onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
          required
        />

        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring"
          value={form.password}
          onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
          required
        />

        <button
          disabled={loading}
          className="w-full py-2 rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}