import "./layout.scss";
import Navbar from "../../components/navbar/Navbar";
import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useEffect, useState } from "react";

function Layout() {
  return (
    <div className="layout">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

// function RequireAuth() {
//   const { currentUser } = useContext(AuthContext);

//   if (!currentUser) return <Navigate to="/login" />;
//   else {
//     return (
//       <div className="layout">
//         <div className="navbar">
//           <Navbar />
//         </div>
//         <div className="content">
//           <Outlet />
//         </div>
//       </div>
//     );
//   }
// }

function RequireAuth() {
  const { currentUser } = useContext(AuthContext);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // allow React + localStorage to hydrate
    setChecking(false);
  }, []);

  // wait one render cycle
  if (checking) return null;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}


export { Layout, RequireAuth };
