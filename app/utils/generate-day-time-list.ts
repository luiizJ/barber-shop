import { setHours, setMinutes, format, addMinutes } from "date-fns"

export function generateDayTimeList(date: Date): string[] {
  // CONFIGURAÇÃO INICIAL (Isso aqui virá do Banco de Dados no futuro)
  const startTime = setMinutes(setHours(date, 8), 0) // Começa as 08:00
  const endTime = setMinutes(setHours(date, 17), 0) // Termina as 21:00
  const interval = 45 // Tempo de serviço em minutos (ex: 45 min)

  const timeList: string[] = []
  let currentTime = startTime

  while (currentTime <= endTime) {
    timeList.push(format(currentTime, "HH:mm"))
    currentTime = addMinutes(currentTime, interval)
  }

  return timeList
}
