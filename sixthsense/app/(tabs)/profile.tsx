import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, TouchableOpacity, Animated, Easing } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const settings: { icon: MaterialIconName; label: string; onPress: () => void }[] = [
  { icon: 'person', label: 'Edit Profile', onPress: () => Alert.alert('Edit Profile', 'Coming soon!') },
  { icon: 'notifications', label: 'Notifications', onPress: () => Alert.alert('Notifications', 'Coming soon!') },
  { icon: 'palette', label: 'Theme', onPress: () => Alert.alert('Theme', 'Coming soon!') },
  { icon: 'help-outline', label: 'Help & Support', onPress: () => Alert.alert('Help & Support', 'Coming soon!') },
  { icon: 'info', label: 'About', onPress: () => Alert.alert('About', 'FishCare App v1.0') },
];

const ProfileSettings = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownAnim] = useState(new Animated.Value(0));

  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    router.replace('/screens/signin-signup');
  };

  const toggleDropdown = () => {
    setDropdownOpen((open) => {
      Animated.timing(dropdownAnim, {
        toValue: open ? 0 : 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
      return !open;
    });
  };

  const dropdownHeight = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (settings.length + 1) * 56],
  });

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navbarButton} onPress={toggleDropdown} activeOpacity={0.7}>
          <MaterialIcons name="menu" size={28} color="#3c6570ff" />
          <Text style={styles.navbarTitle}>Account Management</Text>
          <MaterialIcons name={dropdownOpen ? "expand-less" : "expand-more"} size={28} color="#3c6570ff" />
        </TouchableOpacity>
        <Animated.View style={[styles.dropdown, { height: dropdownHeight, overflow: 'hidden' }]}>
          {settings.map((item) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [styles.dropdownItem, pressed && styles.dropdownItemPressed]}
              onPress={() => {
                setDropdownOpen(false);
                item.onPress();
              }}
            >
              <MaterialIcons name={item.icon} size={22} color="#3c6570ff" style={styles.icon} />
              <Text style={styles.dropdownLabel}>{item.label}</Text>
            </Pressable>
          ))}
          <Pressable style={[styles.dropdownItem, styles.logoutRow]} onPress={() => { setDropdownOpen(false); handleLogout(); }}>
            <MaterialIcons name="logout" size={22} color="#f44336" style={styles.icon} />
            <Text style={[styles.dropdownLabel, styles.logoutLabel]}>Log Out</Text>
          </Pressable>
        </Animated.View>
      </View>
      <View style={styles.bodyContent}>
        <Text style={styles.welcomeTitle}>Welcome to FishCare Settings</Text>
        <Text style={styles.info}>Manage your preferences and account here.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10141a',
    padding: 0,
  },
  navbar: {
    backgroundColor: '#181f2a',
    paddingTop: 48,
    paddingBottom: 8,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#232b38',
    alignItems: 'center',
    zIndex: 2,
  },
  navbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navbarTitle: {
    color: '#3c6570ff',
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 12,
    flex: 1,
    textAlign: 'center',
    letterSpacing: 1,
  },
  dropdown: {
    width: '100%',
    backgroundColor: '#181f2a',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderTopWidth: 1,
    borderTopColor: '#232b38',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#232b38',
    backgroundColor: 'transparent',
  },
  dropdownItemPressed: {
    backgroundColor: '#232b38',
  },
  dropdownLabel: {
    fontSize: 17,
    color: '#fff',
    flex: 1,
  },
  logoutRow: {
    borderBottomWidth: 0,
    backgroundColor: '#181f2a',
  },
  logoutLabel: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 18,
  },
  bodyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3c6570ff',
    marginBottom: 16,
    textAlign: 'center',
  },
  info: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default ProfileSettings;

