type Params = {
  params: Promise<{
    id: string;
  }>;
};

export default async function page({ params }: Params) {
  const { id } = await params;
  return <div>blog id: {id}</div>;
}
