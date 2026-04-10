import { useState } from "react";
import { Link, useNavigate } from "react-router";
import api from "../../lib/api";
import { errorHandler } from "../../lib/utlils";
import { toast } from "react-toastify";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
      });
      toast.success(
        response.data.message || "Signup successful! Please sign in.",
      );
      navigate("/auth/signin");
    } catch (error) {
      errorHandler(error);
    }
  };

  return (
    <div className="space-y-5 flex flex-col items-center justify-center">
      <form onSubmit={handleSignup} className="flex flex-col gap-4 w-full">
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="signup-email" className="form-label">
            Name
          </label>
          <input
            type="text"
            id="signup-name"
            name="name"
            autoComplete="name"
            required
            className="form-input"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="signup-email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="signup-email"
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
          <label htmlFor="signup-password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="signup-password"
            name="password"
            autoComplete="current-password"
            required
            className="form-input"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="signup-confirm-password" className="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            id="signup-confirm-password"
            name="confirmPassword"
            autoComplete="current-password"
            required
            className="form-input"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className="pt-6">
          <button type="submit" className="btn-primary">
            Sign Up
          </button>
        </div>
      </form>
      <Link
        to={"/auth/signin"}
        className="text-sm text-slate-800 hover:underline text-center w-max"
      >
        Already have an account? Sign in
      </Link>
    </div>
  );
}
