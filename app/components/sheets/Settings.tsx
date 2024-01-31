import React, { memo, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, NativeSyntheticEvent } from "react-native";
import { BottomSheetModal, BottomSheetView, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Ionicons from '@expo/vector-icons/Ionicons';
import SheetHeader from "../ui/SheetHeader";
import SegmentedControl, { NativeSegmentedControlIOSChangeEvent } from "@react-native-segmented-control/segmented-control";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SheetProps {
    sheetRef: React.RefObject<BottomSheetModal>
}

// Settings (for all routes and current route)
const Settings: React.FC<SheetProps> = ({ sheetRef }) => {
    const snapPoints = ['25%', '45%', '85%'];

    const [defaultGroup, setDefaultGroup] = useState(0);

    useEffect(() => {
        try {
            AsyncStorage.getItem('default-group').then((defaultGroup: string | null) => {
                if (!defaultGroup) return;    
                setDefaultGroup(Number(defaultGroup));
            })
        } catch(error) {
            console.error(error);
            Alert.alert("Something Went Wrong", "Please try again later")
            return;
        }
    }, [])

    function setDefaultGroupValue(evt: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) {
        setDefaultGroup(evt.nativeEvent.selectedSegmentIndex);
        AsyncStorage.setItem('default-group', evt.nativeEvent.selectedSegmentIndex.toString());
    }

    return (
        <BottomSheetModal ref={sheetRef} snapPoints={snapPoints} index={1}>
            <BottomSheetView>
                {/* header */}
                <SheetHeader
                    title="Settings"
                    icon={
                        <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => sheetRef.current?.dismiss()}>
                            <Ionicons name="close-circle" size={28} color="grey" />
                        </TouchableOpacity>
                    }
                />
                <View style={{ height: 1, backgroundColor: "#eaeaea", marginTop: 8 }} />


            </BottomSheetView>


            <BottomSheetScrollView
                style={{ padding: 16 }}
            >
                <Text style={{fontSize: 16, fontWeight: "bold"}}>Default Shown Route Group</Text>
                <SegmentedControl
                    values={['All Routes', 'Favorites']}
                    selectedIndex={defaultGroup}
                    style={{ marginTop: 8 }}
                    onChange={setDefaultGroupValue}
                />
            </BottomSheetScrollView>
        </BottomSheetModal>

    )
}

export default memo(Settings);