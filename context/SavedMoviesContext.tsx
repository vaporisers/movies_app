import React, { createContext, useState, useEffect, ReactNode } from "react";
import { getSavedMovies, saveMoveToAppwrite, removeSavedMovie } from "@/services/appwrite";

interface Movie {
    id: number;
    poster_path: string;
    title: string;
    vote_average: number;
    release_date: string;
}

interface SavedMoviesContextProps {
    savedMovies: Movie[];
    addMovie: (movie: Movie) => Promise<void>;
    removeMovie: (id: number) => Promise<void>;
    loading: boolean;
}

export const SavedMoviesContext = createContext<SavedMoviesContextProps>({
    savedMovies: [],
    addMovie: async () => {},
    removeMovie: async () => {},
    loading: false
});

export const SavedMoviesProvider = ({ children }: { children: ReactNode }) => {
    const [savedMovies, setSavedMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const userId = "default_user"; // Temporary until auth is implemented

    useEffect(() => {
        loadSavedMovies();
    }, []);

    const loadSavedMovies = async () => {
        try {
            const movies = await getSavedMovies(userId);
            setSavedMovies(movies);
        } catch (error) {
            console.error("Error loading saved movies:", error);
        } finally {
            setLoading(false);
        }
    };

    const addMovie = async (movie: Movie) => {
        try {
            await saveMoveToAppwrite(movie, userId);
            setSavedMovies(prev => [...prev, movie]);
        } catch (error) {
            console.error("Error adding movie:", error);
            throw error;
        }
    };

    const removeMovie = async (id: number) => {
        try {
            await removeSavedMovie(id, userId);
            setSavedMovies(prev => prev.filter(movie => movie.id !== id));
        } catch (error) {
            console.error("Error removing movie:", error);
            throw error;
        }
    };

    return (
        <SavedMoviesContext.Provider value={{ savedMovies, addMovie, removeMovie, loading }}>
            {children}
        </SavedMoviesContext.Provider>
    );
};