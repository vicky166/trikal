const KEY = 'trikal.signupDraft'

export type SignupDraft = {
  name: string
  birthDate: string
  birthTime: string
  cityId: string
}

export function saveSignupDraft(draft: SignupDraft): void {
  localStorage.setItem(KEY, JSON.stringify(draft))
}

export function readSignupDraft(): SignupDraft | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '') as Partial<SignupDraft>
    if (!parsed || typeof parsed.birthDate !== 'string' || typeof parsed.cityId !== 'string') return null
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      birthDate: parsed.birthDate,
      birthTime: typeof parsed.birthTime === 'string' ? parsed.birthTime : '',
      cityId: parsed.cityId,
    }
  } catch {
    return null
  }
}
