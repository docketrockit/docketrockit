'use client';

import {
    addDays,
    addMonths,
    format,
    isBefore,
    isEqual,
    isWithinInterval
} from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
    Dispatch,
    memo,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState
} from 'react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// import { FieldType } from "./booking-form";

type DateRangePickerProps = Readonly<{
    date?: DateRange;
    setDate?: Dispatch<SetStateAction<DateRange | undefined>>;
    // field?: FieldType;
    focusedField?: string;
    setFocusedField?: Dispatch<SetStateAction<string>>;
    className?: string;
    bookedDates?: DateRange[];
}>;

const fromMonth = new Date();
const toMonth = addMonths(new Date(), 6);

const DateRangePicker = ({
    // date,
    // setDate,
    // field,
    className,
    bookedDates
}: DateRangePickerProps) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [minimumDays, setMinimumDays] = useState<DateRange>({
        from: undefined,
        to: undefined
    });
    const [date, setDate] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined
    });

    useEffect(() => {
        if (!date) {
            return;
        }

        if (date.from && date.to) {
            setIsPopoverOpen(false);
            setMinimumDays({
                from: undefined,
                to: undefined
            });
            return;
        }

        if (date.from && !date.to) {
            setMinimumDays({
                from: addDays(date.from, 1),
                to: addDays(date.from, 1)
            });
        } else {
            setMinimumDays({
                from: undefined,
                to: undefined
            });
        }
    }, [date]);

    function formatDateRange(from: Date, to: Date | undefined) {
        const formattedFrom = format(from, 'LLL dd, y');
        return to
            ? `${formattedFrom} - ${format(to, 'LLL dd, y')}`
            : formattedFrom;
    }

    const getDateText = useCallback(
        (/*field: FieldType | undefined,*/ date: DateRange | undefined) => {
            // if (field?.value) {
            //   const { from, to } = field.value;
            //   return from ? formatDateRange(from, to) : "Departure / Return";
            // }

            if (date) {
                const { from, to } = date;
                return from ? formatDateRange(from, to) : 'Departure / Return';
            }

            return 'Departure / Return';
        },
        []
    );

    const checkIfBookingAvailable = useCallback(
        ({ from, to }: DateRange): boolean => {
            let isAvailable = true;
            if (bookedDates) {
                bookedDates.forEach((bookedDate) => {
                    if (
                        !(
                            bookedDate.from &&
                            bookedDate.to &&
                            from &&
                            to &&
                            isWithinInterval(bookedDate.from, {
                                start: from,
                                end: to
                            }) &&
                            isWithinInterval(bookedDate.to, {
                                start: from,
                                end: to
                            })
                        )
                    ) {
                        return;
                    }
                    isAvailable = false;
                });
            }
            return isAvailable;
        },
        [bookedDates]
    );

    const updateDate = useCallback(
        (day: Date): void => {
            if (setDate) {
                setDate((prev) => {
                    if (prev?.from && isEqual(prev.from, day)) {
                        return { from: undefined, to: undefined };
                    }

                    if (prev?.to) {
                        return { from: day, to: undefined };
                    } else if (prev?.from && isBefore(prev?.from, day)) {
                        return checkIfBookingAvailable({
                            from: prev?.from,
                            to: day
                        })
                            ? { from: prev?.from, to: day }
                            : { from: day, to: undefined };
                    } else {
                        return { from: day, to: undefined };
                    }
                });
            }

            // if (!field) {
            //   return;
            // }
            // const updateMinimumDaysAndResetToDate = () => {
            //   setMinimumDays({ from: addDays(day, 1), to: addDays(day, 1) });
            //   field.onChange({ from: day, to: undefined });
            // };

            // if (field.value.from && isEqual(field.value.from, day)) {
            //   field.onChange({ from: undefined, to: undefined });
            //   setMinimumDays({
            //     from: undefined,
            //     to: undefined,
            //   });
            //   return;
            // }

            // if (field.value.to) {
            //   updateMinimumDaysAndResetToDate();
            // } else if (field.value.from && isBefore(field.value.from, day)) {
            //   if (checkIfBookingAvailable({ from: field.value.from, to: day })) {
            //     setIsPopoverOpen(false);
            //     field.onChange({ from: field.value.from, to: day });
            //     setMinimumDays({ from: undefined, to: undefined });
            //   } else {
            //     updateMinimumDaysAndResetToDate();
            //   }
            // } else {
            //   updateMinimumDaysAndResetToDate();
            // }
        },
        [setDate, /*field,*/ checkIfBookingAvailable]
    );

    const handleOpenChange = useCallback(
        (value: boolean) => {
            setIsPopoverOpen(value);
        },
        [setIsPopoverOpen]
    );

    const disabled = useMemo(
        () => [
            {
                before: new Date()
            },
            minimumDays,
            ...(bookedDates ?? [])
        ],
        [minimumDays, bookedDates]
    );

    return (
        <Popover open={isPopoverOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'w-full pl-3 text-left',
                        date?.from /*|| field?.value.from*/
                            ? ''
                            : 'text-muted-foreground',
                        className
                    )}
                >
                    <span className="pt-1">{getDateText(/*field,*/ date)}</span>
                    <CalendarIcon className="ml-auto size-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                    autoFocus
                    mode="range"
                    defaultMonth={date?.from /*|| field?.value?.from*/}
                    selected={
                        date /*|| {
              from: field?.value?.from,
              to: field?.value?.to,
            }*/
                    }
                    numberOfMonths={2}
                    showOutsideDays={false}
                    startMonth={fromMonth}
                    endMonth={toMonth}
                    onSelect={(_date, day) => updateDate(day)}
                    disabled={disabled}
                />
            </PopoverContent>
        </Popover>
    );
};

const areEqual = (
    prevProps: DateRangePickerProps,
    nextProps: DateRangePickerProps
) => {
    return (
        prevProps?.date === nextProps.date &&
        // prevProps?.field === nextProps.field &&
        prevProps?.focusedField === nextProps.focusedField &&
        prevProps?.bookedDates === nextProps.bookedDates &&
        prevProps?.className === nextProps.className
    );
};

export default memo(DateRangePicker, areEqual);
