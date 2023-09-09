import { ImageSourcePropType, View } from "react-native";
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
    <>
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
    </>
    );
};
    
export default UnitTypesView;