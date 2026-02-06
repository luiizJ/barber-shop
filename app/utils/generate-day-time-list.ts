import { setHours, setMinutes, format, addMinutes, startOfDay } from "date-fns"
import { toZonedTime } from "date-fns-tz"

export function generateDayTimeList(date: Date): string[] {
  // 1. Força a data para o fuso de SP antes de começar qualquer conta
  const timeZone = "America/Sao_Paulo"
  // Se a data veio do servidor (UTC), converte para SP
  const zonedDate = toZonedTime(date, timeZone)

  // 2. Configura o início no horário local de SP
  const startTime = setMinutes(setHours(zonedDate, 8), 0) // 08:00 BRT
  const endTime = setMinutes(setHours(zonedDate, 17), 0) // 17:00 BRT
  const interval = 45

  const timeList: string[] = []
  let currentTime = startTime

  while (currentTime <= endTime) {
    // Como currentTime já é derivado de zonedDate, o format vai sair certo (ex: "08:00")
    timeList.push(format(currentTime, "HH:mm"))
    currentTime = addMinutes(currentTime, interval)
  }

  return timeList
}
