export default function ProjectList() {
  return (
    <section className="py-16 px-8">
      <h2 className="font-instrumentSans font-bold text-4xl text-center mb-12">Nuestros Proyectos</h2>
      
      {/* Mobile layout (1x4) */}
      <div className="container mx-auto sm:hidden flex flex-col space-y-6">
        <ProjectCard 
          image="/proyectos-propiedades.png"
          title="Propiedades"
          className="h-[300px]"
        />
        <ProjectCard 
          image="/proyectos-residenciales.png"
          title="Residenciales"
          className="h-[300px]"
        />
        <ProjectCard 
          image="/proyectos-centros-operaciones.png"
          title="Centros de operaciones"
          className="h-[300px]"
        />
        <ProjectCard 
          image="/proyectos-plazas-comerciales.png"
          title="Plazas comerciales"
          className="h-[300px]"
        />
      </div>

      {/* Tablet layout (2x2) */}
      <div className="hidden sm:grid lg:hidden container mx-auto grid-cols-2 gap-6">
        <ProjectCard 
          image="/proyectos-propiedades.png"
          title="Propiedades"
          className="h-[350px]"
        />
        <ProjectCard 
          image="/proyectos-residenciales.png"
          title="Residenciales"
          className="h-[350px]"
        />
        <ProjectCard 
          image="/proyectos-centros-operaciones.png"
          title="Centros de operaciones"
          className="h-[350px]"
        />
        <ProjectCard 
          image="/proyectos-plazas-comerciales.png"
          title="Plazas comerciales"
          className="h-[350px]"
        />
      </div>

      {/* Large screen layout (complex with smaller text) */}
      <div className="hidden lg:grid xl:hidden container mx-auto grid-cols-12 gap-6">
        {/* Left column - Propiedades */}
        <div className="col-span-4 relative h-[488px]">
          <div className="relative w-full h-full">
            <img
              src="/proyectos-propiedades.png"
              alt="Propiedades"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
            <h3 className="absolute top-4 left-6 text-white font-instrumentSans font-bold text-2xl">Propiedades</h3>
          </div>
        </div>

        {/* Middle column - Residenciales */}
        <div className="col-span-3 relative h-[488px]">
          <div className="relative w-full h-full">
            <img src="/proyectos-residenciales.png" alt="Residenciales" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20"></div>
            <h3 className="absolute bottom-6 left-4 text-white font-instrumentSans font-bold text-2xl">
              Residenciales
            </h3>
          </div>
        </div>

        {/* Right column - Stacked images */}
        <div className="col-span-5 space-y-6">
          <div className="relative h-[198px]">
            <div className="relative w-full h-full">
              <img src="/proyectos-centros-operaciones.png" alt="Centros de operaciones" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20"></div>
              <h3 className="absolute top-12 left-6 text-white font-instrumentSans font-bold text-2xl leading-tight">
                Centros de
                <br />
                operaciones
              </h3>
            </div>
          </div>
          <div className="relative h-[270px]">
            <div className="relative w-full h-full">
              <img src="/proyectos-plazas-comerciales.png" alt="Plazas comerciales" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20"></div>
              <h3 className="absolute bottom-6 left-6 text-white font-instrumentSans font-bold text-2xl">
                Plazas comerciales
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* XL screen layout (original size) */}
      <div className="hidden xl:grid container mx-auto grid-cols-12 gap-6">
        {/* Left column - Propiedades */}
        <div className="col-span-4 relative h-[488px]">
          <div className="relative w-full h-full">
            <img
              src="/proyectos-propiedades.png"
              alt="Propiedades"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
            <h3 className="absolute top-4 left-6 text-white font-instrumentSans font-bold text-[35px]">Propiedades</h3>
          </div>
        </div>

        {/* Middle column - Residenciales */}
        <div className="col-span-3 relative h-[488px]">
          <div className="relative w-full h-full">
            <img src="/proyectos-residenciales.png" alt="Residenciales" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20"></div>
            <h3 className="absolute bottom-6 left-4 text-white font-instrumentSans font-bold text-[35px]">
              Residenciales
            </h3>
          </div>
        </div>

        {/* Right column - Stacked images */}
        <div className="col-span-5 space-y-6">
          <div className="relative h-[198px]">
            <div className="relative w-full h-full">
              <img src="/proyectos-centros-operaciones.png" alt="Centros de operaciones" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20"></div>
              <h3 className="absolute top-12 left-6 text-white font-instrumentSans font-bold text-[35px] leading-tight">
                Centros de
                <br />
                operaciones
              </h3>
            </div>
          </div>
          <div className="relative h-[270px]">
            <div className="relative w-full h-full">
              <img src="/proyectos-plazas-comerciales.png" alt="Plazas comerciales" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20"></div>
              <h3 className="absolute bottom-6 left-6 text-white font-instrumentSans font-bold text-[35px]">
                Plazas comerciales
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Componente reutilizable para las cards
function ProjectCard({ image, title, className = "" }: { image: string, title: string, className?: string }) {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative w-full h-full">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20"></div>
        <h3 className="absolute bottom-6 left-6 text-white font-instrumentSans font-bold text-2xl lg:text-[28px] xl:text-[35px]">
          {title}
        </h3>
      </div>
    </div>
  )
}

