import Link from "next/link";
import { login } from "../../lib/auth-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="container">
      <div className="card auth-card">
        <h1>Sign in</h1>
        {error && <p className="error">Invalid email or password.</p>}
        <form action={login}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn">
            Sign in
          </button>
        </form>
        <p className="meta" style={{ marginTop: "1rem" }}>
          No account? <Link href="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
