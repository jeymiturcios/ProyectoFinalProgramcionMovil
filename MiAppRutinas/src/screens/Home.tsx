import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { i18n, useLanguage } from "../contexts/LanguageContext";
import CustomButton from "../components/CustomButton";
import { translations } from "../translations/i18n";
import { TouchableOpacity } from "react-native-gesture-handler";

type Book = {
    id: string;
    title: string;
    author: string;
    genre: string;
    image_url: string;
};

export default function Home() {
    const { user } = useAuth();
    const { changeLanguage, language } = useLanguage();

    const books: Book[] = [
        {
            id: "100",
            image_url: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.goodreads.com%2Fbook%2Fshow%2F56916837-to-kill-a-mockingbird&psig=AOvVaw036T-ORpQ8aIciiTaxfQ5k&ust=1756682770650000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCMDVkrbXs48DFQAAAAAdAAAAABAW",
            title: "Cien años de soledad",
            author: "Gabriel García Márquez",
            genre: "Realismo mágico"
        },
        {
            id: "200",

            image_url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1612238791i/56916837.jpg",
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            genre: "Ficción clásica"
        },
        {
            id: "300",

            image_url: "https://example.com/images/the-pragmatic-programmer.jpg",
            title: "The Pragmatic Programmer",
            author: "Andrew Hunt y David Thomas",
            genre: "Tecnología / Software"
        },
        {
            id: "400",
            image_url: "https://example.com/images/el-nombre-del-viento.jpg",
            title: "El nombre del viento",
            author: "Patrick Rothfuss",
            genre: "Fantasía"
        }
    ];

    const renderItem = ({ item }: { item: Book }) =>
    (<TouchableOpacity style={styles.card}>
        <Image source={{ uri: item.image_url }} style={styles.image} />
        <View style={styles.info}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.author}>{item.author}</Text>
        </View>
    </TouchableOpacity>)


    return (
        <View>
            <Text style={{ fontWeight: "bold", color: "black", fontSize: 18 }}>
                Hola {user?.email}, {i18n.t('welcomeText')}</Text>
            <Text>Tu idioma actual de traduccion: {language}</Text>

            <View style={styles.translationsContainer}>
                <CustomButton title={"FR"}
                    onPress={() => changeLanguage("fr")}
                    variant={'primary'} />
                <CustomButton title={"EN"}
                    onPress={() => changeLanguage("en")}
                    variant={'primary'} />
                <CustomButton title={"ES"}
                    onPress={() => changeLanguage("es")}
                    variant={'primary'} />
            </View>

            <FlatList
                data={books}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    translationsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        height: 200,
    },
    list: {
        paddingHorizontal: 16
    },
    card: {flexDirection:'row',
        borderRadius: 8,
        marginVertical: 8,
        padding: 10,
        backgroundColor: 'pink'

    },
    info: {flexShrink: 1},
    title: {fontWeight:'bold', fontSize: 16},
    author: {color:'dark-grey'},
    image: {
        width: 80,
        height: 120,
    }
})