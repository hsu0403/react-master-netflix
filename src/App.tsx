import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Components/Header";
import Home from "./Routes/Home";
import Search from "./Routes/Search";
import Tv from "./Routes/Tv";
import { QueryClient, QueryClientProvider } from "react-query";
import Footer from "./Components/Footer";

const client = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={client}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/movies/:movieId" element={<Home />} />
          <Route path="/popular_movies/:movieId" element={<Home />} />
          <Route path="/tv" element={<Tv />}></Route>
          <Route path="/tv/on_air/:tvId" element={<Tv />}></Route>
          <Route path="/tv/top_rated/:tvId" element={<Tv />}></Route>
          <Route path="/search" element={<Search />}></Route>
        </Routes>
        <Footer />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
