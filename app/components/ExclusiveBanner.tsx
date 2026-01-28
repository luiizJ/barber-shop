import Image from "next/image"

const EclusiveBanner = () => {
  return (
    <div className="relative mt-6 h-[150px] w-full">
      <Image
        src="/img1.png"
        alt="Agende conosco"
        fill
        className="rounded-2xl object-cover"
      />
    </div>
  )
}

export default EclusiveBanner
