export default function Hero() {
  return (
    <div className="relative h-[759px] bg-black">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
        <h1 className="text-5xl font-bold text-center max-w-[611px] leading-tight mb-8">
          Descubre proyectos en venta y alquiler.
        </h1>
        <p className="text-xl text-center max-w-[350px] mb-8">
          Somos una empresa de manejo de propiedades.
        </p>
        <button className="bg-[#008A4B] hover:bg-[#006837] transition-colors text-white font-semibold py-3 px-6 rounded-lg">
          Ver proyectos
        </button>
      </div>
    </div>
  )
}

