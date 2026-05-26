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

export const getDownloads = () =>
  pb.collection('free_downloads').getFullList<Download>({ sort: '-created' })
