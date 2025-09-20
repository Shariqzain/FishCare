
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";

const Profile = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleAuth = () => {
    if (mode === 'signup') {
      if (!name || !email || !password || !confirmPassword) {
        Alert.alert("Error", "Please fill in all fields.");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match.");
        return;
      }
      Alert.alert("Success", "Account created!", [
        {
          text: "OK",
          onPress: () => setMode('signin'),
        },
      ]);
    } else {
      if (!email || !password) {
        Alert.alert("Error", "Please enter both email and password.");
        return;
      }
      // Simulate authentication (replace with real logic)
      // if (email === "user@example.com" && password === "password") {
      //   setIsLoggedIn(true);
      // } else {
      //   Alert.alert("Error", "Invalid credentials.");
      // }
      setIsLoggedIn(true); // For demo purposes, log in any user
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</Text>
        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#aaa"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        )}
        <Pressable style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</Text>
        </Pressable>
        <Pressable
          onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>
            {mode === 'signin'
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </Text>
        </Pressable>
      </View>
    );
  }

  // Show profile if logged in
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to your Profile!</Text>
      <Text style={styles.info}>This is your profile page.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
    color: "#2196F3",
  },
  input: {
    borderWidth: 1,
    borderColor: "#2196F3",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#fff",
    backgroundColor: "#111",
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  linkContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    color: "#2196F3",
    textDecorationLine: "underline",
    fontSize: 16,
  },
  info: {
    color: "#fff",
    fontSize: 18,
    textAlign: 'center',
  },
});

export default Profile;
