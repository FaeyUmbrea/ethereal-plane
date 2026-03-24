export function getGame() {
	if (!((game as ReadyGame) instanceof Game)) {
		throw new TypeError(
			'Initialized too early. You should never see this unless you are a developer.',
		);
	}
	return (game as ReadyGame);
}

export async function createMacro(name: string, command: string) {
	let folder: Folder | undefined = getGame().macros?.folders.find(
		folder => folder.name === 'Ethereal Plane',
	);
	if (folder === undefined) {
		folder = await Folder.create(
			{ type: 'Macro', name: 'Ethereal Plane' },
		);
	}
	if (folder) {
		// @ts-expect-error incorrect typing
		const macro = (await Macro.create({ name, command, type: 'script', folder, img: 'icons/svg/dice-target.svg' }));
		return macro;
	}
}
