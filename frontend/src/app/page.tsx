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

export default function Home() {
  return (
    <div>
      <h1>Works Logue</h1>
      <p>
        私たち人間は、何千年も前から働き続け、知恵や失敗から学びながら、一歩ずつ前へ進んできました。
        目立たない工夫、小さな成功、人知れぬ挫折――それらすべてが、いま働く私たちにとっての貴重な財産です。
        しかし、現代の仕事の知恵はどうでしょうか？
        企業の公式メディアは「きれいごと」ばかりを語り、SNSには「誇張された成功」が溢れています。本当に私たちが知りたい「現場のリアルな突破口」は、誰かの脳内か、居酒屋の愚痴の中に消えてしまっています。
        Works Logueは、その「消えていく知恵」を救い出す場所です。
        「この悩み、自分だけじゃないんだ」という共感から、
        「そうか、こうすれば良かったんだ」という解決へ。
        あなたの経験は、もはやあなただけのものではありません。
        誰かの失敗が、別の誰かの地雷を避け、誰かの工夫が、別の誰かの定時退社を実現する。
        「読む、知る、試す、そして世界をアップデートする。」
        あなたの知恵が、日本のビジネスを動かす力になる。 Works Logueへようこそ。
      </p>
      <a href="/login" className="button login">
        Log In
      </a>
    </div>
  );
}
