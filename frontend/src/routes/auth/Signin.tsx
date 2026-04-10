import { useState } from "react";
import { Link } from "react-router";
import api from "../../lib/api";
import type { User } from "../../types";
import { errorHandler } from "../../lib/utlils";
import useAuthstore from "../../store/auth";

export default function Signin() {
  const authStore = useAuthstore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        user: User;
        token: string;
      }>("/auth/signin", { email, password });
      if (response.data.success) {
        authStore.setAuth(response.data.user, response.data.token);
        window.location.href = "/app";
      }
    } catch (error) {
      errorHandler(error);
    }
  };

  return (
    <div className="space-y-5 flex flex-col items-center justify-center">
      <form onSubmit={handleSignin} className="flex flex-col gap-4 w-full">
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            required
            className="form-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            required
            className="form-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="pt-6">
          <button type="submit" className="btn-primary">
            Sign In
          </button>
        </div>
      </form>
      <Link
        to={"/auth/signup"}
        className="text-sm text-slate-800 hover:underline text-center w-max"
      >
        Don't have an account? Sign up
      </Link>
    </div>
  );
}
