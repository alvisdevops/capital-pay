import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(session.user.role === "ADMIN" ? "/admin/dashboard" : "/instructor/dashboard");
  }

  return (
    <div className="login-page flex min-h-screen items-center justify-center px-4">
      <LoginForm />
    </div>
  );
}
