import React, { useContext, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "@/context/AuthContext";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { Client, Account } from "appwrite";

const client = new Client().setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);
const account = new Account(client);

const Profile = () => {
    const { user, register, login, logout, loading, error } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleAuth = async () => {
        try {
            setIsSubmitting(true);
            setLocalError(null);

            if (isRegistering) {
                if (!name || !email || !password) {
                    setLocalError("All fields are required");
                    return;
                }
                await register(email, password, name);
            } else {
                if (!email || !password) {
                    setLocalError("Email and password are required");
                    return;
                }
                await login(email, password);
            }

            setEmail("");
            setPassword("");
            setName("");
        } catch (error: any) {
            setLocalError(error.message);
            console.error("Auth error:", error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email to reset the password.");
            return;
        }

        try {
            setIsSubmitting(true);
            const redirectUrl = "https://vaporisers.github.io/movies_app/public/reset/"; // Update with your reset page URL
            await account.createRecovery(email, redirectUrl);
            Alert.alert("Success", "Password reset email sent. Please check your inbox.");
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="bg-primary flex-1">
                <ActivityIndicator size="large" color="#AB8BFF" className="mt-20" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="bg-primary flex-1">
            <Image
                source={images.bg}
                className="absolute w-full z-0"
                resizeMode="cover"
            />
            <View className="flex-1 px-8 py-12">
                <View className="items-center mb-10">
                    <Image source={icons.logo} className="w-12 h-10" />
                </View>

                {user ? (
                    <View className="items-center">
                        <Image source={icons.person} className="size-20 mb-4" tintColor="#AB8BFF" />
                        <Text className="text-white text-xl font-bold mb-2">
                            Welcome, {user.name}
                        </Text>
                        <Text className="text-light-200 text-sm mb-8">
                            {user.email}
                        </Text>
                        <TouchableOpacity
                            onPress={logout}
                            disabled={isSubmitting}
                            className={`bg-accent px-8 py-4 rounded-full w-full ${isSubmitting ? 'opacity-50' : ''}`}
                        >
                            <Text className="text-white text-center font-semibold text-base">
                                Logout
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="flex-1">
                        <View className="items-center mb-8">
                            <Image source={icons.person} className="size-20" tintColor="#AB8BFF" />
                        </View>

                        {(localError || error) && (
                            <Text className="text-red-500 text-center mb-4 px-4 py-2 bg-dark-100 rounded-lg">
                                {localError || error}
                            </Text>
                        )}

                        <View className="gap-4">
                            {isRegistering && (
                                <TextInput
                                    placeholder="Name"
                                    value={name}
                                    onChangeText={setName}
                                    className="bg-dark-200 text-white rounded-full px-5 py-4"
                                    placeholderTextColor="#A8B5DB"
                                />
                            )}
                            <TextInput
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className="bg-dark-200 text-white rounded-full px-5 py-4"
                                placeholderTextColor="#A8B5DB"
                            />
                            <TextInput
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                className="bg-dark-200 text-white rounded-full px-5 py-4"
                                placeholderTextColor="#A8B5DB"
                            />
                            {!isRegistering && (
                                <TouchableOpacity onPress={handleResetPassword} disabled={isSubmitting}>
                                    <Text className="text-light-200 text-sm text-right mt-2">
                                        Reset Password
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View className="mt-8 gap-4">
                            <TouchableOpacity
                                onPress={handleAuth}
                                disabled={isSubmitting}
                                className={`bg-accent px-8 py-4 rounded-full ${isSubmitting ? 'opacity-50' : ''}`}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white text-center font-semibold text-base">
                                        {isRegistering ? "Register" : "Login"}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setIsRegistering(!isRegistering)}
                                disabled={isSubmitting}
                                className={`bg-dark-100 px-8 py-4 rounded-full ${isSubmitting ? 'opacity-50' : ''}`}
                            >
                                <Text className="text-white text-center font-semibold text-base">
                                    {isRegistering ? "Switch to Login" : "Switch to Register"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

export default Profile;