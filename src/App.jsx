import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home";

const App = () => {
  return (
    <div className="bg-gray-950 min-h-screen">
      <Navbar />
      <Home />
      <Footer />
    </div>
  );
};

export default App;
