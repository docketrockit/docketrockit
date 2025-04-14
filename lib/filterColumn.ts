import { type DataTableConfig } from "@/config/dataTable";

export function filterColumn({
    column,
    value,
    isSelectable
}: {
    column: string;
    value: string;
    isSelectable?: boolean;
}) {
    const [filterValue, filterOperator] = (value?.split("~").filter(Boolean) ??
        []) as [
        string,
        DataTableConfig["comparisonOperators"][number]["value"] | undefined
    ];

    // if (!filterValue) return;

    if (isSelectable) {
        switch (filterOperator) {
            case "eq":
                return {
                    [`${column}`]: {
                        in: filterValue?.split(".").filter(Boolean) ?? []
                    }
                };
            case "notEq":
                return {
                    NOT: {
                        [`${column}`]: {
                            in: filterValue?.split(".").filter(Boolean) ?? []
                        }
                    }
                };
            case "isNull":
                return {
                    [`${column}`]: null
                };
            case "isNotNull":
                return {
                    [`${column}`]: { not: null }
                };
            default:
                return {
                    [`${column}`]: {
                        in: filterValue?.split(".").filter(Boolean) ?? []
                    }
                };
        }
    }

    switch (filterOperator) {
        case "ilike":
            return {
                [`${column}`]: { contains: filterValue, mode: "insensitive" }
            };
        case "notIlike":
            return {
                NOT: {
                    [`${column}`]: { contains: filterValue }
                }
            };
        case "startsWith":
            return {
                [`${column}`]: { startsWith: filterValue }
            };
        case "endsWith":
            return {
                [`${column}`]: { endsWith: filterValue }
            };
        case "eq":
            return {
                [`${column}`]: filterValue
            };
        case "notEq":
            return {
                [`${column}`]: { not: filterValue }
            };
        case "isNull":
            return {
                [`${column}`]: null
            };
        case "isNotNull":
            return {
                [`${column}`]: { not: null }
            };
        default:
            return {
                [`${column}`]: { contains: filterValue, mode: "insensitive" }
            };
    }
}
