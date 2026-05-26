import pb from '@/lib/pocketbase/client'

export interface Download {
  id: string
  title: string
  description?: string
  fileUrl: string
  downloadCount: number
  created: string
  updated: string
}

export const getDownloads = async () => {
  const res = await pb.send('/backend/v1/downloads', { method: 'GET' })
  return res.items as Download[]
}
export const trackDownload = async (id: string) => {
  return pb.send(`/backend/v1/downloads/${id}/track`, { method: 'POST' })
}
