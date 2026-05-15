import { useQuery } from '@tanstack/react-query'
import { getPublishedEvents, getEventBySlug, getFeaturedEvents, getCategories } from '@/services/eventsService'

export function useEvents(filters = {}) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn:  () => getPublishedEvents(filters),
  })
}

export function useEvent(slug) {
  return useQuery({
    queryKey: ['event', slug],
    queryFn:  () => getEventBySlug(slug),
    enabled:  !!slug,
  })
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: ['events', 'featured'],
    queryFn:  getFeaturedEvents,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn:  getCategories,
    staleTime: Infinity,
  })
}
