/**
 * Shared Entity Components
 *
 * Reusable components for managing entities (clients/vendors)
 */

export { EntityForm } from './entity-form';
export type { BaseEntityFormData, VendorFormData, EntityFormConfig, EntityFormProps } from './entity-form';

export { EntityTableView } from './entity-table-view';
export type { EntityTableViewProps } from './entity-table-view';

export { EntityGridView } from './entity-grid-view';
export type { EntityGridViewProps } from './entity-grid-view';

export { EntityActionsMenu } from './entity-actions-menu';

export { EntityListContainer } from './entity-list-container';
export type { EntityListContainerProps, EntityType } from './entity-list-container';

export { DeleteEntityDialog } from './delete-entity-dialog';

export { EntitySearchFilterBar } from './entity-search-filter-bar';
export type { EntitySearchFilterBarProps } from './entity-search-filter-bar';

export { EntityListSkeleton } from './entity-list-skeleton';
export type { EntityListSkeletonProps } from './entity-list-skeleton';
