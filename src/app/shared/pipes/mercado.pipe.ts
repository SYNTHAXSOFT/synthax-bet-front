import { Pipe, PipeTransform } from '@angular/core';

/**
 * Traduce los nombres técnicos de mercados de apuestas a términos
 * más comprensibles en español para el apostador.
 *
 * Transformaciones aplicadas (en orden de prioridad):
 *   "No Clean Sheet ..." → "Sí recibe goles ..."
 *   "Clean Sheet ..."    → "No recibe goles ..."
 *   "Win to Nil Local"   → "Local gana sin recibir goles"
 *   "Win to Nil Visitante" → "Visitante gana sin recibir goles"
 *   "Over X.X"           → "Más de X.X"   (en cualquier posición)
 *   "Under X.X"          → "Menos de X.X" (en cualquier posición)
 *
 * Uso en template: {{ linea.mercado | mercado }}
 */
@Pipe({
  name: 'mercado',
  standalone: true,
  pure: true,
})
export class MercadoPipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    if (!value) return '';

    let resultado = value;

    // 1. No Clean Sheet → Sí recibe goles (ANTES que Clean Sheet para no solapar)
    resultado = resultado.replace(/No Clean Sheet Local/gi,     'Sí recibe goles (Local)');
    resultado = resultado.replace(/No Clean Sheet Visitante/gi, 'Sí recibe goles (Visitante)');
    resultado = resultado.replace(/No Clean Sheet/gi,           'Sí recibe goles');

    // 2. Clean Sheet → No recibe goles
    resultado = resultado.replace(/Clean Sheet Local/gi,        'No recibe goles (Local)');
    resultado = resultado.replace(/Clean Sheet Visitante/gi,    'No recibe goles (Visitante)');
    resultado = resultado.replace(/Clean Sheet/gi,              'No recibe goles');

    // 3. Win to Nil
    resultado = resultado.replace(/Win to Nil Local/gi,     'Local gana sin recibir goles');
    resultado = resultado.replace(/Win to Nil Visitante/gi, 'Visitante gana sin recibir goles');

    // 4. Over / Under (pueden aparecer al inicio, en medio o al final del nombre)
    resultado = resultado.replace(/\bOver\b/gi,  'Más de');
    resultado = resultado.replace(/\bUnder\b/gi, 'Menos de');

    return resultado;
  }
}
