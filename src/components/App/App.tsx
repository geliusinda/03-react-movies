import { useCallback, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import MovieModal from "../MovieModal/MovieModal";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import { fetchMovies } from "../../services/movieService";
import type { Movie } from "../../types/movie";
import css from "./App.module.css";

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const requestId = useRef(0);

  async function handleSearch(query: string) {
    const currentRequest = ++requestId.current;

    setMovies([]);
    setLoading(true);
    setError(false);
    setSelectedMovie(null);

    try {
      const results = await fetchMovies(query);

      if (currentRequest !== requestId.current) {
        return;
      }

      if (results.length === 0) {
        toast.error("No movies found for your request.");
      }

      setMovies(results);
    } catch {
      if (currentRequest === requestId.current) {
        setError(true);
      }
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }

  const closeModal = useCallback(() => {
    setSelectedMovie(null);
  }, []);

  return (
    <>
      <SearchBar onSubmit={handleSearch} />

      <main className={css.main}>
        {loading && <Loader />}
        {!loading && error && <ErrorMessage />}
        {!loading && !error && movies.length > 0 && (
          <MovieGrid movies={movies} onSelect={setSelectedMovie} />
        )}
      </main>

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={closeModal} />
      )}

      <Toaster position="top-right" />
    </>
  );
}
