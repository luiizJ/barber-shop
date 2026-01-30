"use client"
import { SearchIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { searchCategory } from "../constants/searchCategory"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form"
import Link from "next/link"

const BarberShopSchema = z.object({
  SearchbarberShop: z.string().trim().min(2, {
    message: "Digite pelo menos 2 caracteres",
  }),
})

const SearchbarberShops = () => {
  const form = useForm<z.infer<typeof BarberShopSchema>>({
    resolver: zodResolver(BarberShopSchema),
    defaultValues: {
      SearchbarberShop: "",
    },
  })

  const router = useRouter()

  const handleSearch = (data: z.infer<typeof BarberShopSchema>) => {
    router.push(`/barbershops?search=${data.SearchbarberShop}`)
  }

  return (
    <>
      {/*Busca*/}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)} className="flex gap-2">
          <FormField
            control={form.control}
            name="SearchbarberShop"
            render={({ field }) => (
              <FormItem className="item flex w-full flex-col">
                <FormControl>
                  <Input
                    placeholder="faça sua busca..."
                    {...field}
                    className="w-full p-3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">
            <SearchIcon />
          </Button>
        </form>
      </Form>

      {/*Busca Por Categoria*/}
      <div className="mt-6 flex gap-3 overflow-x-scroll [&::-webkit-scrollbar]:hidden">
        {searchCategory.map((category) => (
          <Button
            className="gap-2"
            variant="secondary"
            key={category.id}
            asChild
          >
            <Link href={`/barbershops?service=${category.title}`}>
              <Image
                src={category.imageUrl}
                alt={category.title}
                width={16}
                height={16}
              />
              <p>{category.title}</p>
            </Link>
          </Button>
        ))}
      </div>
    </>
  )
}
export default SearchbarberShops
