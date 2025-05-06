"use client";

import { Command as CommandPrimitive } from "cmdk";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import useSWR from "swr";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandList
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/useDebounce";
import { fetcher } from "@/utils/fetcher";
import { FormMessages } from "@/components/form/FormMessages";
import { CommonProps } from "@/types/autocomplete";
import { cn } from "@/lib/utils";

const AddressAutoCompleteInput = (props: CommonProps) => {
    const {
        setSelectedPlaceId,
        selectedPlaceId,
        showInlineError,
        searchInput,
        setSearchInput,
        placeholder
    } = props;

    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            close();
        }
    };

    const debouncedSearchInput = useDebounce(searchInput, 500);

    const { data, isLoading } = useSWR(
        // For real use case: /api/address/autocomplete?input=${debouncedSearchInput}
        // `/api/address/mock-autocomplete?input=${debouncedSearchInput}`,
        `/api/address/autocomplete?input=${debouncedSearchInput}`,
        fetcher
    );

    const predictions = data?.data || [];

    return (
        <Command
            shouldFilter={false}
            onKeyDown={handleKeyDown}
            className={cn("h-auto overflow-visible")}
        >
            <div className="flex w-full items-center justify-between rounded-lg border bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <CommandPrimitive.Input
                    value={searchInput}
                    onValueChange={setSearchInput}
                    onBlur={close}
                    onFocus={open}
                    placeholder={placeholder || "Enter address"}
                    // className="h-14 w-full rounded-lg p-3 outline-hidden"
                    className="block h-14 w-full rounded-lg border-neutral-200 bg-white px-5"
                />
            </div>
            {searchInput !== "" &&
                !isOpen &&
                !selectedPlaceId &&
                showInlineError && (
                    <FormMessages
                        type="error"
                        className="pt-1 text-sm"
                        messages={["Select a valid address from the list"]}
                    />
                )}

            {isOpen && (
                <div className="relative h-auto animate-in fade-in-0 zoom-in-95">
                    <CommandList>
                        <div className="absolute top-1.5 z-50 w-full">
                            <CommandGroup className="relative z-50 h-auto min-w-[8rem] overflow-hidden rounded-md border bg-background shadow-md">
                                {isLoading ? (
                                    <div className="flex h-28 items-center justify-center">
                                        <Loader2 className="size-6 animate-spin" />
                                    </div>
                                ) : (
                                    <>
                                        {predictions.map(
                                            (prediction: {
                                                placePrediction: {
                                                    placeId: string;
                                                    place: string;
                                                    text: { text: string };
                                                };
                                            }) => (
                                                <CommandPrimitive.Item
                                                    value={
                                                        prediction
                                                            .placePrediction
                                                            .text.text
                                                    }
                                                    onSelect={() => {
                                                        setSearchInput("");
                                                        setSelectedPlaceId(
                                                            prediction
                                                                .placePrediction
                                                                .place
                                                        );
                                                    }}
                                                    className="flex h-max cursor-pointer select-text flex-col items-start gap-0.5 rounded-md p-2 px-3 hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
                                                    key={
                                                        prediction
                                                            .placePrediction
                                                            .placeId
                                                    }
                                                    onMouseDown={(e) =>
                                                        e.preventDefault()
                                                    }
                                                >
                                                    {
                                                        prediction
                                                            .placePrediction
                                                            .text.text
                                                    }
                                                </CommandPrimitive.Item>
                                            )
                                        )}
                                    </>
                                )}

                                <CommandEmpty>
                                    {!isLoading && predictions.length === 0 && (
                                        <div className="flex items-center justify-center py-4">
                                            {searchInput === ""
                                                ? "Please enter an address"
                                                : "No address found"}
                                        </div>
                                    )}
                                </CommandEmpty>
                            </CommandGroup>
                        </div>
                    </CommandList>
                </div>
            )}
        </Command>
    );
};

export default AddressAutoCompleteInput;
