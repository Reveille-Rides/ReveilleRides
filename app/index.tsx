import { useEffect, useRef } from 'react';
import { View, Appearance } from 'react-native';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import useAppStore from './data/app_state';
import MapView from './components/map/MapView';
import RoutesList from './components/sheets/RoutesList';
import AlertList from './components/sheets/AlertList';
import AlertDetail from "./components/sheets/AlertDetail";
import RouteDetails from './components/sheets/RouteDetails';
import StopTimetable from './components/sheets/StopTimetable';
import Settings from './components/sheets/Settings';
import { darkMode, lightMode } from './theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getColorScheme } from './utils';
import InputRoute from './components/sheets/route_planning/InputRoute';
import TripPlanDetail from './components/sheets/route_planning/TripPlanDetail';

const Home = () => {
    const setPresentSheet = useAppStore((state) => state.setPresentSheet);
    const setTheme = useAppStore((state) => state.setTheme);   

    const routesListSheetRef = useRef<BottomSheetModal>(null);
    const alertListSheetRef = useRef<BottomSheetModal>(null);
    const alertDetailSheetRef = useRef<BottomSheetModal>(null);
    const routeDetailSheetRef = useRef<BottomSheetModal>(null);
    const stopTimetableSheetRef = useRef<BottomSheetModal>(null);
    const settingsSheetRef = useRef<BottomSheetModal>(null);

    // Route Planning
    const inputRouteSheetRef = useRef<BottomSheetModal>(null);
    const tripPlanDetailSheetRef = useRef<BottomSheetModal>(null);

    setPresentSheet((sheet) => {
        switch (sheet) {
            case "alerts":
                alertListSheetRef.current?.present();
                break;
            case "routeDetails":
                routeDetailSheetRef.current?.present();
                break;
            case "stopTimetable":
                stopTimetableSheetRef.current?.present();
                break;
            case "settings":
                settingsSheetRef.current?.present();
                break;
            case "alertsDetail":
                alertDetailSheetRef.current?.present();
                break;
            case "inputRoute":
                inputRouteSheetRef.current?.present();
                break;
            case "tripPlanDetail":
                tripPlanDetailSheetRef.current?.present();
                break;
            default:
                break;
        }
    })

    // set the theme based on the user's preference
    // Show the routes list sheet on app start
    useEffect(() => {
        getColorScheme().then((newTheme) => {
            const t = newTheme == "dark" ? darkMode : lightMode
            
            setTheme(t);
            Appearance.setColorScheme(t.mode);
        })

        routesListSheetRef.current?.present();
    }, [])

    const queryClient = new QueryClient()

    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                    <View style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <MapView />

                        <Settings sheetRef={settingsSheetRef} />
                        <RouteDetails sheetRef={routeDetailSheetRef} />
                        <RoutesList sheetRef={routesListSheetRef} />
                        <AlertList sheetRef={alertListSheetRef} />
                        <AlertDetail sheetRef={alertDetailSheetRef} />
                        <StopTimetable sheetRef={stopTimetableSheetRef} />

                        {/* Route Planning */}
                        <InputRoute sheetRef={inputRouteSheetRef} />
                        <TripPlanDetail sheetRef={tripPlanDetailSheetRef} />
                    </View>
                </BottomSheetModalProvider>
            </GestureHandlerRootView>
        </QueryClientProvider>
    )
}

export default Home;