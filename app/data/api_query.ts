import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TripPlan, findBusStops, findLocations, getAuthentication, getBaseData, getNextDepartureTimes, getPatternPaths, getStopEstimates, getStopSchedules, getTripPlan, getVehicles } from "aggie-spirit-api";
import { darkMode, lightMode } from "app/theme";
import { getColorScheme } from "app/utils";
import moment from "moment";
import { GetBaseDataResponseSchema, GetNextDepartTimesResponseSchema, GetPatternPathsResponseSchema, GetStopEstimatesResponseSchema, GetStopSchedulesResponseSchema, GetTripPlanResponseSchema, GetVehiclesResponseSchema, IFoundLocation, IFoundStop, IGetBaseDataResponse, IGetNextDepartTimesResponse, IGetPatternPathsResponse, IGetStopEstimatesResponse, IGetStopSchedulesResponse, IGetVehiclesResponse, IMapRoute, IMapServiceInterruption, IPatternPoint, IVehicle, SearchSuggestion } from "utils/interfaces";


export const useAuthToken = () => {
    const query = useQuery({
        queryKey: ["authToken"],
        queryFn: async () => {
            return await getAuthentication();
        },
        staleTime: Infinity
    });

    return query;
};

export const useBaseData = () => {
    const client = useQueryClient();

    const query = useQuery<IGetBaseDataResponse>({
        queryKey: ["baseData"],
        // @ts-ignore: We are modifying the baseData object to add patternPaths
        queryFn: async () => {
            const authToken: string = client.getQueryData(["authToken"])!;
            const baseData = await getBaseData(authToken);

            // go through each route and add a empty arrain on patternPaths
            // @ts-ignore: We are modifying the baseData object to add patternPaths
            baseData.routes.forEach(route => route.patternPaths = []);

            GetBaseDataResponseSchema.parse(baseData);

            return baseData;
        },
        enabled: useAuthToken().isSuccess,
        staleTime: Infinity,
    });

    return query;
};

export const usePatternPaths = () => {
    const client = useQueryClient();

    const query = useQuery<IGetPatternPathsResponse>({
        queryKey: ["patternPaths"],
        queryFn: async () => {
            const authToken: string = client.getQueryData(["authToken"])!;
            const baseData = client.getQueryData(["baseData"]) as IGetBaseDataResponse;

            const patternPaths = await getPatternPaths(baseData.routes.map(route => route.key), authToken);

            GetPatternPathsResponseSchema.parse(patternPaths);

            return patternPaths;
        },
        enabled: useBaseData().isSuccess,
        staleTime: Infinity
    });

    return query
};

export const useRoutes = () => {
    const client = useQueryClient();

    const query = useQuery<IMapRoute[]>({
        queryKey: ["routes"],
        queryFn: async () => {
            const baseData = client.getQueryData(["baseData"]) as IGetBaseDataResponse;
            const patternPaths = client.getQueryData(["patternPaths"]) as IGetPatternPathsResponse;

            function addPatternPathsToRoutes(baseDataRoutes: IMapRoute[], patternPathsResponse: IGetPatternPathsResponse) {
                for (let elm of patternPathsResponse) {
                    const foundObject = baseDataRoutes.find(route => route.key === elm.routeKey) as IMapRoute;
                    if (foundObject) {
                        foundObject.patternPaths = elm.patternPaths;
                    }
                }
                return baseDataRoutes as IMapRoute[];
            }

            const routes = addPatternPathsToRoutes([...baseData.routes], patternPaths);
            
            // convert colors based on theme
            const colorTheme = (await getColorScheme()) == "dark" ? darkMode : lightMode
            routes.forEach(route => {
                if (colorTheme.busTints[route.shortName]) {
                    route.directionList.forEach(direction => {
                        direction.lineColor = colorTheme.busTints[route.shortName]!;
                    })
                }
            });

            return routes;
        },
        enabled: usePatternPaths().isSuccess,
        staleTime: Infinity
    });

    return query;
};

export const useServiceInterruptions = () => {
    const client = useQueryClient();

    return useQuery<IMapServiceInterruption[]>({
        queryKey: ["serviceInterruptions"],
        queryFn: async () => {
            const baseData = client.getQueryData(["baseData"]) as IGetBaseDataResponse;
            return baseData.serviceInterruptions;
        },
        enabled: useBaseData().isSuccess,
        staleTime: Infinity
    });
};

export const useStopEstimate = (routeKey: string, directionKey: string, stopCode: string) => {
    const client = useQueryClient();

    return useQuery<IGetNextDepartTimesResponse>({
        queryKey: ["stopEstimate", routeKey, directionKey, stopCode],
        queryFn: async () => {
            const authToken: string = client.getQueryData(["authToken"])!;
    
            const response = await getNextDepartureTimes(routeKey, [directionKey], stopCode, authToken);
            GetNextDepartTimesResponseSchema.parse(response);

            // dedup the stopTimes[].nextDeparts based on relative time
            if (response.routeDirectionTimes[0]) {
                const relatives = response.routeDirectionTimes[0].nextDeparts.map((item) => {
                    const date = moment(item.estimatedDepartTimeUtc ?? item.scheduledDepartTimeUtc ?? "");
                    const relative = date.diff(moment(), "minutes");

                    return relative
                })

                const deduped = response.routeDirectionTimes[0].nextDeparts.filter((_, index) => {
                    return relatives.indexOf(relatives[index] ?? 0) === index
                })

                response.routeDirectionTimes[0].nextDeparts = deduped;
            }

            return response
        },
        enabled: useAuthToken().isSuccess,
        staleTime: 30000,
        refetchInterval: 30000  
    })
}

export const useTimetableEstimate = (stopCode: string, date: Date) => {
    const client = useQueryClient();

    return useQuery<IGetStopEstimatesResponse>({
        queryKey: ["timetableEstimate", stopCode, moment(date).format("YYYY-MM-DD")],
        queryFn: async () => {
            const authToken: string = client.getQueryData(["authToken"])!;
    
            const response = await getStopEstimates(stopCode, date, authToken);
            GetStopEstimatesResponseSchema.parse(response);

            return response
        },
        enabled: useAuthToken().isSuccess,
        staleTime: 30000,
        refetchInterval: 30000  
    })
}

export const useSchedule = (stopCode: string, date: Date) => {
    const client = useQueryClient();

    return useQuery<IGetStopSchedulesResponse>({
        queryKey: ["schedule", stopCode, date],
        queryFn: async () => {
            const authToken: string = client.getQueryData(["authToken"])!;
    
            const stopSchedulesResponse = await getStopSchedules(stopCode, date, authToken);
            GetStopSchedulesResponseSchema.parse(stopSchedulesResponse);

            return stopSchedulesResponse
        },
        enabled: useAuthToken().isSuccess && stopCode !== "" && date !== null,
        staleTime: Infinity
    })
}

export const useVehicles = (routeKey: string) => {
    const client = useQueryClient();

    return useQuery<IVehicle[]>({
        queryKey: ["vehicles", routeKey],
        queryFn: async () => {
            const authToken: string = client.getQueryData(["authToken"])!;
    
            let busesResponse = await getVehicles([routeKey], authToken) as IGetVehiclesResponse;
            GetVehiclesResponseSchema.parse(busesResponse);

            if (busesResponse.length == 0 || !busesResponse[0]?.vehiclesByDirections) {
                return []
            }

            let extracted: IVehicle[] = []
            for (let direction of busesResponse[0]?.vehiclesByDirections) {
                for (let bus of direction.vehicles) {
                    extracted.push(bus)
                }
            }

            return extracted;
        },
        enabled: useAuthToken().isSuccess && routeKey !== "",
        staleTime: 10000,
        refetchInterval: 10000  
    })
}

// Route Planning
export const useSearchSuggestion = (query: string) => {
    const client = useQueryClient();

    return useQuery<SearchSuggestion[]>({
        queryKey: ["searchSuggestion", query],
        queryFn: async () => {
            const dataSources: Promise<any>[] = [
                findBusStops(query, client.getQueryData(["authToken"])!),
                findLocations(query, "AIzaSyA89ax74We8sxQcmzDgPTgEUoXMBsc3lG0")
            ]

            const responses = await Promise.all(dataSources);

            const baseData = client.getQueryData(["baseData"]) as IGetBaseDataResponse;

            // handle bus stops
            const busStops: [SearchSuggestion] = responses[0].map((stop: IFoundStop) => {
                // find the stop location (lat/long) in baseData patternPaths
                // TODO: convert this processing to be on the BaseData loading
                let foundLocation: IPatternPoint | undefined = undefined;
                for (let route of baseData.routes) {
                    for (let path of route.patternPaths) {
                        const stops = path.patternPoints.filter(point => point.stop != null)
                        for (let point of stops) {
                            if (point.stop?.stopCode === stop.stopCode) {
                                foundLocation = point;
                                break;
                            }
                        }
                        if (foundLocation) break;
                    }

                    if (foundLocation) break;
                }

                return {
                    type: "stop",
                    title: stop.stopName,
                    subtitle: "ID: " + stop.stopCode,
                    code: stop.stopCode,
                    lat: foundLocation?.latitude,
                    long: foundLocation?.longitude
                }
            });

            // handle locations
            const locations: [SearchSuggestion] = responses[1].map((location: IFoundLocation) => {
                return {
                    type: "map",
                    title: location.structured_formatting.main_text,
                    subtitle: location.structured_formatting.secondary_text,
                    placeId: location.place_id,
                }
            });

            return [...busStops, ...locations];
        },
        enabled: useAuthToken().isSuccess && useBaseData().isSuccess && query !== "" ,
        throwOnError: true,
        staleTime: Infinity
    });
}

export const useTripPlan = (origin: SearchSuggestion | null, destination: SearchSuggestion | null, date: Date, deadline: "leave" | "arrive") => {
    const client = useQueryClient();

    return useQuery<TripPlan>({
        queryKey: ["tripPlan", origin, destination, date, deadline],
        queryFn: async () => {
            const authToken: string = client.getQueryData(["authToken"])!;
            let response = await getTripPlan(
                                        origin!, 
                                        destination!, 
                                        deadline == "arrive" ? date : undefined,
                                        deadline == "leave" ? date : undefined,
                                        authToken
                                    );

            GetTripPlanResponseSchema.parse(response)

            // filter out expired options
            // response.optionDetails = (response?.optionDetails ?? []).filter((p) => p.endTime > Math.floor(Date.now() / 1000))

            return response;
        },
        enabled: useAuthToken().isSuccess && origin !== null && destination !== null && date !== null && deadline !== null,
        staleTime: 120000, // 2 minutes
        throwOnError: true
    });
}