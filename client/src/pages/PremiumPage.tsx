import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/i18n'

interface CatalogSyncState {
  baseUrl: string
  appliedVersion: string | null
  appliedTier: string | null
  lastSyncMs: number | null
  lastError: string | null
}

interface PremiumStatus {
  catalog: CatalogSyncState
}

function fmtWhen(ms: number | null): string | null {
  if (!ms) return null
  return new Date(ms).toLocaleString()
}

export default function PremiumPage() {
  const { t } = useI18n()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<PremiumStatus>({
    queryKey: ['premium'],
    queryFn: () => apiFetch('/api/premium'),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['premium'] })
    queryClient.invalidateQueries({ queryKey: ['models'] })
  }

  const syncNow = useMutation({
    mutationFn: () => apiFetch('/api/premium/sync', { method: 'POST' }),
    onSuccess: invalidate,
  })

  if (isLoading || !data) {
    return (
      <div>
        <PageHeader title={t('premium.title')} description={t('premium.description')} />
        <p className="text-sm text-muted-foreground">{t('premium.loading')}</p>
      </div>
    )
  }

  const { catalog } = data
  const live = catalog.appliedTier === 'live'

  return (
    <div>
      <PageHeader
        title={t('premium.title')}
        description={t('premium.description')}
        actions={
          <Button variant="outline" size="sm" onClick={() => syncNow.mutate()} disabled={syncNow.isPending}>
            <RefreshCw className={syncNow.isPending ? 'animate-spin' : ''} />
            {syncNow.isPending ? t('premium.syncing') : t('premium.checkForUpdates')}
          </Button>
        }
      />

      <section>
        <h2 className="text-sm font-medium mb-3">{t('premium.catalogFeed')}</h2>
        <div className="rounded-3xl border bg-card p-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <span className={`inline-block size-2 rounded-full ${live ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
              <span className="text-sm font-medium">{live ? t('premium.liveFeed') : t('premium.monthlySnapshot')}</span>
              <Badge variant="outline" className="font-mono text-[11px]">
                {catalog.appliedVersion ?? t('premium.bundled')}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {t('premium.lastChecked', { when: fmtWhen(catalog.lastSyncMs) ?? t('common.never') })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-3">{t('premium.snapshotDescription')}</p>
          {catalog.lastError && (
            <p className="text-destructive text-xs mt-2">{t('premium.lastSyncProblem', { error: catalog.lastError })}</p>
          )}
          {syncNow.isError && (
            <p className="text-destructive text-xs mt-2">{(syncNow.error as Error).message}</p>
          )}
        </div>
      </section>
    </div>
  )
}
