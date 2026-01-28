import { SearchIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { searchCategory } from "../constants/searchCategory"
import Image from "next/image"

const SearchBarberShops = () => {
  return (
    <>
      {/*Busca*/}
      <div className="mt-6 flex items-center gap-2">
        <Input placeholder="faça sua busca" />
        <Button>
          <SearchIcon />
        </Button>
      </div>
      {/*Busca Por Categoria*/}
      <div className="mt-6 flex gap-3 overflow-x-scroll [&::-webkit-scrollbar]:hidden">
        {searchCategory.map((category) => (
          <Button className="gap-2" variant="secondary" key={category.id}>
            <Image
              src={category.imageUrl}
              alt={category.title}
              width={16}
              height={16}
            />
            <p>{category.title}</p>
          </Button>
        ))}
      </div>
    </>
  )
}
export default SearchBarberShops
