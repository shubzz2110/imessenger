import { LogOutIcon, MessageCircleCheck } from "lucide-react";
import { Navigate, Outlet } from "react-router";
import useAuthstore from "../store/auth";
import SocketProvider from "../contexts/SocketContext";

export default function AppLayout() {
  const authStore = useAuthstore();

  const logout = () => {
    authStore.clearAuth();
    window.location.href = "/auth/signin";
  };

  if (!authStore.accessToken || !authStore.user) {
    return <Navigate to="/auth/signin" replace />;
  }

  return (
    <SocketProvider>
      <div className="flex flex-col w-full h-dvh overflow-hidden">
        <nav className="flex items-center justify-between w-full h-16 bg-white border-b border-slate-200 px-4 xl:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center min-w-10 min-h-10 h-10 w-10 rounded-full bg-blue-100 text-blue-500">
              <MessageCircleCheck size={24} />
            </div>
            <h1 className="text-xl text-slate-800 font-semibold">IMESSENGER</h1>
          </div>
          <div className="flex items-center gap-5">
            <div
              className={`bg-${authStore.user?.isOnline ? "green" : "red"}-100 text-${authStore.user?.isOnline ? "green" : "red"}-500 px-2 py-1 rounded-md text-xs leading-3 font-normal flex gap-1 items-center whitespace-nowrap`}
            >
              <div
                className={`rounded-full w-2 h-2 min-w-2 min-h-2 bg-${authStore.user?.isOnline ? "green" : "red"}-500`}
              ></div>
              {authStore.user?.isOnline ? "Online" : "Offline"}
            </div>
            <h1>{authStore.user?.name || "Unknown User"}</h1>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm leading-4 font-medium text-red-500 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
            >
              <LogOutIcon size={18} />
              Signout
            </button>
          </div>
        </nav>
        <div className="flex flex-col w-full h-[calc(100dvh-64px)] overflow-hidden p-6 grow shrink basis-0">
          <Outlet />
        </div>
      </div>
    </SocketProvider>
  );
}
