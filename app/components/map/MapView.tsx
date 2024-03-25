import React, { useEffect, useRef, useState } from "react";
import { Dimensions, TouchableOpacity, View } from "react-native";
import MapView, { LatLng, Polyline, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { IMapRoute } from "../../../utils/interfaces";
import useAppStore from "../../data/app_state";
import BusMarker from "./markers/BusMarker";
import StopMarker from "./markers/StopMarker";
import { useVehicles } from "../../data/api_query";
import { FontAwesome6 } from "@expo/vector-icons";

const Map: React.FC = () => {
    const mapViewRef = useRef<MapView>(null);
    const setSelectedDirection = useAppStore(state => state.setSelectedRouteDirection);
    const selectedRoute = useAppStore((state) => state.selectedRoute);
    const setSelectedRoute = useAppStore((state) => state.setSelectedRoute);
    const setDrawnRoutes = useAppStore((state) => state.setDrawnRoutes);
    const presentSheet = useAppStore((state) => state.presentSheet);
    const drawnRoutes = useAppStore((state) => state.drawnRoutes);
    const setZoomToStopLatLng = useAppStore((state) => state.setZoomToStopLatLng);
    const selectedRouteDirection = useAppStore(state => state.selectedRouteDirection);
    const theme = useAppStore((state) => state.theme);
    const poppedUpStopCallout = useAppStore((state) => state.poppedUpStopCallout);

    const [isViewCenteredOnUser, setIsViewCenteredOnUser] = useState(false);

    const { data: buses } = useVehicles(selectedRoute?.key ?? "");

    const defaultMapRegion: Region = {
        latitude: 30.6060,
        longitude: -96.3462,
        latitudeDelta: 0.10,
        longitudeDelta: 0.01
    };


    
    function selectRoute(route: IMapRoute, directionKey: string) {

        if (selectedRouteDirection !== directionKey) setSelectedDirection(directionKey);

        if (selectedRoute?.key === route.key) return;

        setSelectedRoute(route);
        setDrawnRoutes([route]);
        presentSheet("routeDetails");
        
    }

    // center the view on the drawn routes
    useEffect(() => {
        centerViewOnRoutes();
    }, [drawnRoutes]);

    // handle weird edge case where map does not pick up on the initial region
    useEffect(() => {
        mapViewRef.current?.animateToRegion(defaultMapRegion);

        setZoomToStopLatLng((lat, lng) => {
            // Animate map to the current location
            const region = {
                latitude: lat - .002,
                longitude: lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005
            };

            mapViewRef.current?.animateToRegion(region, 250);
        })

    }, []);



    const centerViewOnRoutes = () => {
        let coords: LatLng[] = [];

        if (selectedRoute) {
            selectedRoute.patternPaths.forEach((path) => {
                path.patternPoints.forEach((point) => {
                    coords.push({
                        latitude: point.latitude,
                        longitude: point.longitude,
                    });
                });
            });
        }

        drawnRoutes.forEach((route) => {
            route.patternPaths.forEach((path) => {
                path.patternPoints.forEach((point) => {
                    coords.push({
                        latitude: point.latitude,
                        longitude: point.longitude
                    });
                })
            })
        });

        if (coords.length > 0) {
            mapViewRef.current?.fitToCoordinates(coords, {
                edgePadding: {
                    top: Dimensions.get("window").height * 0.05,
                    right: 20,
                    bottom: Dimensions.get("window").height * 0.45 + 8,
                    left: 20
                },
                animated: true
            });
        }

        setIsViewCenteredOnUser(false);
    }

    const recenterView = async () => {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync()

        // Check if permission is granted
        if (status !== 'granted') { return };

        // Get current location
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced, timeInterval: 2 });

        // Animate map to the current location
        const region = {
            latitude: location.coords.latitude - .002,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
        };

        mapViewRef.current?.animateToRegion(region, 250);

        setIsViewCenteredOnUser(true);
    }

    return (
        <>
            <MapView
                showsUserLocation={true}
                style={{ width: "100%", height: "100%", zIndex: 100, elevation: 100 }}
                ref={mapViewRef} rotateEnabled={false}
                initialRegion={defaultMapRegion}
                onPanDrag={() => setIsViewCenteredOnUser(false)}
                showsMyLocationButton={false} // we have our own
                // userInterfaceStyle={colorScheme == "dark" ? "dark" : "light"}
            >
                {/* Route Polylines */}
                {drawnRoutes.map((drawnRoute) => {
                    const coordDirections: { [directionId: string]: LatLng[]; } = {};

                    drawnRoute.patternPaths.forEach((path) => {
                        path.patternPoints.forEach((point) => {
                            coordDirections[path.directionKey] = coordDirections[path.directionKey] ?? [];

                            coordDirections[path.directionKey]!.push({
                                latitude: point.latitude,
                                longitude: point.longitude,
                            })
                        })
                    })

                    const lineColor = drawnRoute.directionList[0]?.lineColor ?? "#FFFF";
                    
                    return (
                        Object.keys(coordDirections).map((directionId) => {
                            const active = directionId === selectedRouteDirection || selectedRouteDirection == null

                            return (
                                <Polyline
                                    key={`${directionId}`}
                                    coordinates={coordDirections[directionId] ?? []}
                                    strokeColor={active ? lineColor : lineColor + "60"}
                                    strokeWidth={5}
                                    tappable={true}
                                    onPress={() => selectRoute(drawnRoute, directionId)}
                                    style={{ zIndex: active ? 600 : 300,
                                             elevation: active ? 600 : 300 }}
                                />
                            )
                        })
                    ) 
                })}

                {/* Stops */}
                {selectedRoute && selectedRoute?.patternPaths.flatMap((patternPath, index1) => (
                    patternPath.patternPoints.map((patternPoint, index2) => {
                        const stop = patternPoint.stop

                        if (stop) {
                            return (
                                <StopMarker
                                    key={`${stop.stopCode}-${index1}-${index2}`}
                                    point={patternPoint}
                                    tintColor={selectedRoute?.directionList[0]?.lineColor ?? "#FFFF"}
                                    active={patternPath.directionKey === selectedRouteDirection}
                                    route={selectedRoute}
                                    direction={patternPath.directionKey}
                                    isCalloutShown={poppedUpStopCallout?.stopCode === stop.stopCode}
                                />
                            );
                        }

                        return null;
                    })
                ))}

                {/* Buses */}
                {selectedRoute && buses?.map((bus) => {
                    const color = selectedRoute.directionList[0]?.lineColor ?? "#500000"
                    return (
                        <BusMarker
                            key={bus.key}
                            bus={bus}
                            tintColor={color}
                            routeName={selectedRoute.shortName}
                        />
                    )
                })}
            </MapView>

            {/* map buttons */}
            <View
                style={{ 
                    top: 60, 
                    alignContent: 'center', 
                    justifyContent: 'center', 
                    position: 'absolute', 
                    right: 8, 
                    overflow: 'hidden', 
                    borderRadius: 8, 
                    backgroundColor: theme.background, 
                    padding: 12,
                    zIndex: 1000,
                }} 
            >
                <TouchableOpacity onPress={() => recenterView()}>
                    {isViewCenteredOnUser ?
                        <MaterialIcons name="my-location" size={24} color="gray" />
                        :
                        <MaterialIcons name="location-searching" size={24} color="gray" />
                    }
                </TouchableOpacity>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: theme.divider, marginVertical: 8, marginHorizontal: -2 }} />

                <TouchableOpacity onPress={() => presentSheet("inputRoute")}>
                    <FontAwesome6 name="diamond-turn-right" size={24} color="gray" />
                </TouchableOpacity>
            </View>
            
        </>
    )
}

export default Map;