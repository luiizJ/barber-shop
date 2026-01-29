"use client"
import { PhoneIcon } from "lucide-react"
import { Button } from "./ui/button"
import { toast } from "sonner"

interface BarberPhoneProps {
  phone: string
}

const BarberPhone = ({ phone }: BarberPhoneProps) => {
  const handleCopy = (phone: string) => {
    navigator.clipboard.writeText(phone)
    toast.success("Numero copiado com sucesso!")
  }
  return (
    <div className="flex justify-between" key={phone}>
      <div className="flex items-center gap-2">
        <PhoneIcon />
        <p className="text-sm">{phone}</p>
      </div>
      <Button variant={"secondary"} onClick={() => handleCopy(phone)}>
        Copiar
      </Button>
    </div>
  )
}

export default BarberPhone
