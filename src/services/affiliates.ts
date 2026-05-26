import pb from '@/lib/pocketbase/client'

export interface AffiliateLink {
  id: string
  productName: string
  productUrl: string
  category: string
  description?: string
  affiliateUrl: string
  commission?: number
  created: string
  updated: string
}

export const getAffiliates = () =>
  pb.collection('affiliate_links').getFullList<AffiliateLink>({ sort: '-created' })
export const createAffiliate = (data: Partial<AffiliateLink>) =>
  pb.collection('affiliate_links').create<AffiliateLink>(data)
export const updateAffiliate = (id: string, data: Partial<AffiliateLink>) =>
  pb.collection('affiliate_links').update<AffiliateLink>(id, data)
export const deleteAffiliate = (id: string) => pb.collection('affiliate_links').delete(id)
