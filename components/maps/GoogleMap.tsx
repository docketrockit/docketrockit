'use client';
import { Map, Marker } from '@vis.gl/react-google-maps';
import React from 'react';

interface GoogleMapProps {
    lat: number;
    lng: number;
    defaultZoom?: number;
    className?: string;
}

const GoogleMap = ({
    lat,
    lng,
    defaultZoom = 7,
    className
}: GoogleMapProps) => {
    return (
        <div className="w-full">
            <Map
                defaultZoom={defaultZoom}
                defaultCenter={{ lat, lng }}
                gestureHandling={'cooperative'}
                disableDefaultUI={false}
                className={className}
            >
                <Marker position={{ lat, lng }} />
            </Map>
        </div>
    );
};

export default GoogleMap;
