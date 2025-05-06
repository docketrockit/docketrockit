export interface AddressType {
    address1: string;
    address2: string;
    formattedAddress: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    lat: number;
    lng: number;
    countryCode: string;
}

export interface AddressAutoCompleteProps {
    address: AddressType;
    setAddress: (address: AddressType) => void;
    searchInput: string;
    setSearchInput: (searchInput: string) => void;
    showInlineError?: boolean;
    placeholder?: string;
}

export interface CommonProps {
    selectedPlaceId: string;
    setSelectedPlaceId: (placeId: string) => void;
    showInlineError?: boolean;
    searchInput: string;
    setSearchInput: (searchInput: string) => void;
    placeholder?: string;
}

export interface AddressFormProps {
    address: AddressType;
}

export interface AddressFields {
    address1?: string;
    address2?: string;
    city?: string;
    region?: string;
    postalCode?: string;
}
