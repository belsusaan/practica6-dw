"use client";

import { useState } from "react";
import { botonSecundario } from "../lib/estilo";
import { confirmarReserva } from "../actions/reservas";

export function BotonConfirmarReserva({ id }: { id: number }) {
  const [error, setError] = useState<string | null>(null);

  async function manejarClick() {
    const resultado = await confirmarReserva(id);
    if (!resultado.exito) {
      setError(resultado.mensaje ?? "Error desconocido.");
    }
  }

  return (
    <div className="text-right shrink-0 ml-4">
      <button onClick={manejarClick} className={botonSecundario}>
        Confirmar
      </button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
