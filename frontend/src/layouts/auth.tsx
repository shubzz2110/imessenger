import { MessageCircleCheck } from "lucide-react";
import { Navigate, Outlet } from "react-router";
import useAuthstore from "../store/auth";

export default function AuthLayout() {
  const authStore = useAuthstore();
  if (authStore.accessToken || authStore.user) {
    return <Navigate to="/app" replace />;
  }
  return (
    <div className="flex items-center justify-center w-full min-h-dvh">
      <div className="flex flex-col gap-12 w-full h-full max-w-md bg-white p-12 shadow-brand rounded-2xl">
        <div className="flex flex-col items-center gap-2.5">
          <div className="flex items-center justify-center min-w-14 min-h-14 h-14 w-14 rounded-full bg-blue-100 text-blue-500">
            <MessageCircleCheck size={28} />
          </div>
          <h1 className="text-xl text-slate-800 font-semibold uppercase tracking-widest">
            IMESSENGER
          </h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
