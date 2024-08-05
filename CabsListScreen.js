import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { db } from './database';
import { collection, onSnapshot } from 'firebase/firestore';

export default function CabsListScreen({ navigation }) {
  const [cabs, setCabs] = useState([]);

  useEffect(() => {
    const cabsCollection = collection(db, 'cabs');
    const unsubscribe = onSnapshot(cabsCollection, snapshot => {
      const cabList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCabs(cabList);
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={cabs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cabItem}
            onPress={() => navigation.navigate('Cab Detail', { cabId: item.id })}
          >
            <View style={styles.cabInfo}>
              <Text style={styles.companyName}>{item.companyName}</Text>
              <Text style={styles.carModel}>{item.carModel}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Cab Detail', { cabId: item.id })}
              >
                <Text style={styles.buttonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    padding: 16,
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
