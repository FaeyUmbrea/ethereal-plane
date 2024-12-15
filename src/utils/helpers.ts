export function getGame() {
	if (!(game instanceof Game)) {
		throw new TypeError(
			'Initialized too early. You should never see this unless you are a developer.',
		);
	}
	return game;
}
