import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {timestampToDate} from '@libs/DataHandling';
import {removeFeedback} from '@database/feedback';
import {fetchNicknameByUID} from '@userActions/User';
import {useFirebase} from '@context/global/FirebaseContext';
import CONST from '@src/CONST';
import type {FeedbackList, Feedback} from '@src/types/onyx';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {format} from 'date-fns';
import DateUtils from '@libs/DateUtils';
import {useDatabaseData} from '@context/global/DatabaseDataContext';

// AdminFeedbackModal props
type AdminFeedbackPopupProps = {
  visible: boolean;
  transparent: boolean;
  onRequestClose: () => void;
  FeedbackList: FeedbackList;
};

const AdminFeedbackPopup = (props: AdminFeedbackPopupProps) => {
  const {visible, transparent, onRequestClose, FeedbackList} = props;
  const {userData} = useDatabaseData();
  const timezone = userData?.timezone;
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const {db} = useFirebase();
  if (!db) {
    return null;
  }

  const FeedbackListArray = Object.entries(FeedbackList).map(
    ([feedback_id, Feedback]) => ({
      feedback_id: feedback_id,
      ...Feedback,
    }),
  );

  async function handleDeleteFeedback(db: any, feedbackId: string) {
    try {
      await removeFeedback(db, feedbackId);
    } catch (error: any) {
      Alert.alert(
        'Failed to remove feedback',
        'Feedback could not be removed:' + error.message,
      );
    }
  }

  useEffect(() => {
    const fetchNicknames = async () => {
      const newNicknames = {...nicknames};

      for (const item of FeedbackListArray) {
        try {
          const data = await fetchNicknameByUID(db, item.user_id);
          if (data) {
            newNicknames[item.user_id] = data; // Set if not null
          }
        } catch (error: any) {
          Alert.alert(
            'User nickname fetch failed',
            'Could not fetch the nickname of user with UID: ' +
              item.user_id +
              error.message,
          );
        }
      }
      setNicknames(newNicknames);
    };

    fetchNicknames();
  }, [FeedbackList, db]);

  const renderFeedback = ({item}: {item: Feedback & {feedback_id: string}}) => {
    const dateSubmitted = timestampToDate(item.submit_time);
    const daySubmitted = format(dateSubmitted, CONST.DATE.SHORT_DATE_FORMAT);
    const timeSubmitted = DateUtils.getLocalizedTime(
      dateSubmitted,
      timezone?.selected,
    );
    const nickname = nicknames[item.user_id] || 'Loading...'; // Default to "Loading..." if the nickname isn't fetched yet

    return (
      <View style={styles.feedbackContainer}>
        <View style={styles.headingContainer}>
          <Text style={styles.feedbackTimeText}>
            {daySubmitted} {timeSubmitted}
          </Text>
          <Text style={styles.feedbackTimeText}> - {nickname}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => handleDeleteFeedback(db, item.feedback_id)}
            style={styles.deleteFeedbackButton}>
            <Image
              source={KirokuIcons.Remove}
              style={styles.deleteFeedbackButtonImage}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.mainTextContainer}>
          <Text style={styles.feedbackMainText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  const noFeedbackComponent = () => {
    return <Text style={styles.noFeedbackText}>No feedback found</Text>;
  };

  return (
    <Modal
      animationType="none"
      transparent={transparent}
      visible={visible}
      onRequestClose={onRequestClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <FlatList
            data={FeedbackListArray}
            renderItem={renderFeedback}
            ListEmptyComponent={noFeedbackComponent}
            // keyExtractor={(item) => item.feedback_id}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.button}
              onPress={onRequestClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AdminFeedbackPopup;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // This will fade the background
  },
  modalView: {
    height: '70%',
    width: '80%',
    backgroundColor: '#FFFF99',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  feedbackContainer: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignContent: 'space-between',
  },
  headingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feedbackTimeText: {
    fontSize: 12,
    color: 'grey',
    alignSelf: 'flex-end',
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
  },
  noFeedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 5,
    color: 'black',
    alignSelf: 'center',
    alignContent: 'center',
    padding: 10,
  },
  deleteFeedbackContainer: {
    height: 25,
    width: 25,
    justifyContent: 'center',
  },
  deleteFeedbackButton: {
    flex: 1,
    justifyContent: 'center',
  },
  deleteFeedbackButtonImage: {
    height: 25,
    width: 25,
    borderRadius: 25,
    alignSelf: 'flex-end',
    backgroundColor: '#ff212f',
  },
  mainTextContainer: {
    flexGrow: 1,
    padding: 5,
  },
  feedbackMainText: {
    fontSize: 14,
    color: 'black',
    textAlign: 'left',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  button: {
    width: '40%',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    margin: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
