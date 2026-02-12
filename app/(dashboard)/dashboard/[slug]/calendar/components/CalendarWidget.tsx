"use client"

import { Calendar } from "@/app/components/ui/calendar"
import { Card, CardContent } from "@/app/components/ui/card"
import { formatSafe, getZonedDate } from "@/app/utils/date-utils"
import { ptBR } from "date-fns/locale"
// 👇 1. Importamos useParams
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface CalendarWidgetProps {
  bookedDates: Date[]
}

const CalendarWidget = ({ bookedDates }: CalendarWidgetProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  // 👇 2. Pegamos o slug da URL atual (ex: bom-jesus-889)
  const params = useParams()
  const slug = params.slug

  const dateParam = searchParams.get("date")
  const [date, setDate] = useState<Date | undefined>(
    dateParam ? getZonedDate(new Date(dateParam)) : new Date(),
  )

  useEffect(() => {
    if (dateParam) {
      setDate(getZonedDate(new Date(dateParam)))
    }
  }, [dateParam])

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate && slug) {
      // 👇 3. MUDANÇA CHAVE: Incluímos o slug na rota
      // Agora ele vai para /dashboard/bom-jesus-889/calendar?date=...
      router.push(
        `/dashboard/${slug}/calendar?date=${formatSafe(newDate, "yyyy-MM-dd")}`,
      )
    }
  }

  const zonedBookedDates = bookedDates.map((date) => getZonedDate(date))

  return (
    <Card className="h-fit">
      <CardContent className="flex justify-center p-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          locale={ptBR}
          className="rounded-md border shadow-sm"
          modifiers={{
            booked: zonedBookedDates,
          }}
          modifiersStyles={{
            booked: {
              fontWeight: "bold",
              textDecoration:
                "underline decoration-primary decoration-4 underline-offset-4",
            },
          }}
          styles={{
            head_cell: { textTransform: "capitalize" },
            caption: { textTransform: "capitalize" },
          }}
        />
      </CardContent>
    </Card>
  )
}

export default CalendarWidget
