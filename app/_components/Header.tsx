import Image from "next/image"

export default function Header() {
  return (
    <header className="bg-[#024728] h-[70px] flex items-center justify-between px-8">
      <Image src="/logo.svg" alt="Logo" width={150} height={50} />
      <button className="bg-[#008A4B] text-white font-bold py-2 px-6 rounded-lg">Iniciar sesión</button>
    </header>
  )
}

