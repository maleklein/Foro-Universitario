'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  ChevronRight,
  Pin,
  Lock,
  ThumbsUp,
  ThumbsDown,
  Plus,
  AlertCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Tag,
  Bell,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type SubforumInfo = {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  forum: { id: string; name: string; faculty: string | null };
};

type ThreadAuthor = {
  id: string;
  username: string;
  avatar: string | null;
  role: string;
  emailVerified: boolean | null;
};

type ThreadItem = {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  status: 'active' | 'closed';
  pinned: boolean;
  viewCount: number;
  createdAt: string;
  lastActivityAt: string;
  author: ThreadAuthor;
  commentCount: number;
  voteCount: number;
  lastComment: { author: { id: string; username: string }; createdAt: string } | null;
};

type ThreadsResponse = {
  threads: ThreadItem[];
  page: number;
  total: number;
  hasNext: boolean;
};

type SortOption = 'recent' | 'votes' | 'activity';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 30) return `hace ${diffDays} días`;
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── RoleBadge ────────────────────────────────────────────────────────────────

function RoleBadge({ role, emailVerified }: { role: string; emailVerified?: boolean | null }) {
  if (role === 'admin')
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-violet-100 text-violet-700">
        Admin
      </span>
    );
  if (role === 'moderator')
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
        Mod
      </span>
    );
  if (role === 'verified' || emailVerified)
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
        ✓
      </span>
    );
  return null;
}

// ─── VoteButtons ──────────────────────────────────────────────────────────────

function VoteButtons({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[2rem] shrink-0">
      <div className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground/50">
        <ThumbsUp className="w-3.5 h-3.5" />
      </div>
      <span
        className={cn(
          'text-xs font-semibold tabular-nums',
          count > 0 && 'text-green-600',
          count < 0 && 'text-destructive',
          count === 0 && 'text-muted-foreground'
        )}
      >
        {count > 0 ? `+${count}` : count}
      </span>
      <div className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground/50">
        <ThumbsDown className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}

// ─── Thread row ───────────────────────────────────────────────────────────────

function ThreadRow({ thread, subforumId }: { thread: ThreadItem; subforumId: string }) {
  return (
    <div className="flex items-stretch gap-0 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
      {/* Vote column */}
      <div className="flex items-center justify-center px-3 py-3 border-r border-border/50 shrink-0">
        <VoteButtons count={thread.voteCount} />
      </div>

      {/* Main content */}
      <Link
        href={`/subforos/${subforumId}/hilos/${thread.id}`}
        className="group flex-1 min-w-0 flex flex-col gap-1.5 px-4 py-3.5"
      >
        {/* Title row */}
        <div className="flex items-start gap-2">
          {thread.pinned && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full shrink-0">
              📌 Fijado
            </span>
          )}
          <span className="font-medium text-sm leading-snug group-hover:underline underline-offset-2 flex-1 min-w-0">
            {thread.title}
          </span>
          {thread.status === 'closed' && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
              <Lock className="w-3 h-3" />
              Cerrado
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <span className="font-medium text-foreground/70">@{thread.author.username}</span>
          <RoleBadge role={thread.author.role} emailVerified={thread.author.emailVerified} />
          <span>{formatRelativeDate(thread.createdAt)}</span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {thread.commentCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {thread.viewCount}
          </span>
        </div>

        {/* Tags */}
        {thread.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {thread.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* Last comment column — hidden on mobile */}
      <div className="hidden sm:flex flex-col items-end justify-center px-4 py-3 min-w-[10rem] max-w-[12rem] shrink-0 border-l border-border/50 text-right">
        {thread.lastComment ? (
          <>
            <span className="text-xs font-medium text-foreground/70 truncate max-w-full">
              @{thread.lastComment.author.username}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {formatRelativeDate(thread.lastComment.createdAt)}
            </span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground italic">Sin respuestas</span>
        )}
      </div>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function ThreadSkeleton() {
  return (
    <div className="flex border-b border-border last:border-0 animate-pulse">
      <div className="flex items-center justify-center px-3 py-3 border-r border-border/50 w-14">
        <div className="w-7 h-16 bg-muted rounded" />
      </div>
      <div className="flex-1 flex flex-col gap-2 px-4 py-3.5">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="flex gap-3">
          <div className="h-3 bg-muted rounded w-20" />
          <div className="h-3 bg-muted rounded w-16" />
          <div className="h-3 bg-muted rounded w-10" />
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-end justify-center px-4 py-3 w-40 border-l border-border/50 gap-1.5">
        <div className="h-3 bg-muted rounded w-24" />
        <div className="h-3 bg-muted rounded w-16" />
      </div>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="animate-pulse space-y-2 mb-6">
      <div className="h-7 bg-muted rounded w-48" />
      <div className="h-4 bg-muted rounded w-80" />
      <div className="flex gap-2 mt-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-16 bg-muted rounded-full" />
        ))}
      </div>
    </div>
  );
}

// ─── Numeric pagination ───────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  hasNext,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  hasNext: boolean;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-4 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="h-8 w-8 p-0"
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground select-none">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(p as number)}
            className="h-8 w-8 p-0 tabular-nums"
            aria-label={`Página ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="sm"
        disabled={!hasNext}
        onClick={() => onPageChange(page + 1)}
        className="h-8 w-8 p-0"
        aria-label="Página siguiente"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}

// ─── Sort tabs ────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Recientes' },
  { value: 'votes', label: 'Más votados' },
  { value: 'activity', label: 'Última actividad' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubforoPage() {
  const params = useParams();
  const subforumId = params.subforumId as string;

  const [subforum, setSubforum] = useState<SubforumInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);

  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [threadsError, setThreadsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [sort, setSort] = useState<SortOption>('recent');
  const [subscribed, setSubscribed] = useState(false);

  const LIMIT = 20;

  // Load subforum info
  useEffect(() => {
    async function loadInfo() {
      try {
        const res = await fetch(`/api/subforums/${subforumId}`);
        if (!res.ok) throw new Error('Subforo no encontrado');
        const data: SubforumInfo = await res.json();
        setSubforum(data);
      } catch (err) {
        setInfoError(err instanceof Error ? err.message : 'Error al cargar subforo');
      } finally {
        setLoadingInfo(false);
      }
    }
    loadInfo();
  }, [subforumId]);

  // Load threads
  const loadThreads = useCallback(
    async (p: number, s: SortOption) => {
      setLoadingThreads(true);
      setThreadsError(null);
      try {
        const res = await fetch(
          `/api/subforums/${subforumId}/threads?page=${p}&limit=${LIMIT}&sort=${s}`
        );
        if (!res.ok) throw new Error('No se pudieron cargar los hilos');
        const data: ThreadsResponse = await res.json();
        setThreads(data.threads);
        setTotal(data.total);
        setHasNext(data.hasNext);
      } catch (err) {
        setThreadsError(err instanceof Error ? err.message : 'Error inesperado');
      } finally {
        setLoadingThreads(false);
      }
    },
    [subforumId]
  );

  useEffect(() => {
    loadThreads(page, sort);
  }, [loadThreads, page, sort]);

  function handleSortChange(newSort: SortOption) {
    setSort(newSort);
    setPage(1);
  }

  function handlePageChange(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav
            className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap"
            aria-label="Ruta de navegación"
          >
            <Link href="/foros" className="hover:text-foreground transition-colors shrink-0">
              Foros
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            {subforum ? (
              <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">
                {subforum.name}
              </span>
            ) : (
              <span className="text-foreground font-medium">…</span>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Subforum header */}
        {loadingInfo && <HeaderSkeleton />}

        {!loadingInfo && infoError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-6">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {infoError}
          </div>
        )}

        {!loadingInfo && subforum && (
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight">{subforum.name}</h1>
                {subforum.description && (
                  <p className="text-sm text-muted-foreground mt-1">{subforum.description}</p>
                )}
                {subforum.forum.faculty && (
                  <p className="text-xs text-muted-foreground mt-0.5">{subforum.forum.name}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSubscribed((s) => !s)}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-md border transition-colors',
                    subscribed
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                  )}
                >
                  <Bell className={cn('w-4 h-4', subscribed && 'fill-current')} />
                  {subscribed ? 'Suscripto' : 'Suscribirse'}
                </button>
                <Button asChild>
                  <Link href={`/subforos/${subforumId}/nuevo-hilo`}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    Nuevo hilo
                  </Link>
                </Button>
              </div>
            </div>

            {/* Subforum tags */}
            {subforum.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {subforum.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-border bg-muted text-muted-foreground"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sort tabs + column headers */}
        <div className="flex items-center gap-1 mb-0 border-b border-border pb-3">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSortChange(opt.value)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                sort === opt.value
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {opt.label}
            </button>
          ))}
          {!loadingThreads && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {total} {total === 1 ? 'hilo' : 'hilos'}
            </span>
          )}
        </div>

        {/* Column headers */}
        <div className="hidden sm:flex items-center text-xs text-muted-foreground px-0 py-1.5 mb-1">
          <div className="w-14 shrink-0" />
          <div className="flex-1 px-4">Hilo</div>
          <div className="w-40 shrink-0 px-4 text-right">Último comentario</div>
        </div>

        {/* Threads */}
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          {loadingThreads && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <ThreadSkeleton key={i} />
              ))}
            </>
          )}

          {!loadingThreads && threadsError && (
            <div className="flex items-center gap-2 px-4 py-6 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {threadsError}
            </div>
          )}

          {!loadingThreads && !threadsError && threads.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium mb-1">No hay hilos todavía</p>
              <p className="text-xs text-muted-foreground mb-4">
                ¡Sé el primero en iniciar una discusión!
              </p>
              <Button size="sm" asChild>
                <Link href={`/subforos/${subforumId}/nuevo-hilo`}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Crear primer hilo
                </Link>
              </Button>
            </div>
          )}

          {!loadingThreads && !threadsError && threads.length > 0 && (
            <>
              {threads.map((thread) => (
                <ThreadRow key={thread.id} thread={thread} subforumId={subforumId} />
              ))}
            </>
          )}
        </div>

        {/* Numeric pagination */}
        {!loadingThreads && (
          <Pagination
            page={page}
            totalPages={totalPages}
            hasNext={hasNext}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
}
