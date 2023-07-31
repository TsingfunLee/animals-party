const playerColorNames = [
  'red', 'purple', 'indigo',
  'light-blue', 'teal', 'light-green',
  'yellow', 'orange', 'brown', 'blue-grey'
];

/** 取得玩家顏色 */
export function getPlayerColor({ codeName }: { codeName: string }) {
  if (!codeName.includes('P')) {
    return 'grey';
  }

  try {
    const index = parseInt(codeName.replaceAll('P', ''), 10) - 1;
    return playerColorNames?.[index] ?? 'grey';
  } catch (error) {
    return 'grey';
  }
}