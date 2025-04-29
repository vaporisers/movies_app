import React, { createContext, useState, useEffect, ReactNode } from "react";
import { registerUser, loginUser, getUser, logoutUser } from "@/services/appwrite";

interface AuthContextProps {
    user: any;
    register: (email: string, password: string, name: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
    error: string | null;
}

export const AuthContext = createContext<AuthContextProps>({
    user: null,
    register: async () => {},
    login: async () => {},
    logout: async () => {},
    loading: false,
    error: null
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const currentUser = await getUser();
            setUser(currentUser);
        } catch (error: any) {
            console.error("Error checking user:", error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const register = async (email: string, password: string, name: string) => {
        try {
            setLoading(true);
            setError(null);
            const user = await registerUser(email, password, name);
            setUser(user);
        } catch (error: any) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);
            const user = await loginUser(email, password);
            setUser(user);
        } catch (error: any) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            setError(null);
            await logoutUser();
            setUser(null);
        } catch (error: any) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, register, login, logout, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
};