"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/actions/auth";
import { FaRightFromBracket } from "react-icons/fa6";
import { Loader2 } from "lucide-react";

interface SignOutButtonProps {
  className?: string;
  showIcon?: boolean;
}

export function SignOutButton({ className, showIcon = true }: SignOutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
      router.push("/entrar");
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-rose-400 disabled:opacity-50 transition-colors cursor-pointer ${
        className || ""
      }`}
    >
      {isPending ? (
        <Loader2 className="size-3 animate-spin text-rose-400" />
      ) : showIcon ? (
        <FaRightFromBracket className="size-3" />
      ) : null}
      <span>{isPending ? "Saindo..." : "Sair"}</span>
    </button>
  );
}

