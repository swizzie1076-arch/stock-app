import { Loader2 } from "lucide-react";

export default function SignInLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9fb] text-[#0f8a8a]">
      <Loader2 className="animate-spin" size={26} />
    </main>
  );
}
