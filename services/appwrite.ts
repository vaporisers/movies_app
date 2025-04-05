import { Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const TRENDING_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_TRENDING_COLLECTION_ID!;
const SAVED_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_SAVED_MOVIES_COLLECTION_ID!;

const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(
            DATABASE_ID,
            TRENDING_COLLECTION_ID
        );

        return result.documents.map(doc => ({
            movie_id: doc.movie_id,
            title: doc.title,
            poster_url: doc.poster_url
        }));
    } catch (error) {
        console.error("Error fetching trending movies:", error);
        return [];
    }
};

export const saveMoveToAppwrite = async (movie: Movie, userId: string) => {
    try {
        const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "https://placehold.co/600x400/1a1a1a/FFFFFF.png";

        await database.createDocument(
            DATABASE_ID,
            SAVED_COLLECTION_ID,
            ID.unique(),
            {
                user_id: userId,
                movie_id: movie.id,
                title: movie.title,
                poster_path: posterUrl,
                vote_average: parseFloat(movie.vote_average.toFixed(1)),
                release_date: movie.release_date,
                saved_at: new Date().toISOString()
            }
        );
    } catch (error) {
        console.error("Error saving movie:", error);
        throw error;
    }
};

export const removeSavedMovie = async (movieId: number, userId: string) => {
    try {
        const result = await database.listDocuments(
            DATABASE_ID,
            SAVED_COLLECTION_ID,
            [
                Query.equal("user_id", userId),
                Query.equal("movie_id", movieId)
            ]
        );

        if (result.documents.length > 0) {
            await database.deleteDocument(
                DATABASE_ID,
                SAVED_COLLECTION_ID,
                result.documents[0].$id
            );
        }
    } catch (error) {
        console.error("Error removing saved movie:", error);
        throw error;
    }
};

export const getSavedMovies = async (userId: string): Promise<Movie[]> => {
    try {
        const result = await database.listDocuments(
            DATABASE_ID,
            SAVED_COLLECTION_ID,
            [Query.equal("user_id", userId)]
        );

        return result.documents.map(doc => ({
            id: doc.movie_id,
            title: doc.title,
            poster_path: doc.poster_path.replace('https://image.tmdb.org/t/p/w500', ''),
            vote_average: doc.vote_average,
            release_date: doc.release_date
        }));
    } catch (error) {
        console.error("Error getting saved movies:", error);
        return [];
    }
};