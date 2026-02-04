"use client"

import { UploadButton } from "@/app/lib/uploadthing"
import { X } from "lucide-react"
import Image from "next/image"
import { Button } from "./ui/button"

interface ImageUploadProps {
  value: string // A URL da imagem
  onChange: (url: string) => void // Função pra atualizar o form
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  if (value) {
    return (
      <div className="relative h-48 w-full overflow-hidden rounded-md border">
        <Image fill src={value} alt="Upload" className="object-cover" />
        <Button
          onClick={() => onChange("")} // Limpa a imagem
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 z-10"
          type="button"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-muted/50 hover:bg-muted/70 flex h-48 w-full items-center justify-center rounded-md border-2 border-dashed transition">
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Quando termina, pega a URL e manda pro pai
          onChange(res[0].url)
        }}
        onUploadError={(error: Error) => {
          alert(`ERRO: ${error.message}`)
        }}
        appearance={{
          button:
            "bg-primary text-primary-foreground hover:bg-primary/90 ut-uploading:cursor-not-allowed",
        }}
      />
    </div>
  )
}
