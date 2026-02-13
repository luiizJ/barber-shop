import Link from "next/link"

const Footer = () => {
  return (
    <footer className="bg-secondary/30 mt-10 w-full border-t py-6">
      <div className="container mx-auto flex flex-col items-center gap-4 px-5 md:flex-row md:justify-between">
        <p className="text-xs text-gray-400">
          © 2026 Copyright <span className="text-primary font-bold">LuizJ</span>
        </p>
        <div className="flex gap-4">
          <Link
            href="/terms"
            className="text-xs text-gray-400 underline-offset-4 hover:underline"
          >
            Termos de Uso
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-gray-400 underline-offset-4 hover:underline"
          >
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
