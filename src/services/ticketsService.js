import { supabase } from '@/lib/supabase'

export async function createOrder({ buyerEmail, buyerName, buyerPhone, items }) {
  const { data: { user } } = await supabase.auth.getUser()

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const fees     = parseFloat((subtotal * 0.05).toFixed(2))  // 5% cargo de servicio
  const total    = subtotal + fees

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      buyer_id:    user?.id ?? null,
      buyer_email: buyerEmail,
      buyer_name:  buyerName,
      buyer_phone: buyerPhone,
      status:      'reserved',
      subtotal,
      fees,
      total,
      reserved_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    })
    .select()
    .single()

  if (orderErr) throw orderErr

  const orderItems = items.map((i) => ({
    order_id:       order.id,
    ticket_type_id: i.ticketTypeId,
    quantity:       i.quantity,
    unit_price:     i.unitPrice,
  }))

  const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
  if (itemsErr) throw itemsErr

  return order
}

export async function getMyOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items(*, ticket_types(name, event_id)), tickets(folio, qr_code, status, events(title, starts_at))`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function validateTicketQR(qrCode, scannedBy) {
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('id, status, holder_name, events(title, starts_at)')
    .eq('qr_code', qrCode)
    .single()

  if (error || !ticket) {
    await supabase.from('ticket_scans').insert({ ticket_id: null, scanned_by: scannedBy, result: 'invalid' })
    return { result: 'invalid', ticket: null }
  }

  const result = ticket.status === 'active' ? 'ok' : ticket.status === 'used' ? 'already_used' : 'cancelled'

  await supabase.from('ticket_scans').insert({ ticket_id: ticket.id, scanned_by: scannedBy, result })

  if (result === 'ok') {
    await supabase.from('tickets').update({ status: 'used', checked_in_at: new Date().toISOString(), checked_in_by: scannedBy }).eq('id', ticket.id)
  }

  return { result, ticket }
}
