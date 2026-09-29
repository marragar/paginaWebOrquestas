// Iconos en SVG en línea. Heredan el color del texto (currentColor).

export function IconoTelefono(props) {
  return (
    <svg viewBox="0 0 24 24" className="boton-icono" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1l-2.22 2.23Z"
      />
    </svg>
  )
}

export function IconoWhatsapp(props) {
  return (
    <svg viewBox="0 0 24 24" className="boton-icono" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3 .78.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.17.25-.64.8-.78.97-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-3.34-2.92c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.43l-.75-1.8c-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.7 2.7 0 0 0-.85 2.03 4.7 4.7 0 0 0 1 2.5 10.8 10.8 0 0 0 4.13 3.65c1.54.66 2.14.72 2.9.6.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.15-1.17-.06-.1-.22-.16-.47-.28Z"
      />
    </svg>
  )
}

export function IconoAjustes(props) {
  return (
    <svg viewBox="0 0 24 24" className="boton-icono" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6a.5.5 0 0 0 .1-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.5 1a7.3 7.3 0 0 0-1.7-1L14.4 2.4a.5.5 0 0 0-.5-.4h-4a.5.5 0 0 0-.5.4L9 5.1a7.6 7.6 0 0 0-1.7 1l-2.5-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .1.64L4.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6a.5.5 0 0 0-.1.64l2 3.46c.13.22.39.3.6.22l2.5-1c.52.4 1.09.74 1.7 1l.4 2.68c.04.24.25.4.5.4h4c.25 0 .46-.16.5-.4l.4-2.68a7.6 7.6 0 0 0 1.7-1l2.5 1c.22.08.48 0 .6-.22l2-3.46a.5.5 0 0 0-.1-.64L19.4 13ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"
      />
    </svg>
  )
}

export function IconoMenu({ abierto, ...props }) {
  return (
    <svg viewBox="0 0 24 24" className="boton-icono" aria-hidden="true" {...props}>
      {abierto ? (
        <path stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
      ) : (
        <path stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  )
}

// Enlace para abrir WhatsApp con un texto ya escrito (funciona en móvil y en WhatsApp Web)
export function enlaceWhatsapp(texto) {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`
}

// "987 123 456" -> "tel:+34987123456"
export function enlaceTelefono(telefono) {
  const digitos = telefono.replace(/\D/g, '')
  return `tel:${digitos.length === 9 ? `+34${digitos}` : digitos}`
}
