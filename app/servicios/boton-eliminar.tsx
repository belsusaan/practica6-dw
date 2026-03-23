"use client";
import { useState } from "react";
import { botonPeligro } from "../lib/estilo";
import { eliminarServicio } from "../actions/servicio";

export function BotonEliminarServicio({ id }: { id: number }) {
  const [error, setError] = useState<string | null>(null);
  async function manejarClick() {
    const resultado = await eliminarServicio(id);
    if (!resultado.exito) {
      setError(resultado.mensaje ?? "Error desconocido.");
    }
  }

  return (
    <div className="text-right">
      <button onClick={manejarClick} className={botonPeligro}>
        Eliminar
      </button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
