import 'server-only';
import { getActiveDruzyna } from './druzyny';
import { Rola } from './druzyny';

export async function requireRole(allowedRoles: Rola[]) {
  const druzyna = await getActiveDruzyna();
  if (!druzyna) throw new Error('Brak aktywnej drużyny.');
  
  if (!allowedRoles.includes(druzyna.rola)) {
    throw new Error('Brak uprawnień do wykonania tej akcji.');
  }
  
  return druzyna;
}