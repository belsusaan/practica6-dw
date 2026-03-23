"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const EsquemaReserva = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio."),
  correo: z.string().email("El correo no es válido."),
  fecha: z.string().min(1, "La fecha es obligatoria."),
  servicioId: z.coerce.number({ message: "Debe seleccionar un servicio." }),
});

// función para validar si la la hora y fecha está ocupada
export async function validarDisponibilidad(
  fechaRecibida: string,
  duracion: number,
) {
  const fechaBusqueda = new Date(fechaRecibida);
  const duracionReservada = duracion * 60 * 1000; // min a milisegundos
  return await prisma.reserva.findFirst({
    where: {
      fecha: {
        gte: new Date(fechaBusqueda.getTime() - duracionReservada), // busca x minutos antes en las reservas
        lte: new Date(fechaBusqueda.getTime() + duracionReservada), // busca 10 minutos despues en las reservas
      },
    },
  });
}

export async function crearReserva(_estadoPrevio: any, formData: FormData) {
  const campos = EsquemaReserva.safeParse({
    nombre: formData.get("nombre"),
    correo: formData.get("correo"),
    fecha: formData.get("fecha"),
    servicioId: formData.get("servicioId"),
  });

  if (!campos.success) {
    return {
      errores: campos.error.flatten().fieldErrors,
      mensaje: "Error de validación.",
    };
  }

  // obtener servicio
  const servicio = await prisma.servicio.findUnique({
    where: {
      id: campos.data?.servicioId,
    },
  });

  if (!servicio) {
    return {
      mensaje: "El servicio seleccionado no es válido",
    };
  }

  // validar fecha
  const ocupada = await validarDisponibilidad(
    campos.data.fecha,
    servicio.duracion,
  );

  if (ocupada) {
    return {
      mensaje: "No hay disponibilidad en esa fecha y hora.",
    };
  }

  await prisma.reserva.create({
    data: {
      nombre: campos.data.nombre,
      correo: campos.data.correo,
      fecha: new Date(campos.data.fecha),
      servicioId: campos.data.servicioId,
    },
  });

  revalidatePath("/reservas");
  redirect("/reservas");
}

export async function eliminarReserva(id: number) {
  try {
    await prisma.reserva.update({
      where: { id },
      data: {
        estado: "cancelada",
      },
    });
    revalidatePath("/reservas");
    return { exito: true };
  } catch {
    return { exito: false, mensaje: "No se pudo cancelar la reserva." };
  }
}

export async function confirmarReserva(id: number) {
  try {
    await prisma.reserva.update({
      where: { id },
      data: {
        estado: "confirmada",
      },
    });
    revalidatePath("/reservas");
    return { exito: true };
  } catch {
    return { exito: false, mensaje: "No se pudo confirmar la reserva" };
  }
}
