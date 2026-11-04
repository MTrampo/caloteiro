"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/actions/auth";
import { FaRightFromBracket } from "react-icons/fa6";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/commons/lib/utils";

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
    <Button
      type="button"
      variant="ghost"
      size="xs"
      onClick={handleSignOut}
      disabled={isPending}
      className={cn("h-auto p-0 text-xs font-mono text-zinc-400 hover:text-rose-400 hover:bg-transparent", className)}
    >
      {isPending ? (
        <Loader2 className="size-3 animate-spin text-rose-400" />
      ) : showIcon ? (
        <FaRightFromBracket className="size-3" />
      ) : null}
      <span>{isPending ? "Saindo..." : "Sair"}</span>
    </Button>
  );
}
