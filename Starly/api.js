const OMDB_API_KEY = 'e3b580eb'; 
const OMDB_BASE_URL = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}`;

/**
 * Recherche un film par titre via l'API OMDb.
 * @param {string} title - Le titre du film à rechercher.
 * @returns {Promise<Array<object>>} Une liste de films.
 */
export async function searchMoviesByTitle(title) {
    if (OMDB_API_KEY === 'VOTRE_CLE_OMDB') {
        console.error("Veuillez remplacer 'VOTRE_CLE' dans api.js par votre clé OMDb.");
        // Retourne un résultat vide pour éviter le crash
        return [];
    }

    try {
        // Recherche par titre (s=search)
        const response = await fetch(`${OMDB_BASE_URL}&s=${encodeURIComponent(title)}`);
        const data = await response.json();

        if (data.Response === "True") {
            // L'API OMDb retourne un tableau de films dans la propriété Search
            return data.Search.filter(film => film.Type === 'movie'); // Filtre pour n'avoir que les films
        } else {
            console.log("OMDb Search Error:", data.Error);
            return [];
        }
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API OMDb (search):", error);
        return [];
    }
}

/**
 * Récupère les détails complets d'un film par son ID IMDB.
 * @param {string} imdbID - L'ID IMDB du film.
 * @returns {Promise<object|null>} Les détails du film.
 */
export async function getMovieDetails(imdbID) {
    if (OMDB_API_KEY === 'VOTRE_CLE_OMDB') {
        return null;
    }

    try {
        // Recherche par ID IMDB (i=imdbID)
        const response = await fetch(`${OMDB_BASE_URL}&i=${imdbID}&plot=full`);
        const data = await response.json();

        if (data.Response === "True") {
            return data;
        } else {
            console.log("OMDb Details Error:", data.Error);
            return null;
        }
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API OMDb (details):", error);
        return null;
    }
}