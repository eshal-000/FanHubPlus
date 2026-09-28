import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import { EVENT_TYPE_STYLES, eventStatus } from "@/utils/eventHelpers";

const GLYPHS = {
  "cosplay-meetup": `<mask d="M4 3h16v10a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6V3z" fill="#FFF3DE"/><circle cx="9" cy="9" r="1.4" fill="#230018"/><circle cx="15" cy="9" r="1.4" fill="#230018"/>`,
  screening: `<g fill="none" stroke="#FFF3DE" stroke-width="1.6"><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="1.6" fill="#FFF3DE" stroke="none"/><circle cx="12" cy="7" r="1.2" fill="#FFF3DE" stroke="none"/><circle cx="12" cy="17" r="1.2" fill="#FFF3DE" stroke="none"/><circle cx="7" cy="12" r="1.2" fill="#FFF3DE" stroke="none"/><circle cx="17" cy="12" r="1.2" fill="#FFF3DE" stroke="none"/></g>`,
  convention: `<path d="M12 3l2.5 6.2 6.5.4-5 4.2 1.6 6.4L12 16.8 6.4 20.2 8 13.8 3 9.6l6.5-.4L12 3z" fill="#230018"/>`,
  premiere: `<path d="M4 5h16v14H4z" fill="none" stroke="#FFF3DE" stroke-width="1.6"/><path d="M4 9h16M8 5v4M16 5v4" stroke="#FFF3DE" stroke-width="1.6" fill="none"/>`,
};

function makePin(event) {
  const style = EVENT_TYPE_STYLES[event.eventType] || EVENT_TYPE_STYLES.convention;
  const accent =
    event.eventType === "convention" ? "#FFE347" :
    event.eventType === "screening" ? "#FFF3DE" :
    event.eventType === "premiere" ? "#FF006B" : "#FF006B";

  const glyph = GLYPHS[event.eventType] || GLYPHS.convention;
  const label = statusLabel(event);
  const badgeColor =
    label === "Past" ? "#99004D" : label === "Live Now" ? "#FF006B" : "#FFE347";

  return L.divIcon({
    className: "fanhub-pin",
    html: `
      <div style="position:relative;transform:translate(-50%,-100%);">
        <div style="
          width:34px;height:34px;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          background:${accent};
          border:2px solid #230018;
          box-shadow:0 0 14px rgba(255,0,107,.4);
          display:flex;align-items:center;justify-content:center;
        ">
          <span style="transform:rotate(45deg);display:flex;">${svg(glyph, 18)}</span>
        </div>
        ${label !== "TBA" ? `<span style="
          position:absolute;top:-9px;right:-9px;
          min-width:15px;height:15px;border-radius:9999px;
          background:${badgeColor};border:1.5px solid #230018;
        "></span>` : ""}
      </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -36],
  });
}

function svg(inner, size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

function statusLabel(event) {
  const s = eventStatus(event);
  return s.key === "live" ? "Live Now" : s.label;
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
}

export default function EventMap({ events = [], activeId = null, onSelect, height = "420px" }) {
  const points = useMemo(
    () =>
      events
        .map((e) => {
          const lat = e.lat ?? e.location?.coordinates?.[1];
          const lng = e.long ?? e.lng ?? e.location?.coordinates?.[0];
          return Number.isFinite(+lat) && Number.isFinite(+lng)
            ? { id: e._id, pos: [+lat, +lng], event: e }
            : null;
        })
        .filter(Boolean),
    [events]
  );

  const center = points.length ? points[0].pos : [20, 0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden rounded-2xl border border-[var(--border)] shadow-[0_0_20px_var(--glow)]"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds points={points.map((p) => p.pos)} />

        {points.map((p) => (
          <Marker
            key={p.id}
            position={p.pos}
            icon={makePin(p.event)}
            eventHandlers={{ click: () => onSelect?.(p.event) }}
          >
            <Popup>
              <strong>{p.event.title}</strong>
              <br />
              {p.event.city || ""}
              <br />
              <a href={`/events/${p.event._id}`}>View event →</a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </motion.div>
  );
}
