export const columnFilter = (item, filters) => {   
    return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;

        const itemValue = item[key]?.toString().toLowerCase();

        // Handle date range filter
        if ((value.start && value.end) && key.toLowerCase().includes('date')) {
            const itemDate = new Date(item[key]);
            const startDate = new Date(value.start);
            const endDate = new Date(value.end);
            // Set time to midnight for proper date comparison
            itemDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            return itemDate >= startDate && itemDate <= endDate;
        }
        
        // Handle time slider filter
        if ((value.start && value.end) && key.toLowerCase().includes('time')) {
            const itemDate = new Date(item.timeStart);
            const itemTime = `${itemDate.getHours().toString().padStart(2, '0')}:${itemDate.getMinutes().toString().padStart(2, '0')}`;
            return itemTime >= value.start && itemTime <= value.end;
        }

        // Handle array filters (checkboxes)
        if (Array.isArray(value)) {
            return value.some((valueItem) => {
                return itemValue?.includes(valueItem.toLowerCase());
            });
        }

        if (value instanceof Object) return true;

        // Handle string filters
        return itemValue?.includes(value.toLowerCase());
    });
}