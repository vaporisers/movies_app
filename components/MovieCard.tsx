import { Link } from "expo-router";
import { Text, Image, TouchableOpacity, View, ToastAndroid, Alert, Platform } from "react-native";
import { useContext } from "react";
import { icons } from "@/constants/icons";
import { SavedMoviesContext } from "@/context/SavedMoviesContext";

const MovieCard = ({ id, poster_path, title, vote_average, release_date }: Movie) => {
    const { savedMovies, addMovie, removeMovie } = useContext(SavedMoviesContext);
    const isSaved = savedMovies.some(movie => movie.id === id);

    const handleSave = () => {
        addMovie({ id, poster_path, title, vote_average, release_date });
        if (Platform.OS === 'android') {
            ToastAndroid.show("Movie Has Been Added To Watchlist", ToastAndroid.SHORT);
        } else {
            Alert.alert("Movie Has Been Added To Watchlist");
        }
    };

    const handleUnsave = () => {
        removeMovie(id);
        if (Platform.OS === 'android') {
            ToastAndroid.show("Movie Has Been Removed From Watchlist", ToastAndroid.SHORT);
        } else {
            Alert.alert("Movie Has Been Removed From Watchlist");
        }
    };

    return (
        <Link href={`/movies/${id}`} asChild>
            <TouchableOpacity className="w-28">
                <Image
                    source={{
                        uri: poster_path
                            ? `https://image.tmdb.org/t/p/w500${poster_path}`
                            : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
                    }}
                    className="w-full h-52 rounded-lg"
                    resizeMode="cover"
                />
                <TouchableOpacity onPress={isSaved ? handleUnsave : handleSave} className="absolute top-2 right-2">
                    <Image source={isSaved ? require('@/assets/icons/unsave.png') : require('@/assets/icons/save.png')} className="w-6 h-6" />
                </TouchableOpacity>
                <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
                    {title}
                </Text>
                <View className="flex-row items-center justify-start gap-x-1">
                    <Image source={icons.star} className="size-4" />
                    <Text className="text-xs text-white font-bold uppercase">{Math.round(vote_average / 2)}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-light-300 font-medium mt-1">
                        {release_date?.split('-')[0]}
                    </Text>
                    <Text className="text-xs font-medium text-light-300 uppercase">
                        Movie
                    </Text>
                </View>
            </TouchableOpacity>
        </Link>
    );
};

export default MovieCard;