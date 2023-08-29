import { 
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { DrinkingSessionUnitWindowProps } from "../types/components";
import SessionUnitsInputWindow from "./Buttons/SessionUnitsInputWindow";


const DrinkingSessionUnitWindow = ({
    unitName,
    iconSource,
    currentUnits,
    setCurrentUnits
}: DrinkingSessionUnitWindowProps) => {

    const changeUnits = (number: number) => {
        let newUnits = currentUnits + number;
        if (newUnits >= 0 && newUnits < 100){
          setCurrentUnits(newUnits);
        }
    };

    return (
        <View style={styles.sessionUnitContainer}>
            <Image source={iconSource} style={styles.iconStyle}/>
            <Text style = {styles.unitInfoText}>{unitName}</Text>
            <TouchableOpacity
                style={styles.adjustUnitsButton}
                onPress={() => changeUnits(-1)}
            >
                <Text style={styles.adjustUnitsButtonText}>-</Text>
            </TouchableOpacity>
            <SessionUnitsInputWindow
                currentUnits={currentUnits}
                setCurrentUnits={setCurrentUnits}
                styles={styles}
            />
            <TouchableOpacity
                style={styles.adjustUnitsButton}
                onPress={() => changeUnits(1)}
            >
                <Text style={styles.adjustUnitsButtonText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};


export default DrinkingSessionUnitWindow;

const styles = StyleSheet.create({
    sessionUnitContainer: {
        width: '80%',
        borderWidth: 1,
        borderColor: 'black',
        backgroundColor: '#d9faf8',
        flexDirection: 'row',
    },
    iconStyle: {
        width: 35,
        height: 35,
        marginLeft: 5,
        marginRight: 5,
        alignSelf: 'center'
    },
    unitInfoText: {
        flexGrow: 1,
        fontSize: 14,
        color: 'black',
        fontWeight: 'bold',
        alignSelf: 'center',
        marginLeft: 5,
    },
    unitsInputContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 4,
    },
    unitsInputButton: {
        width: 45,
        height: 45,
        borderRadius: 5,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#212421',
        backgroundColor: 'white',
    },
    unitsInputText: {
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#212421',
        alignSelf: 'center',
        alignContent: 'center',
    },
    adjustUnitsButton: {
        width: 50,
        height: 50,
        alignSelf: 'flex-end',
        justifyContent: 'center',
    },
    adjustUnitsButtonText: {
        fontSize: 35,
        fontWeight: '500',
        color: 'black',
        // borderWidth: 1,
        // borderColor: 'black',
        alignSelf: 'center'
    },
})