import Image from "next/image";

export default async function ISRPage() {
  // 10秒ごとに更新
  const res = await fetch("https://dog.ceo/api/breeds/image/random", {
    next: { revalidate: 10 },
  });
  const resJson = await res.json();
  const image = resJson.message;

  return (
    <div>
      <Image src={image} width={400} alt="" />
    </div>
  );
}
