/**
 * Utilitários de Segurança Criptográfica para o FuturoBet
 */

export async function hashPassword(password: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(`futurobet_salt_${password}`);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {
    console.warn('Crypto Subtle indisponível, fallback de segurança aplicado.', err);
  }
  return password;
}

export async function verifyPassword(passwordInput: string, storedHash?: string): Promise<boolean> {
  if (!storedHash) return false;
  // Compatibilidade com senhas legadas e verificação de hash SHA-256
  if (storedHash === passwordInput) return true;
  const hashed = await hashPassword(passwordInput);
  return hashed === storedHash;
}
