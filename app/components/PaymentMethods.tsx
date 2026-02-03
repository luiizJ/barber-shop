"use client"
import { CreditCard, Banknote, Smartphone } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/app/components/ui/toggle-group"
import { PaymentMethod } from "@prisma/client"

interface PaymentMethodsProps {
  selected: PaymentMethod
  onChange: (value: PaymentMethod) => void
}

const PaymentMethods = ({ selected, onChange }: PaymentMethodsProps) => {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-gray-400 uppercase">
        Forma de Pagamento
      </h3>

      <ToggleGroup
        type="single"
        value={selected}
        onValueChange={(value) => {
          if (value) onChange(value as PaymentMethod)
        }}
        className="grid grid-cols-3 gap-3"
      >
        {/* Opção PIX */}
        <ToggleGroupItem
          value={PaymentMethod.PIX}
          className="border-secondary data-[state=on]:bg-primary/20 data-[state=on]:border-primary flex h-14 items-center gap-2 border"
        >
          <Smartphone size={18} />
          <span>Pix</span>
        </ToggleGroupItem>

        {/* Opção DINHEIRO/CARTÃO */}
        <ToggleGroupItem
          value={PaymentMethod.CARD}
          className="border-secondary data-[state=on]:bg-primary/20 data-[state=on]:border-primary flex h-14 items-center gap-2 border"
        >
          <CreditCard size={18} />
          <span>Credito</span>
        </ToggleGroupItem>

        <ToggleGroupItem
          value={PaymentMethod.CASH}
          className="border-secondary data-[state=on]:bg-primary/20 data-[state=on]:border-primary flex h-14 items-center gap-2 border"
        >
          <Banknote size={18} />
          <span>No Local</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

export default PaymentMethods
