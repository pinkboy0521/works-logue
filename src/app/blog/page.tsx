const articles = [
  { id: "1", title: "title1" },
  { id: "2", title: "title2" },
  { id: "3", title: "title3" },
];

async function fetchArticle() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return articles;
}

export default async function page() {
  const articles = await fetchArticle();
  return (
    <div>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            {article.id}: {article.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
