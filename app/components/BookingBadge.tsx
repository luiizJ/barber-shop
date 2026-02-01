"use client"
import { Badge } from "./ui/badge"

interface BookingBadgeProps {
  variant: "default" | "secondary" | "outline" | "destructive"
  label: string
  className?: string
}

const BookingBadge = ({ variant, label, className }: BookingBadgeProps) => {
  return (
    <Badge variant={variant} className={`w-fit ${className}`}>
      {label}
    </Badge>
  )
}

export default BookingBadge
