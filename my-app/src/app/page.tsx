import ProductList from "@/components/ProductList";
import Image from "next/image";

const Home = async({searchParams}: {searchParams: Promise<{category: string}>}) => {
  const category = (await searchParams).category
  return (
    <div>
      <div className="relative aspect-3/1 mb-10">
        <Image src={'/Hero.jpeg'} alt="hero" fill/>
      </div>
      <ProductList category={category} params="homepage"/>
    </div>
  );
}

export default Home;
