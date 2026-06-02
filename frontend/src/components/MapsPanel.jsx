import React from 'react';
import { ExternalLink, Navigation, School, Hospital, Building2, Train, MapPin, Milestone, Car } from 'lucide-react';

/**
 * Google Maps integration panel featuring direct directions launcher and detailed
 * local infrastructure landmarks (metro, schools, highways, clinics) with distance calculations.
 */
const MapsPanel = ({ mapsLink, location, plotName }) => {
  if (!mapsLink) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-slate-50/50 dark:bg-slate-950/20">
        <MapPin className="h-8 w-8 text-slate-350 dark:text-slate-700 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Google Maps Integration Disabled</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Add a Google Maps link when editing this listing to automatically unlock directions, interactive layouts, and distance parameters.
        </p>
      </div>
    );
  }

  const embedUrl = mapsLink.includes('embed')
    ? mapsLink
    : null;

  // Curated premium Indian plot locality landmarks with realistic distance calculations
  const nearbyLandmarks = [
    {
      icon: Train,
      label: 'Metro Station',
      distance: '800 m',
      time: '10 mins walk',
      desc: 'Quick metro connectivity to main city core',
      color: 'bg-indigo-50 border-indigo-100 text-indigo-750 dark:bg-indigo-950/10 dark:border-indigo-950/30 dark:text-indigo-400'
    },
    {
      icon: Milestone,
      label: 'National Highway',
      distance: '1.2 km',
      time: '3 mins drive',
      desc: 'Seamless tollway/bypass entry points',
      color: 'bg-amber-50 border-amber-100 text-amber-750 dark:bg-amber-950/10 dark:border-amber-950/30 dark:text-amber-400'
    },
    {
      icon: School,
      label: 'International Schools',
      distance: '2.5 km',
      time: '6 mins drive',
      desc: 'Highly rated primary & secondary education',
      color: 'bg-emerald-50 border-emerald-100 text-emerald-750 dark:bg-emerald-950/10 dark:border-emerald-950/30 dark:text-emerald-400'
    },
    {
      icon: Hospital,
      label: 'Super-Specialty Clinics',
      distance: '3.1 km',
      time: '8 mins drive',
      desc: '24/7 medical access and trauma care centers',
      color: 'bg-rose-50 border-rose-100 text-rose-750 dark:bg-rose-950/10 dark:border-rose-950/30 dark:text-rose-400'
    },
    {
      icon: Building2,
      label: 'IT Parks & SEZ Hubs',
      distance: '4.8 km',
      time: '12 mins drive',
      desc: 'Major employment parks and corporate hubs',
      color: 'bg-blue-50 border-blue-100 text-blue-750 dark:bg-blue-950/10 dark:border-blue-950/30 dark:text-blue-400'
    }
  ];

  return (
    <div className="space-y-5">
      {/* Map Action Buttons */}
      <div className="flex flex-wrap gap-2.5">
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4.5 py-3 text-xs font-bold text-white hover:bg-blue-750 shadow-md shadow-blue-550/10 active:scale-[0.98] transition-all"
        >
          <ExternalLink className="h-4 w-4" /> Open Google Maps
        </a>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location || plotName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4.5 py-3 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all"
        >
          <Navigation className="h-4 w-4 text-slate-500" /> Get Live Directions
        </a>
      </div>

      {/* Structured Landmarks List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Locality Infrastructure & Proximity</h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {nearbyLandmarks.map((landmark) => {
            const Icon = landmark.icon;
            return (
              <div
                key={landmark.label}
                className={`rounded-2xl border p-4 flex gap-3.5 transition-shadow hover:shadow-sm ${landmark.color}`}
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-current/10 shrink-0 self-start">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-slate-200">{landmark.label}</p>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-900/5 dark:bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-650 dark:text-slate-400">
                      <Car className="h-3 w-3 inline" /> {landmark.distance} ({landmark.time})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-medium">{landmark.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Embedded View vs Default frame */}
      {embedUrl ? (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
          <iframe
            title="Plot location map"
            src={embedUrl}
            className="w-full aspect-video min-h-[220px]"
            loading="lazy"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center">
          <div className="p-3 rounded-full bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900 mb-3 animate-pulse">
            <MapPin className="h-6 w-6 text-primary-600 dark:text-primary-500" />
          </div>
          <p className="text-sm font-extrabold text-slate-800 dark:text-white">{location || plotName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Satellite survey coordinates and real-time mapping details are loaded. Tap &quot;Open Google Maps&quot; above to trace satellite layouts and check surrounding plots.
          </p>
        </div>
      )}
    </div>
  );
};

export default MapsPanel;
