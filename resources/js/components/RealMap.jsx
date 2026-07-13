// Reálna mapa sveta (Leaflet + OpenStreetMap, svetlý CARTO podklad v štýle appky)
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Pin v dizajne appky — zelený bod so svetlým stredom a jemným kruhom okolo
const pinIcon = (active = false) => L.divIcon({
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    html: `
      <div style="
        width:26px;height:26px;border-radius:50%;
        background:rgba(45,90,61,${active ? 0.28 : 0.16});
        display:grid;place-items:center;
      ">
        <div style="
          width:${active ? 14 : 11}px;height:${active ? 14 : 11}px;border-radius:50%;
          background:#2d5a3d;display:grid;place-items:center;
          box-shadow:0 1px 4px rgba(20,30,22,0.35);
        ">
          <div style="width:3.5px;height:3.5px;border-radius:50%;background:#fafaf7;"></div>
        </div>
      </div>`,
});

/**
 * markers: [{ lat, lng, label, active, onClick }]
 * Bez center/zoom sa mapa nastaví podľa markerov (fitBounds).
 */
export default function RealMap({ markers = [], center, zoom, height = 220, style = {} }) {
    const elRef = useRef(null);
    const mapRef = useRef(null);
    const layerRef = useRef(null);

    useEffect(() => {
        const map = L.map(elRef.current, {
            zoomControl: false,
            scrollWheelZoom: false,
            attributionControl: true,
            zoomSnap: 0.5,
        });
        L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 18 }).addTo(map);
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        map.attributionControl.setPrefix(false);

        mapRef.current = map;
        layerRef.current = L.layerGroup().addTo(map);

        // Kontajner sa objavuje v animovanom overlayi — prepočítať rozmery po vykreslení
        const t = setTimeout(() => map.invalidateSize(), 320);

        return () => {
            clearTimeout(t);
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        const layer = layerRef.current;
        if (!map || !layer) return;

        layer.clearLayers();
        markers.forEach(m => {
            const marker = L.marker([m.lat, m.lng], {
                icon: pinIcon(m.active),
                keyboard: false,
                title: m.label || '',
            });
            if (m.onClick) marker.on('click', m.onClick);
            layer.addLayer(marker);
        });

        if (center) {
            map.setView(center, zoom ?? 5);
        } else if (markers.length > 1) {
            map.fitBounds(L.latLngBounds(markers.map(m => [m.lat, m.lng])), { padding: [30, 30] });
        } else if (markers.length === 1) {
            map.setView([markers[0].lat, markers[0].lng], zoom ?? 5);
        } else {
            map.setView([48.7, 19.7], 4);
        }
    }, [JSON.stringify(markers.map(m => [m.lat, m.lng, m.active])), center?.[0], center?.[1], zoom]);

    return (
        <div ref={elRef} style={{
            height,
            width: '100%',
            background: 'var(--line-soft)',
            ...style,
        }} />
    );
}
