import React, { useState, useEffect } from "react";
import { useAuth } from '../hooks/auth-context';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ImageBackground, Dimensions, Platform } from "react-native";
import { BlurView } from 'expo-blur';
import { API_BASE_URL } from '../../constants/api';

const { width, height } = Dimensions.get('window');
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const SigninSignupScreen: React.FC = () => {
	const router = useRouter();
	const { signIn } = useAuth();
	const [mode, setMode] = useState<'signin' | 'signup'>('signin');
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState(null);

	const handleAuth = async () => {
		setLoading(true);
		if (mode === 'signup') {
			if (!name || !email || !password || !confirmPassword) {
				Alert.alert("Error", "Please fill in all fields.");
				setLoading(false);
				return;
			}
			if (password !== confirmPassword) {
				Alert.alert("Error", "Passwords do not match.");
				setLoading(false);
				return;
			}
			try {
				const res = await fetch(`${API_BASE_URL}/api/users/signup`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name, email, password })
				});
				
				if (!res.ok) {
					const data = await res.json().catch(() => ({ message: 'Server error' }));
					throw new Error(data.message || 'Signup failed');
				}
				
				const data = await res.json();
				Alert.alert("Success", "Account created!", [{ text: "OK", onPress: () => setMode('signin') }]);
			} catch (err: any) {
				Alert.alert("Error", err.message || "Network error. Please check your connection and try again.");
			}
			setLoading(false);
		} else {
			if (!email || !password) {
				Alert.alert("Error", "Please enter both email and password.");
				setLoading(false);
				return;
			}
			try {
				const res = await fetch(`${API_BASE_URL}/api/users/signin`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email, password })
				});
				
				if (!res.ok) {
					const data = await res.json().catch(() => ({ message: 'Server error' }));
					throw new Error(data.message || 'Signin failed');
				}
				
				const data = await res.json();
				setUser(data);
				await signIn(data.token || 'dummy-token', data.userId, data.name);
				router.replace('/(tabs)');
			} catch (err: any) {
				Alert.alert("Error", err.message || "Network error. Please check your connection and try again.");
			}
			setLoading(false);
		}
	};

	const styles = StyleSheet.create({
		container: {
			flex: 1,
		},
		backgroundImage: {
			flex: 1,
			width: width,
			height: height,
		},
		overlay: {
			flex: 1,
			backgroundColor: 'rgba(0,0,0,0.3)',
			justifyContent: 'center',
			padding: 24,
		},
		glassContainer: {
			padding: 20,
			borderRadius: 20,
			overflow: 'hidden',
			backgroundColor: 'rgba(255, 255, 255, 0.1)',
			borderWidth: 1,
			borderColor: 'rgba(255, 255, 255, 0.2)',
		},
		title: {
			fontSize: 28,
			fontWeight: "bold",
			marginBottom: 32,
			textAlign: "center",
			color: "#00c8ffff",
		},
		input: {
			borderWidth: 1,
			borderColor: "rgba(255, 255, 255, 0.3)",
			borderRadius: 8,
			padding: 12,
			marginBottom: 16,
			fontSize: 16,
			color: "#fff",
			backgroundColor: "rgba(255, 255, 255, 0.1)",
			...Platform.select({
				ios: {
					shadowColor: '#fff',
					shadowOffset: { width: 0, height: 1 },
					shadowOpacity: 0.2,
					shadowRadius: 3,
				},
				android: {
					elevation: 2,
				},
			}),
		},
		button: {
			backgroundColor: "rgba(0, 200, 255, 0.6)",
			padding: 16,
			borderRadius: 8,
			alignItems: "center",
			marginTop: 8,
			borderWidth: 1,
			borderColor: "rgba(255, 255, 255, 0.2)",
			...Platform.select({
				ios: {
					shadowColor: '#fff',
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.25,
					shadowRadius: 3.84,
				},
				android: {
					elevation: 5,
				},
			}),
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
			color: "#00c8ffff",
			textDecorationLine: "underline",
			fontSize: 16,
		},
		info: {
			color: "#fff",
			fontSize: 18,
			textAlign: 'center',
		},
	});

	return (
		<View style={styles.container}>
			<ImageBackground
				source={require('../../assets/images/fishsignup.jpeg')}
				style={styles.backgroundImage}
				resizeMode="cover"
			>
				<View style={styles.overlay}>
					<BlurView intensity={70} tint="dark" style={styles.glassContainer}>
						<Text style={styles.title}>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</Text>
						{mode === 'signup' && (
							<TextInput
								style={styles.input}
								placeholder="Name"
								placeholderTextColor="#98a0aaff"
								value={name}
								onChangeText={setName}
								autoCapitalize="words"
							/>
						)}
						<TextInput
							style={styles.input}
							placeholder="Email"
							placeholderTextColor="#98a0aaff"
							value={email}
							onChangeText={setEmail}
							keyboardType="email-address"
							autoCapitalize="none"
						/>
						<TextInput
							style={styles.input}
							placeholder="Password"
							placeholderTextColor="#98a0aaff"
							value={password}
							onChangeText={setPassword}
							secureTextEntry
						/>
						{mode === 'signup' && (
							<TextInput
								style={styles.input}
								placeholder="Confirm Password"
								placeholderTextColor="#98a0aaff"
								value={confirmPassword}
								onChangeText={setConfirmPassword}
								secureTextEntry
							/>
						)}
						<Pressable style={styles.button} onPress={handleAuth} disabled={loading}>
							<Text style={styles.buttonText}>{loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}</Text>
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
					</BlurView>
				</View>
			</ImageBackground>
		</View>
	);


}
export default SigninSignupScreen;
