import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity, Image, ScrollView } from 'react-native';
import { db, auth } from './database';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function CabDetailScreen({ route }) {
  const { cabId } = route.params;
  const [cab, setCab] = useState(null);
  const [user, setUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        const bookingsQuery = query(collection(db, 'bookings'), where('userId', '==', user.uid));
        getDocs(bookingsQuery).then((querySnapshot) => {
          const bookings = querySnapshot.docs.map((doc) => doc.data());
          setUserBookings(bookings);
        });
      }
    });

    const cabDoc = doc(db, 'cabs', cabId);
    const fetchCab = async () => {
      const docSnap = await getDoc(cabDoc);
      if (docSnap.exists()) {
        setCab(docSnap.data());
      }
    };
    fetchCab();

    return () => unsubscribeAuth();
  }, [cabId]);

  const bookCab = async () => {
    if (userBookings.length >= 2) {
      Alert.alert('Booking Limit', 'You cannot book more than 2 cabs at a time.');
      return;
    }

    const booking = {
      userId: user.uid,
      cabId: cabId,
      bookedAt: new Date().toISOString(),
      userEmail: user.email, 
    };

    await setDoc(doc(db, 'bookings', `${user.uid}_${cabId}`), booking);
    setUserBookings([...userBookings, booking]);
    Alert.alert('Booking Confirmed', 'Your cab has been booked.');
  };

  if (!cab) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.cabItem}>
        {cab.image && (
          <Image source={{ uri: cab.image }} style={styles.cabImage} />
        )}
        <View style={styles.cabInfo}>
          <Text style={styles.companyName}>{cab.companyName}</Text>
          <Text style={styles.carModel}>{cab.carModel}</Text>
          <Text style={styles.detailText}>Passengers: {cab.passengers}</Text>
          <Text style={styles.detailText}>Rating: {cab.rating}</Text>
          <Text style={styles.detailText}>Cost/hour: ${cab.costPerHour}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={bookCab}>
            <Text style={styles.buttonText}>Book Cab</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cabItem: {
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
  cabImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  cabInfo: {
    marginBottom: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e88e5',
  },
  carModel: {
    fontSize: 16,
    color: '#616161',
  },
  detailText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  buttonContainer: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  button: {
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
