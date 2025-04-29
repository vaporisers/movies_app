import { Client, Databases, ID, Query, Account, Models } from "react-native-appwrite";

interface TrendingMovie {
    movie_id: number;
    title: string;
    poster_url: string;
    searchTerm: string;
    count: number;
}

interface Movie {
    id: number;
    title: string;
    poster_path: string;
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

type AppwriteDocument = Models.Document & {
    movie_id: number;
    title: string;
    poster_url: string;
    searchTerm: string;
    count: number;
    user_id?: string;
    poster_path?: string;
    vote_average?: number;
    release_date?: string;
    saved_at?: string;
};

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const TRENDING_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_TRENDING_COLLECTION_ID!;
const SAVED_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_SAVED_MOVIES_COLLECTION_ID!;

const client = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);
const account = new Account(client);

export const getUser = async (): Promise<Models.User<Models.Preferences> | null> => {
    try {
        const user = await account.get();
        return user || null;
    } catch (error: any) {
        if (error.message.includes("missing scope") || error.message.includes("Missing session")) {
            return null;
        }
        throw error;
    }
};

export const loginUser = async (email: string, password: string): Promise<Models.User<Models.Preferences>> => {
    try {
        // Create a session for the user using email and password
        await account.createEmailPasswordSession(email, password);

        // Fetch the authenticated user
        const user = await account.get();
        if (!user?.$id) {
            throw new Error("Failed to fetch user data after login");
        }

        return user;
    } catch (error: any) {
        console.error("Login error:", error);

        if (error.message.includes("Rate limit")) {
            throw new Error("Too many login attempts. Please try again later.");
        }

        if (error.message.includes("Invalid credentials")) {
            throw new Error("Invalid email or password");
        }

        throw new Error("Login failed. Please try again later.");
    }
};

export const registerUser = async (email: string, password: string, name: string): Promise<Models.User<Models.Preferences>> => {
    try {
        const userId = ID.unique();
        const user = await account.create(userId, email, password, name);

        if (!user?.$id) {
            throw new Error("Failed to create user");
        }

        // Automatically log in the user after registration
        await account.createEmailPasswordSession(email, password);

        return user;
    } catch (error: any) {
        console.error("Registration error:", error);
        if (error.message.includes("already exists")) {
            throw new Error("An account with this email already exists");
        }
        throw new Error("Registration failed. Please try again later.");
    }
};

export const logoutUser = async (): Promise<void> => {
    try {
        await account.deleteSession("current");
    } catch (error: any) {
        console.error("Logout error:", error);
        throw new Error("Logout failed. Please try again later.");
    }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[]> => {
    try {
        const result = await database.listDocuments<AppwriteDocument>(
            DATABASE_ID,
            TRENDING_COLLECTION_ID
        );

        return result.documents.map((doc) => ({
            movie_id: doc.movie_id,
            title: doc.title,
            poster_url: doc.poster_url,
            searchTerm: doc.searchTerm,
            count: doc.count,
        }));
    } catch (error: any) {
        console.error("Error fetching trending movies:", error.message);
        return [];
    }
};

export const updateSearchCount = async (searchTerm: string, movie: Movie) => {
    try {
        const existingDoc = await database.listDocuments<AppwriteDocument>(
            DATABASE_ID,
            TRENDING_COLLECTION_ID,
            [Query.equal("searchTerm", searchTerm), Query.equal("movie_id", movie.id)]
        );

        if (existingDoc.documents.length > 0) {
            const doc = existingDoc.documents[0];
            await database.updateDocument(DATABASE_ID, TRENDING_COLLECTION_ID, doc.$id, {
                count: doc.count + 1,
            });
        } else {
            await database.createDocument(DATABASE_ID, TRENDING_COLLECTION_ID, ID.unique(), {
                movie_id: movie.id,
                title: movie.title,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                searchTerm,
                count: 1,
            });
        }
    } catch (error: any) {
        console.error("Error updating search count:", error.message);
    }
};

export const saveMoveToAppwrite = async (movie: Movie, userId: string): Promise<void> => {
    if (!userId) throw new Error("User ID is required to save movies");

    try {
        const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "https://placehold.co/600x400/1a1a1a/FFFFFF.png";

        await database.createDocument(DATABASE_ID, SAVED_COLLECTION_ID, ID.unique(), {
            movie_id: movie.id,
            title: movie.title,
            poster_path: posterUrl,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
            user_id: userId,
            saved_at: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error("Error saving movie:", error.message);
        throw new Error("Failed to save movie. Please try again later.");
    }
};

export const removeSavedMovie = async (movieId: number, userId: string): Promise<void> => {
    if (!userId) throw new Error("User ID is required to remove saved movies");

    try {
        const result = await database.listDocuments<AppwriteDocument>(
            DATABASE_ID,
            SAVED_COLLECTION_ID,
            [Query.equal("user_id", userId), Query.equal("movie_id", movieId)]
        );

        if (result.documents.length > 0) {
            await database.deleteDocument(DATABASE_ID, SAVED_COLLECTION_ID, result.documents[0].$id);
        }
    } catch (error: any) {
        console.error("Error removing saved movie:", error.message);
        throw new Error("Failed to remove movie. Please try again later.");
    }
};

export const getSavedMovies = async (userId: string): Promise<Movie[]> => {
    if (!userId) return [];

    try {
        const result = await database.listDocuments<AppwriteDocument>(
            DATABASE_ID,
            SAVED_COLLECTION_ID,
            [Query.equal("user_id", userId), Query.orderDesc("saved_at")]
        );

        return result.documents.map((doc) => ({
            id: doc.movie_id,
            title: doc.title,
            poster_path: doc.poster_path!.replace("https://image.tmdb.org/t/p/w500", ""),
            vote_average: doc.vote_average ?? 0,
            release_date: doc.release_date ?? "",
            adult: false,
            backdrop_path: "",
            genre_ids: [],
            original_language: "",
            original_title: "",
            overview: "",
            popularity: 0,
            video: false,
            vote_count: 0,
        }));
    } catch (error: any) {
        console.error("Error getting saved movies:", error.message);
        return [];
    }
};