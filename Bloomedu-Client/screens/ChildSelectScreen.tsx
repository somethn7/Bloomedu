import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChildSelectScreen = ({ navigation, route }: any) => {
  const { category, categoryTitle, categoryColor } = route.params;

  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    const parentId = await AsyncStorage.getItem('parent_id');
    const res = await fetch(
      `https://bloomedu-production.up.railway.app/children/by-parent/${parentId}`
    );
    const json = await res.json();
    if (json.success) setChildren(json.children);
  };

  const handleSelect = (child: any) => {
    navigation.navigate("ChatScreen", {
      childId: child.id,
      childName: `${child.name} ${child.surname}`,
      category,
      categoryTitle,
      categoryColor,
      isTeacher: false,   // Parent is using this screen
      otherUserId: child.teacher_id
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Child</Text>
      <Text style={styles.subtitle}>Choose which child this conversation is about.</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {children.map((child) => (
          <TouchableOpacity
            key={child.id}
            style={styles.card}
            onPress={() => handleSelect(child)}
          >
            <Text style={styles.avatar}>👶</Text>
            <Text style={styles.name}>{child.name} {child.surname}</Text>
            <Text style={styles.teacher}>Teacher ID: {child.teacher_id}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default ChildSelectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6
  },
  subtitle: {
    color: '#6B7280',
    marginBottom: 20
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  avatar: {
    fontSize: 32,
    marginBottom: 10
  },
  name: {
    fontSize: 18,
    fontWeight: '700'
  },
  teacher: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4
  }
});
