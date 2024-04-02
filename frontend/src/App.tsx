import { Route, Routes, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import ToggleColorMode from "./components/ToggleColorMode";
import Server from "./pages/Server";
import Login from "./pages/Login";
import { AuthServiceProvider } from "./context/AuthContext";
import TestLogin from "./pages/TestLogin";
import ProtectedRoute from "./services/ProtectedRoute";
import Register from "./pages/Register";
import MembershipProvider from "./context/MembershipContext";
import MembershipCheck from "./components/Membership/MembershipCheck";

// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route>
//       <Route path="/" element={<Home />} />
//       <Route
//         path="/server/:serverId/:channelId?"
//         element={
//           <ProtectedRoute>
//             <Server />
//           </ProtectedRoute>
//         }
//       />
//       <Route path="/explore/:categoryName" element={<Explore />} />
//       <Route path="/login" element={<Login />} />
//       <Route
//         path="/testlogin"
//         element={
//           <ProtectedRoute>
//             <TestLogin />
//           </ProtectedRoute>
//         }
//       />
//     </Route>
//   )
// );

const App: React.FC = () => {
  // return (
  //   <AuthServiceProvider>
  //     <ToggleColorMode>
  //       <RouterProvider router={router} />
  //     </ToggleColorMode>
  //   </AuthServiceProvider>
  // );

  return (
    <BrowserRouter>
      <AuthServiceProvider>
        <ToggleColorMode>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/server/:serverId/:channelId?"
              element={
                <ProtectedRoute>
                  <MembershipProvider>
                    <MembershipCheck>
                      <Server />
                    </MembershipCheck>
                  </MembershipProvider>
                </ProtectedRoute>
              }
            />
            <Route path="/explore/:categoryName" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/testlogin"
              element={
                <ProtectedRoute>
                  <TestLogin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ToggleColorMode>
      </AuthServiceProvider>
    </BrowserRouter>
  );
};

export default App;
