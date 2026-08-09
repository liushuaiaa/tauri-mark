export interface Feedback {
  id: number
  title: string
  content: string
  status: 'PENDING' | 'RESOLVED' | 'CLOSED'
  created_at: number
  updated_at: number
}
