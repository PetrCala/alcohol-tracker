import { 
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { DrinkingSessionUnitWindowProps } from "../types/components";



const DrinkingSessionUnitWindow = ({
    unitName,
    iconSource,
    currentUnits,
    onUnitsChange,
}: DrinkingSessionUnitWindowProps) => {


    return (
        <View style={styles.sessionUnitContainer}>
            <Image source={iconSource} style={styles.iconStyle}/>
            <Text style = {styles.unitInfoText}>{unitName}</Text>
            <TouchableOpacity style={styles.adjustUnitsButton}>
                <Text style={styles.adjustUnitsButtonText}>-</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.adjustUnitsButton}>
                <Text style={styles.adjustUnitsButtonText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};


export default DrinkingSessionUnitWindow;

const styles = StyleSheet.create({
    sessionUnitContainer: {
        width: '80%',
        height: 50,
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
    adjustUnitsButton: {
        width: 50,
        height: 50,
        alignSelf: 'flex-end'
    },
    adjustUnitsButtonText: {
        fontSize: 40,
        color: 'black',
        // borderWidth: 1,
        // borderColor: 'black',
        alignSelf: 'center'
    },
})