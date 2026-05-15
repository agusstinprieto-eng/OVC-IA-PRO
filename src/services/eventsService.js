import { supabase } from '@/lib/supabase'

export async function getPublishedEvents({ categorySlug, search, limit = 20, offset = 0 } = {}) {
  let query = supabase
    .from('events')
    .select(`
      id, slug, title, subtitle, starts_at, ends_at, is_free, is_featured, cover_image_url, status,
      venues ( name, city ),
      event_categories ( name, slug, color, icon ),
      ticket_types ( price )
    `)
    .eq('status', 'published')
    .order('starts_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (categorySlug) {
    query = query.eq('event_categories.slug', categorySlug)
  }
  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getEventBySlug(slug) {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      venues ( * ),
      event_categories ( * ),
      ticket_types ( * ),
      event_images ( url, caption, sort_order )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) throw error
  return data
}

export async function getFeaturedEvents(limit = 5) {
  const { data, error } = await supabase
    .from('events')
    .select(`
      id, slug, title, subtitle, starts_at, cover_image_url, banner_url, is_free,
      venues ( name, city ),
      event_categories ( name, color )
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('starts_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('event_categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export function getMinPrice(ticketTypes = []) {
  const prices = ticketTypes.map((t) => t.price).filter((p) => p > 0)
  if (!prices.length) return 0
  return Math.min(...prices)
}

export function isEventSoldOut(ticketTypes = []) {
  return ticketTypes.every((t) => t.quantity_sold >= t.quantity_total)
}
