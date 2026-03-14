import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { AppRouter } from "@/router";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRouter />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
