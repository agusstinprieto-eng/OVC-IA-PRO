import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { upsertEvent, getVenues, getCategories } from '@/services/adminService'
import { supabase } from '@/lib/supabase'
import { slugify, formatCurrency } from '@/lib/utils'

export default function EventForm() {
  const { id }   = useParams()        // undefined → nuevo
  const isNew    = id === 'nuevo' || !id
  const navigate = useNavigate()
  const qc       = useQueryClient()

  const { data: venues     = [] } = useQuery({ queryKey: ['venues'],     queryFn: getVenues     })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const { data: event, isLoading: loadingEvent } = useQuery({
    queryKey: ['admin-event', id],
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, ticket_types(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !isNew,
  })

  const { register, handleSubmit, watch, setValue, control, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: '', subtitle: '', slug: '', description: '',
      category_id: '', venue_id: '',
      starts_at: '', ends_at: '', doors_open_at: '',
      cover_image_url: '', banner_url: '',
      status: 'draft', is_featured: false, is_free: false,
      max_tickets_per_order: 10,
      ticketTypes: [{ name: 'General', description: '', price: 0, quantity_total: 100, is_visible: true, sort_order: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'ticketTypes' })

  // Auto-generar slug desde título
  const title = watch('title')
  useEffect(() => {
    if (isNew && title) setValue('slug', slugify(title))
  }, [title, isNew, setValue])

  // Llenar form al editar
  useEffect(() => {
    if (event) {
      const { ticket_types, starts_at, ends_at, doors_open_at, ...rest } = event
      reset({
        ...rest,
        starts_at:     starts_at?.slice(0, 16) ?? '',
        ends_at:       ends_at?.slice(0, 16)   ?? '',
        doors_open_at: doors_open_at?.slice(0, 16) ?? '',
        ticketTypes:   ticket_types ?? [],
      })
    }
  }, [event, reset])

  const saveMut = useMutation({
    mutationFn: (data) => upsertEvent({ ...data, id: isNew ? undefined : id }),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] })
      navigate('/admin/eventos')
    },
  })

  if (!isNew && loadingEvent) return <AdminLayout><div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/admin/eventos" className="text-ink-400 hover:text-ocv-cyan transition-colors text-sm">← Eventos</Link>
          <div>
            <p className="text-xs text-ocv-cyan uppercase tracking-widest font-medium mb-0.5">Administración</p>
            <h1 className="font-display text-4xl text-ink-100 tracking-wide">
              {isNew ? 'Nuevo Evento' : 'Editar Evento'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(saveMut.mutate)} className="space-y-8">

          {/* Información básica */}
          <Section title="Información básica">
            <Input label="Título *" {...register('title', { required: 'Requerido' })} error={errors.title?.message} />
            <Input label="Subtítulo" {...register('subtitle')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Slug (URL)" {...register('slug', { required: 'Requerido' })} error={errors.slug?.message} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-ink-300 font-medium">Estado</label>
                <select {...register('status')} className="select-admin">
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-ink-300 font-medium">Categoría</label>
                <select {...register('category_id')} className="select-admin">
                  <option value="">Sin categoría</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-ink-300 font-medium">Recinto</label>
                <select {...register('venue_id')} className="select-admin">
                  <option value="">Sin recinto</option>
                  {venues.map(v => <option key={v.id} value={v.id}>{v.name} — {v.city}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-ink-300 font-medium block mb-1.5">Descripción</label>
              <textarea
                {...register('description')}
                rows={5}
                className="w-full rounded-lg bg-surface-700 border border-surface-500 px-4 py-2.5 text-ink-100 placeholder:text-ink-400 focus:outline-none focus:border-ocv-cyan focus:ring-1 focus:ring-ocv-cyan/40 resize-none"
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-ink-300 cursor-pointer">
                <input type="checkbox" {...register('is_featured')} className="accent-ocv-cyan" />
                Evento destacado
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-300 cursor-pointer">
                <input type="checkbox" {...register('is_free')} className="accent-ocv-cyan" />
                Entrada libre
              </label>
            </div>
          </Section>

          {/* Fechas */}
          <Section title="Fechas y horarios">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input type="datetime-local" label="Inicio *" {...register('starts_at', { required: 'Requerido' })} error={errors.starts_at?.message} />
              <Input type="datetime-local" label="Fin"      {...register('ends_at')} />
              <Input type="datetime-local" label="Apertura de puertas" {...register('doors_open_at')} />
            </div>
          </Section>

          {/* Imágenes */}
          <Section title="Imágenes">
            <Input label="URL imagen de portada" placeholder="https://..." {...register('cover_image_url')} />
            <Input label="URL banner (16:5)"      placeholder="https://..." {...register('banner_url')} />
          </Section>

          {/* Tipos de boleto */}
          <Section title="Tipos de boleto">
            <div className="space-y-4">
              {fields.map((field, i) => (
                <div key={field.id} className="rounded-xl border border-surface-600 bg-surface-700/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink-200">Boleto #{i + 1}</p>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:underline">Eliminar</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="col-span-2 sm:col-span-2">
                      <Input label="Nombre" {...register(`ticketTypes.${i}.name`, { required: 'Requerido' })} />
                    </div>
                    <Input type="number" label="Precio (MXN)" step="0.01" min="0" {...register(`ticketTypes.${i}.price`, { valueAsNumber: true })} />
                    <Input type="number" label="Cantidad total"            min="1" {...register(`ticketTypes.${i}.quantity_total`, { valueAsNumber: true })} />
                  </div>
                  <Input label="Descripción del boleto" {...register(`ticketTypes.${i}.description`)} />
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ name: '', description: '', price: 0, quantity_total: 100, is_visible: true, sort_order: fields.length })}
              >
                + Agregar tipo de boleto
              </Button>
            </div>
            <Input type="number" label="Máx. boletos por orden" min="1" max="50" {...register('max_tickets_per_order', { valueAsNumber: true })} />
          </Section>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <Button type="submit" size="lg" disabled={isSubmitting || saveMut.isPending}>
              {saveMut.isPending ? 'Guardando...' : isNew ? 'Crear Evento' : 'Guardar Cambios'}
            </Button>
            <Link to="/admin/eventos">
              <Button type="button" variant="ghost" size="lg">Cancelar</Button>
            </Link>
            {saveMut.isError && (
              <p className="text-sm text-red-400">Error al guardar. Intenta de nuevo.</p>
            )}
          </div>
        </form>
      </div>

      {/* Inline style for selects */}
      <style>{`
        .select-admin {
          width: 100%;
          border-radius: 0.5rem;
          background: rgba(38,43,48,1);
          border: 1px solid rgba(61,72,80,1);
          padding: 0.625rem 1rem;
          color: #dce3e7;
          font-size: 0.875rem;
          outline: none;
        }
        .select-admin:focus { border-color: #00aad1; box-shadow: 0 0 0 1px rgba(0,172,209,0.3); }
      `}</style>
    </AdminLayout>
  )
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-surface-600 bg-surface-800 p-6 space-y-4">
      <h2 className="font-display text-xl text-ink-100 tracking-wide pb-2 border-b border-surface-600">{title}</h2>
      {children}
    </div>
  )
}
