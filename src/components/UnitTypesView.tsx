import { ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import { UnitTypesKeys } from "../types/database";
import { UnitTypesViewProps } from "../types/components";
import DrinkingSessionUnitWindow from "./DrinkingSessionUnitWindow";


const UnitTypesView = ({
    drinkData,
    currentUnits,
    setCurrentUnits,
    availableUnits,
}: UnitTypesViewProps) => {
    return (
    <View style={styles.mainContainer}>
        <View style={styles.tab}>
                <Text style={styles.tabText}>Units consumed</Text>
        </View>
        {drinkData.map(drink => (
        <DrinkingSessionUnitWindow
            key={drink.key} // JS unique key property - no need to list
            unitKey={drink.key}
            iconSource={drink.icon}
            currentUnits={currentUnits}
            setCurrentUnits={setCurrentUnits}
            availableUnits={availableUnits}
            typeSum={drink.typeSum}
            setTypeSum={drink.setTypeSum}
        />
        ))}
    </View>
    );
};
    
export default UnitTypesView;


const styles = StyleSheet.create({
    mainContainer: {
        width: '100%',
        backgroundColor: 'white',
    },
    tab: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: '100%',
        borderColor: '#212421',
        borderWidth: 1,
        backgroundColor: 'white',
        paddingHorizontal: 10,
    },
    tabText: {
        fontWeight: 'bold',
        fontSize: 14,
        color: 'black',
    },
})