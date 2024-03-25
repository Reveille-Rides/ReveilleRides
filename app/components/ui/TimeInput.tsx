import useAppStore from 'app/data/app_state';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface Props {
    onTimeChange: (time: Date) => void;
}

const TimeInput: React.FC<Props> = ({ onTimeChange }) => {
    const [time, setTime] = useState('')
    const [meridiem, setMeridiem] = useState('AM')
    const [isFocused, setIsFocused] = useState(false)

    const textInputRef = React.createRef<TextInput>();

    const theme = useAppStore((state) => state.theme);

    const formatTime = (value: string) => {
        // replace non-numeric characters
        value = value.replace(/:|[a-zA-Z]/g, '');
        
        let totalCharactersInValue = value.length;
        
        if (totalCharactersInValue === 3) {
            setTime(value.slice(0, 1) + ':' + value.slice(1))
            return
        }
        
        if (totalCharactersInValue >= 4) {
            setTime(value.slice(0, 2) + ':' + value.slice(2, 4))
            return
        }
        
        // Update the state with the formatted time
        setTime(value);
    };

    useEffect(() => {
        // validate time
        let regex = new RegExp('^(0?[1-9]|1[012]):[0-5][0-9]$');
        
        if (!regex.test(time)) {
            return;
        }

        // make time to a date object with the date as today and time from time and meridiem
        let date = new Date();

        let hours = parseInt(time.split(':')[0] ?? "0");
        let minutes = parseInt(time.split(':')[1] ?? "0");
        if (meridiem === 'PM') hours += 12;
        date.setHours(hours, minutes);

        // call the onTimeChange prop with the date object
        onTimeChange(date);
    }, [time, meridiem])

    // set initial time to current time +15 minutes
    useEffect(() => {
        let date = new Date();
        date.setMinutes(date.getMinutes() + 15);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let meridiem = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        let minutesString = minutes < 10 ? '0' + minutes : minutes;
        let timeString = hours + ':' + minutesString;
        setTime(timeString);
        setMeridiem(meridiem);
    }, [])

    return (
        <View
            style={{
                borderRadius: 10,
                borderWidth: 2,
                borderColor: isFocused ? theme.myLocation : theme.tertiaryBackground,
                width: 110,
                height: 32,
                backgroundColor: theme.tertiaryBackground,
                justifyContent: 'center',
                flexDirection: 'row',
            }}
        >
            <TextInput
                ref={textInputRef}
                value={time}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                selection={{ start: time.length, end: time.length }}
                style={{
                    color: theme.text,
                    fontWeight: 'bold',
                    fontSize: 16,
                    textAlign: 'center',
                    marginHorizontal: 2,
                    marginLeft: 2,
                    width: 50
                }}
                onChangeText={formatTime}
                maxLength={5}
                selectTextOnFocus={true}
                keyboardType="numeric"
                placeholder="--:--"
            />
            {/* Divider */}
            <View
                style={{
                    backgroundColor: theme.divider,
                    width: 2,
                    height: 16,
                    marginHorizontal: 4,
                    marginVertical: 6,
            }} />

            
            <TouchableOpacity
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    flex: 1,
                }}
                onPress={() => setMeridiem(meridiem === 'AM' ? 'PM' : 'AM')}
            >
                <Text style={{
                    color: theme.text,
                    fontSize: 16,
                }}>
                    {meridiem}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default TimeInput;