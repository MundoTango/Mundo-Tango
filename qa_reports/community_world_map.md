# Community World Map QA Audit  
## Overview  
- The Global Tango Community page provides a world map with markers representing cities where tango communities exist.  
- A hero section displays metrics such as Cities, Members, Active Events, Recommendations, and Housing.  

## Functionality & Navigation  
- The sidebar highlights the Community section with the globe icon active.  
- The interactive map allows users to click on city markers to view a city card with details and a **View Details** button.  
- The city card shows an image, city name, country, and counts for Members, Events, Recs, and Housing.  

## Observations  
- ✅ Hero section metrics are clear and provide quick insights (e.g., 12 cities across 6 countries, 5 worldwide dancers, 261 active events this month).  
- ✅ Clicking a marker opens a city card overlay with stats and a close option; this shows the feature is working.  
- ✅ The map uses Leaflet and CARTO tiles, with zoom controls, and markers are well-spaced across the globe.  

## Issues & Recommendations  
- ⚠️ **Layer toggles missing**: The page copy mentions "toggle layers to filter by type," but no layer toggle UI is visible. Add controls to filter markers by type (e.g., events, members, housing).  
- ⚠️ **Empty states**: Some stats in the city card show zero values. Consider hiding zero categories or displaying a message explaining that there are no items yet.  
- ⚠️ **Accessibility**: Ensure map markers and buttons are keyboard‑navigable and have descriptive ARIA labels.  
- ⚠️ **Performance**: On slow connections the map may load markers slowly. Introduce loading indicators or skeletons while data loads and consider clustering markers to improve performance.  

## Summary of Fixes & Technical Recommendations  
- Implement visible layer‑filter controls for the interactive map consistent with MB.MD pattern guidelines for interactive components.  
- Provide skeleton loaders or spinners while fetching map data, and display a message when no markers are available.  
- Add ARIA labels and keyboard navigation to map markers and overlay buttons to meet accessibility standards.  
- Optimize map performance by clustering markers and lazy loading city details, leveraging caching where possible. 
