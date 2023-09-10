import React, { useState } from 'react';
import { 
    Text, 
    TextInput,
    TouchableOpacity, 
    View, 
    Animated, 
    StyleSheet, 
    Image, 
    ScrollView,
    LayoutChangeEvent,
    Switch
} from 'react-native';


interface SessionSliderProps {
    scrollViewRef: React.RefObject<ScrollView>;
    onBlackoutChange: (value: boolean) => void;
    onNoteChange: (value: string) => void;
}

const SessionDetailsSlider: React.FC<SessionSliderProps> = ({ 
    scrollViewRef,
    onBlackoutChange,
    onNoteChange
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [heightAnim] = useState(new Animated.Value(0)); // Initial value for opacity
    const [featureY, setFeatureY] = useState(0);
    const [isBlackout, setIsBlackout] = useState(false);
    const [note, setNote] = useState('');

    const onFeatureLayout = (event: LayoutChangeEvent) => {
        const layout = event.nativeEvent.layout;
        setFeatureY(layout.y);
    };

    const toggleFeature = () => {
        if (isExpanded) {
            Animated.timing(heightAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(heightAnim, {
                toValue: 400, // Expand the container to this much
                duration: 200,
                useNativeDriver: false,
            }).start(() => {
                scrollViewRef.current?.scrollTo({ y: featureY, animated: true });
            });
        }
        setIsExpanded(!isExpanded);
    };

    /** Handle blackout toggle for both the local hook and the parent component */
    const toggleBlackout = (value: boolean) => {
        setIsBlackout(value);
        onBlackoutChange(value);
    };

    /** Handle note change for both the local hook and the parent component */
    const changeNote = (value: string) => {
        setNote(value);
        onNoteChange(value);
    };

    return (
        <View style={styles.container} onLayout={onFeatureLayout}>
            <TouchableOpacity style={styles.tab} onPress={toggleFeature}>
                <Text style={styles.tabText}>Session details:</Text>
                <Image 
                style={[
                    styles.tabArrow,
                    isExpanded ? styles.tabArrowExpanded : styles.tabArrowDefault
                ]}
                source={require('../assets/icons/arrow_down.png')}
                />
            </TouchableOpacity>
            <Animated.View style={[
                styles.content,
                { height: heightAnim }
            ]}>
                <>
                    <View style={[
                        styles.tileContainerBase,
                        styles.tileContainerHorizontal
                    ]}>
                        <Text style={styles.tileHeading}>Blackout: </Text>
                        <Switch 
                            value={isBlackout} 
                            onValueChange={toggleBlackout}
                            trackColor={{ false: "#767577", true: "#fcf50f" }}
                            thumbColor={isBlackout ? "#f5dd4b" : "#f4f3f4"}
                        />
                    </View>
                    <View style={[
                        styles.tileContainerBase,
                        styles.tileContainerVertical
                    ]}>
                        <Text style={styles.tileHeading}>Session note:</Text>
                        <View style={styles.noteWindowContainer}>
                            <TextInput
                                style={styles.noteText}
                                onChangeText={changeNote}
                                placeholder={"Write your note here"}
                                placeholderTextColor={"grey"}
                                keyboardType="default"
                                maxLength={1000}
                                multiline={true}
                            />
                        </View>
                    </View>
                </>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    tab: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 50,
        width: '100%',
        borderColor: '#212421',
        borderWidth: 1,
        backgroundColor: '#fcf50f',
        paddingHorizontal: 10,
        marginTop: 5,
    },
    tabText: {
        fontWeight: 'bold',
        fontSize: 14,
        color: 'black',
    },
    tabArrow: {
        width: 25,
        height: 25,
        marginRight: 3,
    },
    tabArrowExpanded: {
        transform: [{ rotate: '180deg' }]
    },
    tabArrowDefault: {
    },
    content: {
        width: '100%',
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white',
        borderColor: '#212421',
        borderWidth: 1,
        padding: 5,
    },
    tileContainerBase: {
        marginBottom: 5,
        marginTop: 5,
        padding: 10,
        backgroundColor: '#ffff99',
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 10,
    },
    tileContainerHorizontal: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    tileContainerVertical: {
        flexDirection: 'column',
        alignContent: 'flex-start',

    },
    tileHeading: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black',
    },
    noteWindowContainer: {
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 5,
        backgroundColor: 'white',
        paddingRight: 15,
        marginTop: 5,
    },
    noteText: {
        width: '100%',
        height: 100,
        flexGrow: 1,
        flexShrink: 1,
        textAlignVertical: 'top',
        margin: 10,
    },
});

export default SessionDetailsSlider;
