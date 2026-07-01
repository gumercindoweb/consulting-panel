import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import ClientDashboard from "./pages/ClientDashboard";
import AdminPanel from "./pages/AdminPanel";
import AdminClientDetail from "./pages/AdminClientDetail";
import AcceptInvite from "./pages/AcceptInvite";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/invite/:token" component={AcceptInvite} />
      <Route path="/dashboard" component={ClientDashboard} />
      <Route path="/dashboard/:clientId" component={ClientDashboard} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/admin/clients/:clientId" component={AdminClientDetail} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "rgb(18,13,16)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgb(245,240,232)",
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
