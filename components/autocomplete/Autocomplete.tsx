"use client";

import { useState } from "react";

import { AddressType } from "@/types/autocomplete";
import AddressAutoComplete from "./AddressAutoComplete";

const Autocomplete = ({ addressData }: { addressData?: AddressType }) => {
    const [address, setAddress] = useState<AddressType>(
        addressData || {
            address1: "",
            address2: "",
            formattedAddress: "",
            city: "",
            region: "",
            postalCode: "",
            country: "",
            lat: 0,
            lng: 0,
            countryCode: ""
        }
    );
    const [searchInput, setSearchInput] = useState("");
    return (
        <AddressAutoComplete
            address={address}
            setAddress={setAddress}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
        />
    );
};

export default Autocomplete;
