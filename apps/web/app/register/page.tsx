import Link from "next/link";
import { register } from "../../lib/auth-actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="container">
      <div className="card auth-card">
        <h1>Create account</h1>
        {error === "taken" && <p className="error">That email is already registered.</p>}
        {error === "invalid" && (
          <p className="error">Registration failed — check your details (password min 8 chars).</p>
        )}
        <form action={register}>
          <div className="form-field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" required autoComplete="name" />
          </div>
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
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn">
            Register
          </button>
        </form>
        <p className="meta" style={{ marginTop: "1rem" }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
