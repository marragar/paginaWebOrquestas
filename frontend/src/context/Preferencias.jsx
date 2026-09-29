// Preferencias de la persona: idioma y apariencia (clara, oscura o la del sistema).
// Se recuerdan en este navegador con localStorage.
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import es from '../i18n/es.js'
import en from '../i18n/en.js'
import gl from '../i18n/gl.js'
import * as formato from '../utilidades/formato.js'

export const IDIOMAS = {
  es: { nombre: 'Español', locale: 'es-ES', textos: es },
  en: { nombre: 'English', locale: 'en-GB', textos: en },
  gl: { nombre: 'Galego', locale: 'gl-ES', textos: gl },
}

export const TEMAS = ['sistema', 'claro', 'oscuro']

function leer(clave) {
  try {
    return localStorage.getItem(clave)
  } catch {
    return null
  }
}

function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, valor)
  } catch {
    // sin almacenamiento (modo privado, etc.): la preferencia dura solo esta visita
  }
}

function idiomaInicial() {
  const guardado = leer('idioma')
  if (guardado in IDIOMAS) return guardado
  const delNavegador = (navigator.language || 'es').slice(0, 2)
  return delNavegador in IDIOMAS ? delNavegador : 'es'
}

function temaInicial() {
  const guardado = leer('tema')
  return TEMAS.includes(guardado) ? guardado : 'sistema'
}

// Busca 'a.b.c' dentro del diccionario
function buscar(textos, clave) {
  return clave.split('.').reduce((obj, parte) => obj?.[parte], textos)
}

// Sustituye {variables}; si el texto es { uno, otros } elige según vars.n
function traducir(textos, clave, vars = {}) {
  let texto = buscar(textos, clave) ?? buscar(es, clave) ?? clave
  if (texto && typeof texto === 'object' && 'otros' in texto) {
    texto = vars.n === 1 ? texto.uno : texto.otros
  }
  if (typeof texto !== 'string') return texto
  return texto.replace(/\{(\w+)\}/g, (_, v) => (vars[v] ?? `{${v}}`))
}

const PreferenciasContext = createContext(null)

export function PreferenciasProvider({ children }) {
  const [idioma, setIdiomaEstado] = useState(idiomaInicial)
  const [tema, setTemaEstado] = useState(temaInicial)

  useEffect(() => {
    document.documentElement.lang = idioma
    document.title = traducir(IDIOMAS[idioma].textos, 'app.titulo')
  }, [idioma])

  useEffect(() => {
    const raiz = document.documentElement
    if (tema === 'sistema') raiz.removeAttribute('data-tema')
    else raiz.setAttribute('data-tema', tema)
  }, [tema])

  const valor = useMemo(() => {
    const { locale, textos } = IDIOMAS[idioma]
    return {
      idioma,
      tema,
      locale,
      setIdioma: (i) => {
        setIdiomaEstado(i)
        guardar('idioma', i)
      },
      setTema: (t) => {
        setTemaEstado(t)
        guardar('tema', t)
      },
      t: (clave, vars) => traducir(textos, clave, vars),
    }
  }, [idioma, tema])

  return <PreferenciasContext.Provider value={valor}>{children}</PreferenciasContext.Provider>
}

// Textos traducidos: const { t } = useTextos(); t('nav.buscar')
export function useTextos() {
  return useContext(PreferenciasContext)
}

// Fechas y dinero en el idioma elegido
export function useFormato() {
  const { locale, t } = useContext(PreferenciasContext)
  return useMemo(
    () => ({
      fechaLarga: (f) => formato.fechaLarga(f, locale),
      fechaCorta: (f) => formato.fechaCorta(f, locale),
      mesCorto: (f) => formato.mesCorto(f, locale),
      semanaCorta: (f) => formato.semanaCorta(f, locale),
      mesYAnio: (f) => formato.mesYAnio(f, locale),
      diaSemanaLargo: (f) => formato.diaSemanaLargo(f, locale),
      euros: (c) => formato.euros(c, locale) ?? t('comun.precioConsultar'),
    }),
    [locale, t],
  )
}
