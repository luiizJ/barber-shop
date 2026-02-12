"use client"
import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { UploadButton } from "@/app/lib/uploadthing"

interface ShopImageUploadProps {
  defaultImage: string
}

export function ShopImageUpload({ defaultImage }: ShopImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(defaultImage)

  return (
    <div className="flex flex-col gap-4">
      {/* 1. INPUT OCULTO (O segredo para a Server Action funcionar) */}
      <input type="hidden" name="imageUrl" value={imageUrl} />

      {/* 2. PREVIEW DA IMAGEM */}
      {imageUrl ? (
        <div className="relative h-40 w-full overflow-hidden rounded-md border border-zinc-700 md:w-60">
          <Image
            src={imageUrl}
            alt="Capa da Barbearia"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => setImageUrl("")} // Remove a imagem
          >
            <X size={14} />
          </Button>
        </div>
      ) : (
        <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed border-zinc-700 bg-zinc-900 md:w-60">
          <p className="text-muted-foreground text-sm">Sem imagem</p>
        </div>
      )}

      {/* 3. BOTÃO DE UPLOAD (UploadThing) */}
      <div className="w-fit">
        <UploadButton
          endpoint="imageUploader" // Certifique-se que esse nome bate com seu core/server.ts
          appearance={{
            button:
              "bg-primary text-primary-foreground hover:bg-primary/90 ut-uploading:cursor-not-allowed",
            allowedContent: "text-zinc-400",
          }}
          content={{
            button({ ready }) {
              return ready ? "Alterar Capa" : "Carregando..."
            },
            allowedContent: "Máx. 2MB (JPG, PNG)",
          }}
          onClientUploadComplete={(res) => {
            // Atualiza o estado com a URL nova
            setImageUrl(res[0].url)
            console.log("Upload concluído:", res[0].url)
          }}
          onUploadError={(error: Error) => {
            alert(`ERRO: ${error.message}`)
          }}
        />
      </div>
    </div>
  )
}
