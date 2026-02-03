export const PLAN_LIMITS = {
  START: {
    maxServices: 5,
    maxPhotos: 1,
    maxBarbers: 1,
    financialView: "DAILY_ONLY",
    historyWindow: 30,
    menuUpdatesPerMonth: 1,
    whatsAppConfirm: true,
  },
  PRO: {
    maxServices: 15,
    maxPhotos: 10,
    maxBarbers: 5,
    financialView: "FULL",
    historyWindow: 180, //  6 Meses (após isso a gente arquiva)
    menuUpdatesPerMonth: 9999,
    whatsAppConfirm: true,
  },
}

export function getPlanLimits(plan: string | null) {
  const p = plan === "PRO" ? "PRO" : "START"
  return PLAN_LIMITS[p]
}
