// import LoginButton from "@/components/LoginButton";
// import LogoutButton from "@/components/LogoutButton";
// import Profile from "@/components/Profile";
// import { auth0 } from "@/shared/config/auth0";

// export default async function Home() {
//   const session = await auth0.getSession();
//   const user = session?.user;

//   return (
//     <div className="app-container">
//       <div className="main-card-wrapper">
//         <h1 className="main-title">Works Logue</h1>
//         <div className="action-card">
//           {user ? (
//             <div className="logged-in-section">
//               <p className="logged-in-message">✅ Successfully logged in!</p>
//               <Profile />
//               <LogoutButton />
//             </div>
//           ) : (
//             <>
//               <LoginButton />
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg">Redirecting...</div>
    </div>
  );
}
