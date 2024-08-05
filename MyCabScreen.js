import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { db, auth } from './database'; 
import { collection, query, where, onSnapshot, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function MyCabScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation(); 

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const bookingsCollection = collection(db, 'bookings');
        const bookingsQuery = query(bookingsCollection, where('userId', '==', user.uid));

        const unsubscribeBookings = onSnapshot(bookingsQuery, async (snapshot) => {
          const bookedCabs = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
            const bookingData = docSnapshot.data();
            const cabRef = doc(db, 'cabs', bookingData.cabId); 
            const cabDoc = await getDoc(cabRef);
            const cabData = cabDoc.exists() ? cabDoc.data() : { carModel: 'Unknown' };
            return {
              id: docSnapshot.id,
              ...bookingData,
              carModel: cabData.carModel,
            };
          }));
          setBookings(bookedCabs);
          setLoading(false); 
        }, error => {
          console.error('Error fetching bookings:', error);
          setLoading(false);
        });

        return () => unsubscribeBookings(); 
      } else {
        setLoading(false); 
        setBookings([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const cancelBooking = (id) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              if (!userId) {
                Alert.alert('Not Authenticated', 'You need to log in to cancel a booking.');
                return;
              }
              await deleteDoc(doc(db, 'bookings', id));
              Alert.alert('Booking Cancelled', 'Your cab booking has been cancelled.');
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert('Error', 'Failed to cancel the booking.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login'); 
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.bookingItem}>
            <Text style={styles.bookingText}>Cab ID: {item.cabId}</Text>
            <Text style={styles.bookingText}>Car Model: {item.carModel}</Text> 
            <Text style={styles.bookingText}>Booked At: {new Date(item.bookedAt).toLocaleString()}</Text>
            <Text style={styles.bookingText}>User Email: {item.userEmail}</Text>
            <Button title="Cancel Booking" onPress={() => cancelBooking(item.id)} />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No bookings found.</Text>}
      />
      <View style={styles.logoutButtonContainer}>
        <Button title="Logout" onPress={handleLogout} color="#f44336" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#e3f2fd', 
  },
  bookingItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderLeftWidth: 5,
    borderLeftColor: '#2196f3',
  },
  bookingText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8, 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  logoutButtonContainer: {
    marginTop: 20, 
  },
});
