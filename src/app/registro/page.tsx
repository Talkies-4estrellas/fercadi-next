import { redirect } from 'next/navigation';

// /registro está unificado en /login (formulario con tabs Login / Registro)
export default function RegistroRedirect() {
  redirect('/login');
}
