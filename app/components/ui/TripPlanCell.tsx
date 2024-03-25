import { Ionicons } from '@expo/vector-icons';
import useAppStore from 'app/data/app_state';
import moment from 'moment';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { IOptionDetail } from 'utils/interfaces';

interface TripPlanCellProps {
    plan: IOptionDetail;
}

const TripPlanCell: React.FC<TripPlanCellProps> = ({ plan }) => {
    const theme = useAppStore((state) => state.theme);
    const setSelectedRoutePlan = useAppStore((state) => state.setSelectedRoutePlan);
    const presentSheet = useAppStore((state) => state.presentSheet);

    const relativeTime = (time: number) => {
        const now = moment()
        const then = moment(time*1000)
        const diffMin = then.diff(now, 'minutes')
        const diffHrs = then.diff(now, 'hours')

        if (diffHrs < 1) return `${diffMin} minutes`

        return `${diffHrs}h ${diffMin - (diffHrs * 60)}m`
    }

    return (
        <TouchableOpacity 
            style={{paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            onPress={() => {
                setSelectedRoutePlan(plan);
                presentSheet("tripPlanDetail")
            }}
        >
            <View style={{flex: 1, marginLeft: 12 }}>
                {/* Title */}
                <Text style={{ color: theme.text, fontSize: 24, fontWeight: "bold" }}>{relativeTime(plan.endTime)}</Text>

                {/* Subtitle */}
                <Text style={{ color: theme.subtitle, fontSize: 14 }}>arrive at {plan.endTimeText}</Text>
            </View>

            {/* caret */}
            <Ionicons name="chevron-forward" size={24} color={theme.subtitle} />
        </TouchableOpacity>
    );
};

export default TripPlanCell;