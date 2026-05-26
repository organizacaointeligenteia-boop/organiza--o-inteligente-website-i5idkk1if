import pb from '@/lib/pocketbase/client'

export interface Subscriber {
  id: string
  email: string
  name?: string
  status: string
  created: string
  updated: string
}

export const getSubscribers = async () => {
  const res = await pb.send('/backend/v1/newsletter/subscribers', { method: 'GET' })
  return res.items as Subscriber[]
}
