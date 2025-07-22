// src/components/ModalImagens.jsx
export default function ModalImagens({ imagens = [], imovel = {}, fechar }) {
  const {
    tipo,
    titulo,
    valor,
    area,
    quartos,
    suites,
    banheiros,
    vagas,
    descricao,
    rua,
    numero,
    cidade,
    bairro,
    complemento,
    cep,
  } = imovel;

  // Fallback seguro em base64
  const fallbackImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTBlMGUwIiAvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkltYWdlbSBubyBkaXNwb25pdmVsPC90ZXh0Pjwvc3ZnPg==";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-4xl w-full rounded-lg shadow-lg overflow-y-auto max-h-[90vh] relative">
        <button
          onClick={fechar}
          className="absolute top-3 right-4 text-red-600 text-2xl font-bold hover:text-red-800"
          aria-label="Fechar"
        >
          ✕
        </button>

        <div className="p-5">
          <h2 className="text-xl sm:text-2xl font-bold text-green-700 mb-4 text-center">
            {titulo || "Detalhes do Imóvel"}
          </h2>

          {/* Galeria de Imagens */}
          {imagens.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {imagens.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Imagem ${i + 1}`}
                  className="w-full h-56 object-cover rounded shadow"
                  onError={(e) => {
                    e.target.src = fallbackImage;
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mb-6">Nenhuma imagem disponível</p>
          )}

          {/* Informações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
            <p><span className="font-semibold">Tipo:</span> {tipo}</p>
            <p><span className="font-semibold">Valor:</span> R$ {valor}</p>
            <p><span className="font-semibold">Área:</span> {area} m²</p>
            <p><span className="font-semibold">Quartos:</span> {quartos}</p>
            <p><span className="font-semibold">Suítes:</span> {suites}</p>
            <p><span className="font-semibold">Banheiros:</span> {banheiros}</p>
            <p><span className="font-semibold">Vagas:</span> {vagas}</p>
            <p className="sm:col-span-2">
              <span className="font-semibold">Descrição:</span> {descricao || "Sem descrição"}
            </p>
            <p className="sm:col-span-2">
              <span className="font-semibold">Endereço:</span> {rua}, {numero} {complemento ? `- ${complemento}` : ""}
              <br />
              {bairro}, {cidade} - {cep}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}