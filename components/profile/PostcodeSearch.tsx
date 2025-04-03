'use client';

import { useState, useEffect, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { useFormContext } from 'react-hook-form';

import { Input } from '@/components/ui/input';

export default function PostcodeSearch() {
    const { setValue, getValues } = useFormContext();
    const defaultLocation = {
        postcode: getValues('postcode'),
        city: getValues('city'),
        state: getValues('state')
    };

    // const [query, setQuery] = useState('');
    const [query, setQuery] = useState(
        `${defaultLocation.city} - ${defaultLocation.postcode} (${defaultLocation.state})`
    );
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Function to fetch postcode/suburb data
    const fetchPostcodes = async (searchTerm: string) => {
        if (!searchTerm) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_APP_URL}/api/postcode-search?q=${searchTerm}`
            );
            const data = await res.json();

            if (res.ok) {
                setResults(data.localities?.locality || []);
                setShowSuggestions(true);
            } else {
                setError(data.error || 'No results found');
                setResults([]);
            }
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    // Memoized debounce function
    const debouncedFetch = useMemo(() => debounce(fetchPostcodes, 500), []);

    // Handle input changes with debouncing
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length > 2) {
            debouncedFetch(value);
        } else {
            setResults([]);
            setShowSuggestions(false);
        }
    };

    useEffect(() => {
        fetchPostcodes(query);
    }, []);

    // Cleanup debounce function on unmount
    useEffect(() => {
        return () => {
            debouncedFetch.cancel();
        };
    }, [debouncedFetch]);

    // Handle selection of a suggestion
    const handleSelect = (item: any) => {
        setQuery(`${item.location} - ${item.postcode} (${item.state})`);
        setShowSuggestions(false);
        setValue('postcode', item.postcode.toString());
        setValue('city', item.location);
        setValue('state', item.state);
    };

    return (
        <div>
            <Input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Enter postcode or suburb"
            />

            {loading && <p className="text-gray-500 mt-2">Searching...</p>}
            {error && <p className="text-red-500 mt-2">{error}</p>}

            {/* Display autosuggestions */}
            {showSuggestions && results.length > 0 && (
                <ul className="mt-2 border rounded shadow-md bg-white absolute z-10">
                    {Array.isArray(results) ? (
                        results.map((item: any, index: number) => (
                            <li
                                key={index}
                                className="p-2 hover:bg-gray-200 cursor-pointer"
                                onClick={() => handleSelect(item)}
                            >
                                {item.location} - {item.postcode} ({item.state})
                            </li>
                        ))
                    ) : (
                        <li className="p-2">No results found</li>
                    )}
                </ul>
            )}
        </div>
    );
}
