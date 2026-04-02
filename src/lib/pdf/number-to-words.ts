const UNIDADES = [
  "", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE",
  "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE",
  "DIECIOCHO", "DIECINUEVE", "VEINTE", "VEINTIUN", "VEINTIDOS", "VEINTITRES",
  "VEINTICUATRO", "VEINTICINCO", "VEINTISEIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE",
];

const DECENAS = [
  "", "", "", "TREINTA", "CUARENTA", "CINCUENTA",
  "SESENTA", "SETENTA", "OCHENTA", "NOVENTA",
];

const CENTENAS = [
  "", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
  "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS",
];

function convertirGrupo(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "CIEN";

  let result = "";

  if (n >= 100) {
    result += CENTENAS[Math.floor(n / 100)];
    n = n % 100;
    if (n > 0) result += " ";
  }

  if (n >= 30) {
    result += DECENAS[Math.floor(n / 10)];
    const u = n % 10;
    if (u > 0) result += " Y " + UNIDADES[u];
  } else if (n > 0) {
    result += UNIDADES[n];
  }

  return result;
}

export function numberToSpanishWords(amount: number): string {
  if (amount === 0) return "CERO PESOS M/CTE";

  const intPart = Math.floor(Math.abs(amount));

  if (intPart === 0) return "CERO PESOS M/CTE";

  let result = "";

  // Millones
  const millones = Math.floor(intPart / 1000000);
  if (millones > 0) {
    if (millones === 1) {
      result += "UN MILLON";
    } else {
      result += convertirGrupo(millones) + " MILLONES";
    }
  }

  // Miles
  const miles = Math.floor((intPart % 1000000) / 1000);
  if (miles > 0) {
    if (result) result += " ";
    if (miles === 1) {
      result += "MIL";
    } else {
      result += convertirGrupo(miles) + " MIL";
    }
  }

  // Unidades
  const unidades = intPart % 1000;
  if (unidades > 0) {
    if (result) result += " ";
    result += convertirGrupo(unidades);
  }

  return result + " PESOS M/CTE";
}
