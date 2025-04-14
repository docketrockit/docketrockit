'use client';

import { format } from 'date-fns';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

// Interval for the date picker
// const startDate = subYears(new Date(), 75);
// const endDate = subYears(new Date(), 23);

export default function DatePicker() {
    const [date, setDate] = React.useState<Date>();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'w-full pl-3 text-left',
                        date ? 'md:text-sm' : 'text-muted-foreground'
                    )}
                >
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto size-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    autoFocus
                    defaultMonth={date}
                    showOutsideDays={false}
                    captionLayout="dropdown"
                    // hideNavigation
                    // selectTriggerClassName="transition-colors duration-200 ease-in-out hover:border-primary focus:border-primary focus:shadow-around-primary focus:ring-0 focus:ring-offset-0"
                    // startMonth={startDate}
                    // endMonth={endDate}
                    // disabled={[
                    //   { before: startDate },
                    //   { after: endDate },
                    // ]}
                    // footer={DatePickerFooter}
                />
            </PopoverContent>
        </Popover>
    );
}
