import React, { createContext, useState, useEffect, ReactNode } from "react";
import { getSavedMovies, saveMoveToAppwrite, removeSavedMovie } from "@/services/appwrite";
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

interface Movie {
    id: number;
    poster_path: string;
    title: string;
    vote_average: number;
    release_date: string;
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    video: boolean;
    vote_count: number;
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
    const { user } = useContext(AuthContext);
    const userId = user?.$id || '';

    useEffect(() => {
        if (userId) {
            loadSavedMovies();
        } else {
            setSavedMovies([]);
            setLoading(false);
        }
    }, [userId]);

    const loadSavedMovies = async () => {
        try {
            setLoading(true);
            const movies = await getSavedMovies(userId);
            setSavedMovies(movies);
        } catch (error) {
            console.error("Error loading saved movies:", error);
        } finally {
            setLoading(false);
        }
    };

    const addMovie = async (movie: Movie) => {
        if (!userId) {
            throw new Error('Please log in to save movies');
        }

        try {
            await saveMoveToAppwrite(movie, userId);
            await loadSavedMovies(); // Reload movies after saving
        } catch (error: any) {
            console.error("Error adding movie:", error);
            throw error;
        }
    };

    const removeMovie = async (id: number) => {
        if (!userId) {
            throw new Error('Please log in to remove movies');
        }

        try {
            await removeSavedMovie(id, userId);
            await loadSavedMovies(); // Reload movies after removing
        } catch (error: any) {
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