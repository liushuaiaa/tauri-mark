import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Weather {
  temperature: number
  condition: string
  icon: string
  location: string
}

const WEATHER_ICONS: Record<string, string> = {
  'clear': '☀️',
  'sunny': '☀️',
  'partly-cloudy': '⛅',
  'cloudy': '☁️',
  'overcast': '☁️',
  'fog': '🌫️',
  'drizzle': '🌧️',
  'rain': '🌧️',
  'heavy-rain': '🌧️',
  'snow': '❄️',
  'heavy-snow': '❄️',
  'thunderstorm': '⛈️',
  'unknown': '🌡️'
}

export const useWeatherStore = defineStore('weather', () => {
  const weather = ref<Weather | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchWeather() {
    loading.value = true
    error.value = null

    try {
      // 使用 IP-API 获取大致位置
      const geoRes = await fetch('http://ip-api.com/json/')
      const geoData = await geoRes.json()

      let lat = geoData.lat
      let lon = geoData.lon
      let location = geoData.city || '未知'

      // 如果获取失败，使用默认值（杭州）
      if (!lat || !lon) {
        lat = 30.2741
        lon = 120.1551
        location = '杭州'
      }

      // 使用 Open-Meteo 获取天气
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=Asia%2FShanghai`
      )
      const weatherData = await weatherRes.json()

      const temp = weatherData.current.temperature_2m
      const weatherCode = weatherData.current.weather_code

      // WMO 天气代码映射
      const condition = codeToCondition(weatherCode)

      weather.value = {
        temperature: Math.round(temp),
        condition,
        icon: WEATHER_ICONS[condition] || WEATHER_ICONS['unknown'],
        location
      }
    } catch (e) {
      error.value = '获取天气失败'
      // 使用默认值
      weather.value = {
        temperature: 0,
        condition: 'unknown',
        icon: WEATHER_ICONS['unknown'],
        location: '未知'
      }
    } finally {
      loading.value = false
    }
  }

  function codeToCondition(code: number): string {
    // WMO Weather interpretation codes
    if (code === 0) return 'clear'
    if (code === 1) return 'sunny'
    if (code === 2) return 'partly-cloudy'
    if (code === 3) return 'cloudy'
    if (code >= 45 && code <= 48) return 'fog'
    if (code >= 51 && code <= 55) return 'drizzle'
    if (code >= 56 && code <= 57) return 'drizzle'
    if (code >= 61 && code <= 65) return 'rain'
    if (code >= 66 && code <= 67) return 'rain'
    if (code >= 71 && code <= 77) return 'snow'
    if (code >= 80 && code <= 82) return 'heavy-rain'
    if (code >= 85 && code <= 86) return 'heavy-snow'
    if (code >= 95 && code <= 99) return 'thunderstorm'
    return 'unknown'
  }

  return { weather, loading, error, fetchWeather }
})
