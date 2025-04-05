import { useContext } from "react";
import { View, Text, FlatList, Image, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SavedMoviesContext } from "@/context/SavedMoviesContext";
import MovieCard from "@/components/MovieCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

interface SavedMovie {
    id: number;
    poster_path: string;
    title: string;
    vote_average: number;
    release_date: string;
}

const Save = () => {
    const { savedMovies, loading } = useContext(SavedMoviesContext);

    if (loading) {
        return (
            <SafeAreaView className="bg-primary flex-1">
                <ActivityIndicator size="large" color="#fff" className="mt-20" />
            </SafeAreaView>
        );
    }

    const renderItem = ({ item }: { item: SavedMovie }) => (
        <MovieCard
            id={item.id}
            poster_path={item.poster_path}
            title={item.title}
            vote_average={item.vote_average}
            release_date={item.release_date}
        />
    );

    return (
        <SafeAreaView className="bg-primary flex-1">
            <Image
                source={images.bg}
                className="absolute w-full z-0"
                resizeMode="cover"
            />
            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
            >
                <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />
                <View className="flex justify-center items-start flex-1 flex-col gap-5">
                    <Text className="text-lg text-white font-bold mb-3">Watchlist</Text>
                    {savedMovies.length === 0 ? (
                        <Text className="text-gray-500 text-base self-center">No movies saved</Text>
                    ) : (
                        <FlatList
                            data={savedMovies as SavedMovie[]}
                            renderItem={renderItem}
                            keyExtractor={(item) => String(item.id)}
                            numColumns={3}
                            columnWrapperStyle={{
                                justifyContent: "flex-start",
                                gap: 20,
                                marginBottom: 10
                            }}
                            className="mt-2 pb-32"
                            scrollEnabled={false}
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Save;