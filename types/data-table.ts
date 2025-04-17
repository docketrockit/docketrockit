export interface Option {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    withCount?: boolean;
}

type FilterFieldValue<TData> = keyof TData | 'global';

// export interface DataTableFilterField<TData> {
//     label: string;
//     value: FilterFieldValue<TData>;
//     placeholder?: string;
//     options?: Option[];
// }

export type DataTableFilterField<T> = {
    label: string;
    value: keyof T; // 👈 allows custom column IDs like 'adminRole'
    placeholder?: string;
    options?: Option[];
};

export interface DataTableFilterOption<TData> {
    id: string;
    label: string;
    value: keyof TData;
    options: Option[];
    filterValues?: string[];
    filterOperator?: string;
    isMulti?: boolean;
}
