export const LIMITE_CENTAVOS = Number.MAX_SAFE_INTEGER

export function validarCentavos(valor: number) {
  if (!Number.isSafeInteger(valor)) {
    throw new Error('O valor ou total excede o limite monetário seguro.')
  }
}

// A entrada decimal é interpretada como texto, sem arredondamento implícito.
export function converterParaCentavos(entrada: string): number {
  const partes = /^(\d+)(?:\.(\d{1,2}))?$/.exec(entrada.trim())
  if (!partes) {
    throw new Error('Informe um valor positivo com no máximo duas casas decimais.')
  }
  const centavos = BigInt(partes[1]) * 100n + BigInt((partes[2] ?? '').padEnd(2, '0'))
  if (centavos <= 0n || centavos > BigInt(LIMITE_CENTAVOS)) {
    throw new Error('Informe um valor entre R$ 0,01 e R$ 90.071.992.547.409,91.')
  }
  return Number(centavos)
}

export function centavosParaEntrada(valor: number): string {
  validarCentavos(valor)
  const absoluto = BigInt(Math.abs(valor))
  return `${absoluto / 100n}.${String(absoluto % 100n).padStart(2, '0')}`
}

export function somarCentavos(a: number, b: number): number {
  validarCentavos(a)
  validarCentavos(b)
  const soma = BigInt(a) + BigInt(b)
  if (soma > BigInt(LIMITE_CENTAVOS) || soma < -BigInt(LIMITE_CENTAVOS)) {
    throw new Error('O valor ou total excede o limite monetário seguro.')
  }
  return Number(soma)
}
