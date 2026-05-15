import { supabase } from '@/lib/supabase'

// ── Dashboard KPIs ──────────────────────────────────────────────

export async function getDashboardStats() {
  const [eventsRes, ordersRes, ticketsRes] = await Promise.all([
    supabase.from('events').select('id, status', { count: 'exact' }),
    supabase.from('orders').select('id, status, total, created_at', { count: 'exact' }),
    supabase.from('tickets').select('id, status', { count: 'exact' }),
  ])

  const events  = eventsRes.data  ?? []
  const orders  = ordersRes.data  ?? []
  const tickets = ticketsRes.data ?? []

  const now       = new Date()
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const today      = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  const revenue       = orders.filter(o => o.status === 'paid').reduce((s, o) => s + Number(o.total), 0)
  const revenueMonth  = orders.filter(o => o.status === 'paid' && o.created_at >= startMonth).reduce((s, o) => s + Number(o.total), 0)
  const ordersToday   = orders.filter(o => o.created_at >= today).length
  const activeEvents  = events.filter(e => e.status === 'published').length
  const ticketsSold   = tickets.filter(t => t.status !== 'cancelled').length

  return { revenue, revenueMonth, ordersToday, activeEvents, ticketsSold, totalOrders: orders.length }
}

export async function getRevenueByDay(days = 14) {
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('orders')
    .select('total, created_at')
    .eq('status', 'paid')
    .gte('created_at', from)
    .order('created_at', { ascending: true })

  if (error) throw error

  // Group by date
  const map = {}
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - (days - 1 - i) * 86400000)
    const key = d.toISOString().slice(0, 10)
    map[key] = { date: key, revenue: 0, orders: 0 }
  }
  data.forEach((o) => {
    const key = o.created_at.slice(0, 10)
    if (map[key]) { map[key].revenue += Number(o.total); map[key].orders++ }
  })
  return Object.values(map)
}

// ── Events admin ────────────────────────────────────────────────

export async function getAllEvents({ limit = 50, offset = 0 } = {}) {
  const { data, error, count } = await supabase
    .from('events')
    .select(`
      id, slug, title, status, is_featured, starts_at, created_at,
      venues ( name ),
      event_categories ( name, color ),
      ticket_types ( quantity_total, quantity_sold, price )
    `, { count: 'exact' })
    .order('starts_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data, count }
}

export async function updateEventStatus(id, status) {
  const { error } = await supabase.from('events').update({ status }).eq('id', id)
  if (error) throw error
}

export async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

export async function upsertEvent(eventData) {
  const { id, ticketTypes, ...fields } = eventData
  const isNew = !id

  const { data: event, error: eventErr } = isNew
    ? await supabase.from('events').insert(fields).select().single()
    : await supabase.from('events').update(fields).eq('id', id).select().single()

  if (eventErr) throw eventErr

  if (ticketTypes?.length) {
    const rows = ticketTypes.map((t) => ({ ...t, event_id: event.id }))
    await supabase.from('ticket_types').upsert(rows, { onConflict: 'id' })
  }

  return event
}

export async function getVenues() {
  const { data, error } = await supabase.from('venues').select('id, name, city').order('name')
  if (error) throw error
  return data
}

export async function getCategories() {
  const { data, error } = await supabase.from('event_categories').select('*').order('name')
  if (error) throw error
  return data
}

// ── Orders admin ────────────────────────────────────────────────

export async function getAllOrders({ status, limit = 50, offset = 0 } = {}) {
  let q = supabase
    .from('orders')
    .select(`
      id, order_number, buyer_name, buyer_email, status, total, created_at,
      order_items ( quantity, ticket_types ( name, event_id, events ( title ) ) )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) q = q.eq('status', status)

  const { data, error, count } = await q
  if (error) throw error
  return { data, count }
}

export async function updateOrderStatus(id, status) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}

// ── Event-level ticket report ───────────────────────────────────

export async function getEventTicketReport(eventId) {
  const { data, error } = await supabase
    .from('ticket_types')
    .select('id, name, price, quantity_total, quantity_sold, quantity_reserved')
    .eq('event_id', eventId)

  if (error) throw error
  return data
}
