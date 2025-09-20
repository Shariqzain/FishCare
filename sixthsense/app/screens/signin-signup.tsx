import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ImageBackground, Dimensions, Platform } from "react-native";
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

type SigninSignupScreenProps = {
	onLogin?: () => void;
};


const SigninSignupScreen: React.FC<SigninSignupScreenProps> = ({ onLogin }) => {
	const router = useRouter();
	const [mode, setMode] = useState<'signin' | 'signup'>('signin');
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [checkingAutoLogin, setCheckingAutoLogin] = useState(true);

	useEffect(() => {
		// Check AsyncStorage for auto-login flag
		const checkLogin = async () => {
			try {
				const value = await AsyncStorage.getItem('isLoggedIn');
				if (value === 'true') {
					setIsLoggedIn(true);
					if (onLogin) onLogin();
				}
			} finally {
				setCheckingAutoLogin(false);
			}
		};
		checkLogin();
	}, []);

	const handleAuth = async () => {
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
			// Instantly log in and navigate to home
			await AsyncStorage.setItem('isLoggedIn', 'true');
			router.replace('/(tabs)');
		}
	};

		if (checkingAutoLogin) {
			return null; // Or a loading spinner
		}
		if (!isLoggedIn) {
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
						</BlurView>
						</View>
					</ImageBackground>
				</View>
			);
		}

	// Show welcome message if logged in
	return (
		<View style={styles.container}>
			<ImageBackground
				source={require('../../assets/images/fishsignup.jpeg')}
				style={styles.backgroundImage}
				resizeMode="cover"
			>
				<View style={styles.overlay}>
					<BlurView intensity={70} tint="dark" style={styles.glassContainer}>
						<Text style={styles.title}>Welcome!</Text>
						<Text style={styles.info}>You are now signed in.</Text>
					</BlurView>
				</View>
			</ImageBackground>
		</View>
	);
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
		backdropFilter: 'blur(10px)',
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

export default SigninSignupScreen;
