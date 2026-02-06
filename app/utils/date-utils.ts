import { format } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import { ptBR } from "date-fns/locale"

// Define o fuso horário oficial do app
const TIMEZONE = "America/Sao_Paulo"

// Função para FORMATAR datas (Ex: mostrar no card)
export function formatSafe(date: Date | string, pattern: string) {
  const dateObj = typeof date === "string" ? new Date(date) : date

  // Converte a data do servidor (UTC) para o fuso de SP
  const zonedDate = toZonedTime(dateObj, TIMEZONE)

  return format(zonedDate, pattern, { locale: ptBR })
}

// Função para GERAR DATAS no fuso certo (usaremos no seu arquivo de lista)
export function getZonedDate(date: Date) {
  return toZonedTime(date, TIMEZONE)
}
