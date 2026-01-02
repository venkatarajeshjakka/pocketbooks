/**
 * EntityListWithCache Component
 * 
 * Generic reusable component for entity lists with React Query caching,
 * search, filtering, and view toggling.
 */

'use client';

import { LucideIcon } from 'lucide-react';
import { EntityListContainer } from './entity-list-container';
import { EntityListSkeleton } from './entity-list-skeleton';
import { EmptyState } from '@/components/shared/ui/empty-state';
import { ViewMode } from './view-toggle';
import { PaginatedResponse, IClient, IVendor } from '@/types';

type EntityType = IClient | IVendor;

interface EntityListWithCacheProps<T extends EntityType> {
    page: number;
    search: string;
    status: string;
    hasOutstanding: string;
    view: ViewMode;
    useEntities: (params: any) => { data: PaginatedResponse<T> | undefined; isLoading: boolean; error: any };
    useDeleteEntity: () => { mutateAsync: (id: string) => Promise<any> };
    entityType: 'client' | 'vendor';
    icon: LucideIcon;
    basePath: string;
    addNewPath: string;
    outstandingFilterField: keyof T;
}

export function EntityListWithCache<T extends EntityType>({
    page,
    search,
    status,
    hasOutstanding,
    view,
    useEntities,
    useDeleteEntity,
    entityType,
    icon: Icon,
    basePath,
    addNewPath,
    outstandingFilterField,
}: EntityListWithCacheProps<T>) {
    // Fetch entities with caching
    const { data, isLoading, error } = useEntities({
        page,
        limit: 50,
        search,
        status,
    });

    const deleteMutation = useDeleteEntity();

    const handleDelete = async (id: string) => {
        await deleteMutation.mutateAsync(id);
    };

    // Loading state
    if (isLoading) {
        return <EntityListSkeleton view={view} count={8} />;
    }

    // Error state
    if (error) {
        console.error(`Error fetching ${entityType}s:`, error);
        return (
            <EmptyState
                icon={Icon}
                title={`Failed to load ${entityType}s`}
                description={`An error occurred while loading ${entityType}s. Please try again later.`}
            />
        );
    }

    // Extract entities from response
    const entities = data?.data || [];

    // Filter by outstanding field if needed
    const filteredEntities =
        hasOutstanding === 'true'
            ? entities.filter((e) => (e[outstandingFilterField] as unknown as number) > 0)
            : entities;

    const entityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1);
    const entitiesLabel = `${entityType}s`;

    // Empty state
    if (filteredEntities.length === 0) {
        const hasFilters = search || status || hasOutstanding;

        return (
            <EmptyState
                icon={Icon}
                title={hasFilters ? `No ${entitiesLabel} found` : `No ${entitiesLabel} yet`}
                description={
                    hasFilters
                        ? 'Try adjusting your search or filters to find what you are looking for.'
                        : `Get started by adding your first ${entityType} to begin managing your ${entityType} relationships.`
                }
                action={
                    !hasFilters
                        ? {
                            label: `Add your first ${entityType}`,
                            onClick: () => {
                                window.location.href = addNewPath;
                            },
                        }
                        : undefined
                }
            />
        );
    }

    // Render list using shared EntityListContainer
    return (
        <EntityListContainer
            entities={filteredEntities}
            entityType={entityType}
            initialView={view}
            basePath={basePath}
            onDelete={handleDelete}
        />
    );
}
