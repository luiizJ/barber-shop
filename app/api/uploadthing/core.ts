import { createUploadthing, type FileRouter } from "uploadthing/next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

const f = createUploadthing()

// Função de Autenticação (Middleware do Upload)
const auth = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  return { userId: session.user.id }
}

export const ourFileRouter = {
  // Rota para Imagem da Barbearia e Serviços
  imageUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => await auth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload feito por:", metadata.userId)
      console.log("URL do arquivo:", file.url)
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
