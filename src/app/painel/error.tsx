"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FaRotateLeft, FaTriangleExclamation } from "react-icons/fa6"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col min-h-[60vh] items-center justify-center p-6 text-center">
      <div className="size-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
        <FaTriangleExclamation className="size-6" />
      </div>

      <h2 className="font-heading text-xl font-bold text-white mb-2">
        Algo deu errado no Gabinete!
      </h2>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        Ocorreu uma instabilidade ao carregar os dados. Fique tranquilo, suas anotações e fichas estão salvas.
      </p>

      <Button
        onClick={() => reset()}
        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
      >
        <FaRotateLeft className="size-3.5 mr-2" />
        Tentar Novamente
      </Button>
    </div>
  )
}
