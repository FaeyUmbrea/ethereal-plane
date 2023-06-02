export function getGame() {
  if (!(game instanceof Game))
    throw new Error('Initialized too early. You should never see this unless you are a developer.');
  return game;
}
