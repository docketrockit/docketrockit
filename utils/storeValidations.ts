export const checkDuplicateNames = ({
    data
}: {
    data: Record<string, string>[];
}) => {
    // Step 1: Count name occurrences
    const nameCount: Record<string, number[]> = {};

    data.forEach((item, index) => {
        if (!nameCount[item.name]) {
            nameCount[item.name] = [];
        }
        nameCount[item.name].push(index + 2); // Store row index
    });

    // Step 2: Filter names that appear more than once
    const duplicates = Object.entries(nameCount)
        .filter(([_, indexes]) => indexes.length > 1)
        .map(([name, indexes]) => ({
            name,
            rows: indexes
        }));

    return duplicates;
};
