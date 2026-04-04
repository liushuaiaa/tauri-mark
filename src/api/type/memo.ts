export interface Memo {
  id: string
  title: string
  content: string
  created_at: number
  updated_at: number
  deleted_at: number | null
  encrypted: boolean
  password_hint: string | null
  weather_icon: string | null
  weather_temp: number | null
}
