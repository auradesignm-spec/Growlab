export function creatorHasPayoutAccount(account: {
  bankName: string;
  accountName: string;
  accountNumber: string;
}): boolean {
  const bank = account.bankName.trim();
  const name = account.accountName.trim();
  const number = account.accountNumber.replace(/\s+/g, "");
  return bank.length >= 2 && name.length >= 2 && number.length >= 6;
}
