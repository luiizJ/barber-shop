"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import Link from "next/link"

export function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) setIsOpen(true)
  }, [])

  const accept = () => {
    localStorage.setItem("cookie-consent", "true")
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-4 bottom-4 left-4 z-50 md:left-auto md:w-96">
      <div className="bg-card flex flex-col gap-3 rounded-lg border p-4 shadow-lg">
        <p className="text-muted-foreground text-sm">
          Usamos cookies para melhorar sua experiência e analisar o tráfego.
          Veja nossa{" "}
          <Link href="/privacy" className="hover:text-primary underline">
            Política de Privacidade
          </Link>
          .
        </p>
        <Button onClick={accept} size="sm" className="w-full font-bold">
          Aceitar
        </Button>
      </div>
    </div>
  )
}
