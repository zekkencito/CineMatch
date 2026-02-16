import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import colors from '../constants/colors';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingPhoto(true);
        try {
          const photoUri = result.assets[0].uri;
          
          // Actualizar el perfil con la nueva foto
          await updateUser({ profile_photo: photoUri });
          
          Alert.alert('Success', 'Profile photo updated!');
        } catch (error) {
          console.error('Error uploading photo:', error);
          Alert.alert('Error', 'Failed to upload photo');
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const menuItems = [
    {
      title: 'Movie Preferences',
      icon: '🎬',
      onPress: () => navigation.navigate('Preferences'),
    },
    {
      title: 'Subscription',
      icon: '⭐',
      onPress: () => Alert.alert('Coming Soon', 'Subscription feature coming soon!'),
    },
    {
      title: 'Settings',
      icon: '⚙️',
      onPress: () => Alert.alert('Coming Soon', 'Settings feature coming soon!'),
    },
    {
      title: 'Help & Support',
      icon: '💬',
      onPress: () => Alert.alert('Coming Soon', 'Help & Support feature coming soon!'),
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <Image
            source={{
              uri: user?.profile_photo || 'https://via.placeholder.com/120',
            }}
            style={styles.avatar}
          />
          {uploadingPhoto && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator color="white" size="large" />
            </View>
          )}
          <View style={styles.editIconContainer}>
            <Text style={styles.editIcon}>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.age && <Text style={styles.age}>{user.age} years old</Text>}
      </View>

      {user?.bio && (
        <View style={styles.bioContainer}>
          <Text style={styles.bioLabel}>About me</Text>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>
      )}

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>CineMatch v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  editIcon: {
    fontSize: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  age: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bioContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  bioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  menuContainer: {
    gap: 12,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    fontSize: 24,
  },
  menuTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 28,
    color: colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: colors.error,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default ProfileScreen;
