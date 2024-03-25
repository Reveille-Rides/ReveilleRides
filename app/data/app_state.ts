import { create } from "zustand";
import { IMapRoute, IMapServiceInterruption, IOptionDetail, IStop, SearchSuggestion } from "../../utils/interfaces";
import { Theme, lightMode } from "../theme";

interface AppState {
    theme: Theme,
    setTheme: (theme: Theme) => void

    drawnRoutes: IMapRoute[],
    setDrawnRoutes: (routes: IMapRoute[]) => void

    selectedRoute: IMapRoute | null,
    setSelectedRoute: (selectedRoute: IMapRoute) => void,
    clearSelectedRoute: () => void,

    selectedRouteDirection: string | null,
    setSelectedRouteDirection: (selectedRouteDirection: string | null) => void,

    selectedRouteCategory: "favorites" | "all",
    setSelectedRouteCategory: (selectedRouteCategory: "favorites" | "all") => void

    selectedStop: IStop | null,
    setSelectedStop: (selectedStop: IStop | null) => void,
    
    // TODO: Switch to Provider Functions
    presentSheet: (sheet: "routeDetails" | "alerts" | "stopTimetable" | "settings" | "alertsDetail" | "inputRoute" | "tripPlanDetail") => void
    setPresentSheet: (presentSheet: (sheet: "routeDetails" | "alerts" | "stopTimetable" | "settings" | "alertsDetail" | "inputRoute" | "tripPlanDetail") => void) => void

    selectedAlert: IMapServiceInterruption | null,
    setSelectedAlert: (selectedAlert: IMapServiceInterruption | null) => void

    selectedTimetableDate: Date | null,
    setSelectedTimetableDate: (selectedTimetableDate: Date | null) => void

    // TODO: Switch to Context Provider Functions
    zoomToStopLatLng: (lat: number, lng: number) => void
    setZoomToStopLatLng: (zoomToStopLatLng: (lat: number, lng: number) => void) => void

    poppedUpStopCallout: IStop | null,
    setPoppedUpStopCallout: (poppedUpStopCallout: IStop | null) => void

    scrollToStop: (stop: IStop) => void
    setScrollToStop: (scrollToStop: (stop: IStop) => void) => void

    // route planning
    suggestions: SearchSuggestion[]
    setSuggestions: (suggestions: SearchSuggestion[]) => void

    suggestionOutput: "start" | "end" | null
    setSuggestionOutput: (suggestionOutput: "start" | "end" | null) => void

    selectedRoutePlan: IOptionDetail | null,
    setSelectedRoutePlan: (selectedRoutePlan: IOptionDetail | null) => void
}

const useAppStore = create<AppState>()((set) => ({

    theme: lightMode,
    setTheme: (theme) => set(() => ({ theme })),

    drawnRoutes: [],
    setDrawnRoutes: (routes) => set(() => ({ drawnRoutes: routes })),
    
    selectedRoute: null,
    setSelectedRoute: (selectedRoute) => set(() => ({ selectedRoute })),
    clearSelectedRoute: () => set(() => ({ selectedRoute: null })),

    selectedRouteDirection: null,
    setSelectedRouteDirection: (selectedRouteDirection) => set(() => ({ selectedRouteDirection: selectedRouteDirection })),

    selectedRouteCategory: 'all',
    setSelectedRouteCategory: (selectedRouteCategory) => set(() => ({ selectedRouteCategory })),

    selectedStop: null,
    setSelectedStop: (selectedStop) => set(() => ({ selectedStop })),

    selectedTimetableDate: null,
    setSelectedTimetableDate: (selectedTimetableDate) => set(() => ({ selectedTimetableDate })),

    presentSheet: (sheet) => {console.log(sheet)},
    setPresentSheet: (presentSheet) => set(() => ({ presentSheet })),

    selectedAlert: null,
    setSelectedAlert: (selectedAlert) => set(() => ({ selectedAlert })),
    
    zoomToStopLatLng: (lat, lng) => {console.log(lat + " " + lng)},
    setZoomToStopLatLng: (zoomToStopLatLng) => set(() => ({ zoomToStopLatLng })),

    poppedUpStopCallout: null,
    setPoppedUpStopCallout: (poppedUpStopCallout) => set(() => ({ poppedUpStopCallout })),

    scrollToStop: (stop) => {console.log(stop)},
    setScrollToStop: (scrollToStop) => set(() => ({ scrollToStop: scrollToStop })),

    // route planning
    suggestions: [],
    setSuggestions: (suggestions) => set(() => ({ suggestions })),

    suggestionOutput: null,
    setSuggestionOutput: (suggestionOutput) => set(() => ({ suggestionOutput })),

    selectedRoutePlan: null,
    setSelectedRoutePlan: (selectedRoutePlan) => set(() => ({ selectedRoutePlan })),
}));

export default useAppStore;